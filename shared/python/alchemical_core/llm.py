"""
Alchemical Agent Ecosystem — KiloCode AI Integration
=====================================================
Unified LLM client using KiloCode AI Gateway (api.kilo.ai).
OpenAI-compatible, supports streaming, tool calling, vision,
structured output, and batch processing.

Usage::

    from alchemical_core.llm import AlchemicalLLM, LLMConfig

    llm = AlchemicalLLM()
    response = await llm.chat("What is the philosopher's stone?")

    # Streaming
    async for chunk in llm.stream("Explain alchemy step by step"):
        print(chunk, end="", flush=True)

    # Module-level singleton helpers
    from alchemical_core.llm import get_llm, quick_chat
    answer = await quick_chat("What is transmutation?")
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import threading
import time
from dataclasses import dataclass, field
from typing import Any, AsyncGenerator, ClassVar, Dict, List, Optional, Union

import httpx
import openai
from openai import AsyncOpenAI, AuthenticationError, RateLimitError, APIStatusError

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Custom exceptions
# ---------------------------------------------------------------------------


class KiloAPIError(Exception):
    """Base exception for KiloCode API errors."""

    def __init__(self, message: str, status_code: Optional[int] = None, cause: Optional[Exception] = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.cause = cause

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}({self.args[0]!r}, status_code={self.status_code})"


class KiloAuthError(KiloAPIError):
    """Raised when authentication with the KiloCode API fails (401/403)."""


class KiloRateLimitError(KiloAPIError):
    """Raised when the KiloCode API rate-limits the request (429)."""


def _wrap_openai_error(exc: Exception) -> KiloAPIError:
    """Convert an openai exception into a typed KiloAPIError."""
    if isinstance(exc, AuthenticationError):
        return KiloAuthError(str(exc), status_code=401, cause=exc)
    if isinstance(exc, RateLimitError):
        return KiloRateLimitError(str(exc), status_code=429, cause=exc)
    status_code: Optional[int] = None
    if isinstance(exc, APIStatusError):
        status_code = exc.status_code
    return KiloAPIError(str(exc), status_code=status_code, cause=exc)


# ---------------------------------------------------------------------------
# LLMConfig
# ---------------------------------------------------------------------------


@dataclass
class LLMConfig:
    """Configuration for the KiloCode AI Gateway client.

    All fields default to values read from environment variables so that
    the client can be constructed with zero arguments in most deployments.
    """

    api_key: str = field(default_factory=lambda: os.getenv("KILO_API_KEY", ""))
    """Bearer token for the KiloCode API.  Empty string is allowed — required
    only when using non-free models."""

    base_url: str = field(
        default_factory=lambda: os.getenv(
            "KILO_BASE_URL", "https://api.kilo.ai/api/gateway"
        )
    )
    """Root URL of the KiloCode OpenAI-compatible gateway."""

    default_model: str = field(
        default_factory=lambda: os.getenv(
            "KILO_DEFAULT_MODEL", "anthropic/claude-sonnet-4.5"
        )
    )
    """Model ID used when no model is explicitly provided to a call."""

    max_tokens: int = 4096
    """Maximum tokens in the completion response."""

    temperature: float = 0.7
    """Sampling temperature."""

    timeout: float = 120.0
    """HTTP timeout in seconds."""

    org_id: Optional[str] = field(
        default_factory=lambda: os.getenv("KILO_ORG_ID") or None
    )
    """Optional KiloCode organisation ID.  When set, it is forwarded as the
    ``X-KiloCode-OrganizationId`` request header."""

    @classmethod
    def from_env(cls) -> LLMConfig:
        """Construct a :class:`LLMConfig` from environment variables.

        All configuration is optional — missing variables fall back to their
        documented defaults.  Call this factory to make the environment
        source explicit in your code.

        Example::

            config = LLMConfig.from_env()
        """
        return cls()  # dataclass field defaults already read from env


# ---------------------------------------------------------------------------
# ModelRegistry
# ---------------------------------------------------------------------------


class ModelRegistry:
    """Catalogue of known KiloCode / OpenRouter models.

    Provides class-level groupings and a :meth:`recommend` helper that maps
    a task description to a suitable model.
    """

    FREE_MODELS: ClassVar[list[str]] = [
        "minimax/minimax-m2.5:free",
        "z-ai/glm-5:free",
    ]
    """Models that do not require an API key (marked ``:free``)."""

    FAST_MODELS: ClassVar[list[str]] = [
        "anthropic/claude-haiku-4.5",
        "minimax/minimax-m2.5:free",
        "z-ai/glm-5:free",
    ]
    """Low-latency / cost-efficient models suitable for simple tasks."""

    BALANCED_MODELS: ClassVar[list[str]] = [
        "anthropic/claude-sonnet-4.5",
        "openai/gpt-4o-mini",
    ]
    """Good balance between capability, latency, and cost."""

    POWERFUL_MODELS: ClassVar[list[str]] = [
        "anthropic/claude-opus-4.6",
        "openai/gpt-4o",
        "anthropic/claude-sonnet-4.5",
    ]
    """Highest-capability models for demanding analytical or creative tasks."""

    DEFAULT_MODEL: ClassVar[str] = "anthropic/claude-sonnet-4.5"
    """Recommended general-purpose model."""

    AUTO_MODEL: ClassVar[str] = "kilo/auto"
    """Let the KiloCode gateway select the best model automatically."""

    # keyword → model mapping used by :meth:`recommend`
    _TASK_MAP: ClassVar[dict[str, str]] = {
        "vision": "anthropic/claude-haiku-4.5",
        "image": "anthropic/claude-haiku-4.5",
        "code": "anthropic/claude-sonnet-4.5",
        "debug": "anthropic/claude-sonnet-4.5",
        "programming": "anthropic/claude-sonnet-4.5",
        "analysis": "anthropic/claude-opus-4.6",
        "research": "anthropic/claude-opus-4.6",
        "summarize": "anthropic/claude-sonnet-4.5",
        "translate": "anthropic/claude-haiku-4.5",
        "fast": "anthropic/claude-haiku-4.5",
        "cheap": "minimax/minimax-m2.5:free",
        "free": "minimax/minimax-m2.5:free",
    }

    def recommend(self, task: str) -> str:
        """Return a recommended model ID for *task*.

        The selection is based on keyword matching (case-insensitive).  Falls
        back to :attr:`DEFAULT_MODEL` when no keyword matches.

        Args:
            task: A short description of the task, e.g. ``"vision"`` or
                  ``"code review"``.

        Returns:
            A model ID string.

        Example::

            registry = ModelRegistry()
            model = registry.recommend("analyze this financial report")
            # → 'anthropic/claude-opus-4.6'
        """
        lower_task = task.lower()
        for keyword, model in self._TASK_MAP.items():
            if keyword in lower_task:
                return model
        return self.DEFAULT_MODEL


# ---------------------------------------------------------------------------
# AlchemicalLLM
# ---------------------------------------------------------------------------


def _to_messages(messages_or_prompt: Union[str, list[dict]]) -> list[dict]:
    """Normalise a bare string or a messages list into the OpenAI format."""
    if isinstance(messages_or_prompt, str):
        return [{"role": "user", "content": messages_or_prompt}]
    return messages_or_prompt


def _build_client(config: LLMConfig) -> AsyncOpenAI:
    """Construct an :class:`AsyncOpenAI` from *config*, reading the API key
    fresh from the environment if the stored value is empty."""
    api_key = config.api_key or os.getenv("KILO_API_KEY", "") or "no-key"
    extra_headers: dict[str, str] = {}
    if config.org_id:
        extra_headers["X-KiloCode-OrganizationId"] = config.org_id
    return AsyncOpenAI(
        api_key=api_key,
        base_url=config.base_url,
        timeout=config.timeout,
        default_headers=extra_headers,
    )


class AlchemicalLLM:
    """Primary LLM client for the Alchemical Agent Ecosystem.

    Wraps :class:`openai.AsyncOpenAI` and targets the KiloCode AI Gateway,
    which exposes an OpenAI-compatible REST API.  Supports plain chat,
    streaming, tool calling, structured output, batch processing, embeddings,
    and vision.

    Args:
        config: Optional :class:`LLMConfig`.  When omitted, a config is
                constructed automatically from environment variables via
                :meth:`LLMConfig.from_env`.

    Example::

        llm = AlchemicalLLM()
        reply = await llm.chat("Hello, world!")
    """

    def __init__(self, config: Optional[LLMConfig] = None) -> None:
        self.config: LLMConfig = config or LLMConfig.from_env()
        self._client: AsyncOpenAI = _build_client(self.config)

    # ------------------------------------------------------------------
    # Public properties
    # ------------------------------------------------------------------

    @property
    def is_configured(self) -> bool:
        """``True`` when a non-empty ``KILO_API_KEY`` is present.

        Free models (``*:free``) can be used without a key, but paid models
        require :attr:`LLMConfig.api_key` to be set.
        """
        return bool(self.config.api_key or os.getenv("KILO_API_KEY", ""))

    # ------------------------------------------------------------------
    # Client lifecycle
    # ------------------------------------------------------------------

    def refresh_client(self) -> None:
        """Re-create the internal :class:`AsyncOpenAI` client.

        Call this after updating ``KILO_API_KEY`` (or other gateway env vars)
        at runtime so that the next request picks up the new credentials
        without constructing a new :class:`AlchemicalLLM` instance.

        Example::

            os.environ["KILO_API_KEY"] = new_key
            llm.refresh_client()
        """
        # Re-read api_key from env so callers only need to update the env var
        self.config.api_key = os.getenv("KILO_API_KEY", self.config.api_key)
        self._client = _build_client(self.config)

    # ------------------------------------------------------------------
    # Core chat helpers
    # ------------------------------------------------------------------

    async def chat(
        self,
        messages_or_prompt: Union[str, list[dict]],
        model: Optional[str] = None,
        **kwargs: Any,
    ) -> str:
        """Send a non-streaming chat request and return the reply text.

        Args:
            messages_or_prompt: Either a plain string (converted to a single
                ``user`` message) or a list of OpenAI-format message dicts.
            model: Model ID override.  Defaults to
                :attr:`LLMConfig.default_model`.
            **kwargs: Additional keyword arguments forwarded to the
                ``chat.completions.create`` call (e.g. ``temperature``,
                ``max_tokens``).

        Returns:
            The assistant reply as a plain string.

        Raises:
            KiloAuthError: On authentication failure.
            KiloRateLimitError: When the API rate-limits the request.
            KiloAPIError: For all other API errors.

        Example::

            reply = await llm.chat("What is the philosopher's stone?")
        """
        messages = _to_messages(messages_or_prompt)
        used_model = model or self.config.default_model

        params: dict[str, Any] = {
            "model": used_model,
            "messages": messages,
            "max_tokens": kwargs.pop("max_tokens", self.config.max_tokens),
            "temperature": kwargs.pop("temperature", self.config.temperature),
            **kwargs,
        }

        try:
            completion = await self._client.chat.completions.create(**params)
            return completion.choices[0].message.content or ""
        except openai.OpenAIError as exc:
            raise _wrap_openai_error(exc) from exc

    async def stream(
        self,
        messages_or_prompt: Union[str, list[dict]],
        model: Optional[str] = None,
        **kwargs: Any,
    ) -> AsyncGenerator[str, None]:
        """Stream a chat completion, yielding text chunks as they arrive.

        Uses Server-Sent Events (SSE) identically to the standard OpenAI
        streaming interface.

        Args:
            messages_or_prompt: Prompt string or messages list.
            model: Model ID override.
            **kwargs: Extra parameters forwarded to ``chat.completions.create``.

        Yields:
            Incremental text chunks from the assistant reply.

        Raises:
            KiloAuthError: On authentication failure.
            KiloRateLimitError: When rate-limited.
            KiloAPIError: For other API errors.

        Example::

            async for chunk in llm.stream("Explain alchemy step by step"):
                print(chunk, end="", flush=True)
        """
        messages = _to_messages(messages_or_prompt)
        used_model = model or self.config.default_model

        params: dict[str, Any] = {
            "model": used_model,
            "messages": messages,
            "max_tokens": kwargs.pop("max_tokens", self.config.max_tokens),
            "temperature": kwargs.pop("temperature", self.config.temperature),
            **kwargs,
        }

        try:
            # Use create(..., stream=True) to avoid the double-await bug that
            # arises from `await client.chat.completions.create(..., stream=True)`
            # returning a coroutine-wrapped async context manager.
            response = await self._client.chat.completions.create(
                stream=True, **params
            )
            async for chunk in response:
                delta = chunk.choices[0].delta if chunk.choices else None
                if delta and delta.content:
                    yield delta.content
        except openai.OpenAIError as exc:
            raise _wrap_openai_error(exc) from exc

    async def chat_with_tools(
        self,
        messages: list[dict],
        tools: list[dict],
        model: Optional[str] = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Perform a tool-calling chat completion.

        Sends *messages* and *tools* to the API with ``tool_choice="auto"``
        and returns the completion as a dict with guaranteed top-level keys.

        Args:
            messages: Conversation history in OpenAI message format.
            tools: OpenAI-format tool definitions (list of
                ``{"type": "function", "function": {...}}`` dicts).
            model: Model ID override.
            **kwargs: Additional parameters forwarded to the API.

        Returns:
            A dict with at minimum the keys ``choices``, ``usage``, and
            ``model`` (plus all other fields from ``model_dump()``).

        Raises:
            KiloAuthError: On authentication failure.
            KiloRateLimitError: When rate-limited.
            KiloAPIError: For other API errors.

        Example::

            tools = [{"type": "function", "function": {"name": "get_weather", ...}}]
            result = await llm.chat_with_tools(messages, tools)
            tool_calls = result["choices"][0]["message"].get("tool_calls", [])
        """
        used_model = model or self.config.default_model

        params: dict[str, Any] = {
            "model": used_model,
            "messages": messages,
            "tools": tools,
            "tool_choice": "auto",
            "max_tokens": kwargs.pop("max_tokens", self.config.max_tokens),
            "temperature": kwargs.pop("temperature", self.config.temperature),
            **kwargs,
        }

        try:
            completion = await self._client.chat.completions.create(**params)
            dumped: dict[str, Any] = completion.model_dump()
            # Guarantee the three most-accessed keys are always present so
            # callers do not need defensive .get() chains.
            dumped.setdefault("choices", [])
            dumped.setdefault("usage", {})
            dumped.setdefault("model", used_model)
            return dumped
        except openai.OpenAIError as exc:
            raise _wrap_openai_error(exc) from exc

    async def structured_output(
        self,
        prompt: str,
        schema: type,
        model: Optional[str] = None,
    ) -> Any:
        """Request a structured JSON response that conforms to *schema*.

        Instructs the model to respond with JSON matching the JSON Schema
        derived from *schema* (a Pydantic model class or any type that exposes
        a ``model_json_schema()`` class method).

        Args:
            prompt: The user prompt.
            schema: A Pydantic ``BaseModel`` subclass (or any class that
                exposes ``model_json_schema()``).  The response JSON is
                validated and returned as a parsed instance of *schema*.
            model: Model ID override.

        Returns:
            A validated instance of *schema*.

        Raises:
            KiloAuthError: On authentication failure.
            KiloRateLimitError: When rate-limited.
            KiloAPIError: For other API errors.
            ValueError: When the model returns content that cannot be parsed
                as valid JSON or does not conform to *schema*.

        Example::

            from pydantic import BaseModel

            class Summary(BaseModel):
                headline: str
                body: str

            summary = await llm.structured_output("Summarise alchemy", Summary)
            print(summary.headline)
        """
        json_schema = schema.model_json_schema()  # type: ignore[attr-defined]
        used_model = model or self.config.default_model

        params: dict[str, Any] = {
            "model": used_model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": self.config.max_tokens,
            "temperature": self.config.temperature,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": schema.__name__,
                    "schema": json_schema,
                    "strict": True,
                },
            },
        }

        try:
            completion = await self._client.chat.completions.create(**params)
            raw = completion.choices[0].message.content or "{}"
            data = json.loads(raw)
            return schema(**data)  # type: ignore[call-arg]
        except (json.JSONDecodeError, TypeError, ValueError) as exc:
            raise ValueError(
                f"structured_output: could not parse model response as {schema.__name__}: {exc}"
            ) from exc
        except openai.OpenAIError as exc:
            raise _wrap_openai_error(exc) from exc

    async def batch_chat(
        self,
        prompts: list[str],
        model: Optional[str] = None,
        concurrency: int = 5,
    ) -> list[str]:
        """Run multiple prompts concurrently, respecting a concurrency limit.

        Args:
            prompts: List of text prompts to send.
            model: Model ID override applied to all prompts.
            concurrency: Maximum number of simultaneous in-flight requests.

        Returns:
            A list of reply strings in the same order as *prompts*.

        Example::

            replies = await llm.batch_chat(["What is gold?", "What is silver?"])
        """
        semaphore = asyncio.Semaphore(concurrency)

        async def _one(prompt: str) -> str:
            async with semaphore:
                return await self.chat(prompt, model=model)

        return list(await asyncio.gather(*(_one(p) for p in prompts)))

    async def embed(
        self,
        text: Union[str, list[str]],
        model: str = "text-embedding-3-small",
    ) -> list[list[float]]:
        """Generate embeddings for *text*.

        Routes to the KiloCode-compatible embeddings endpoint.

        Args:
            text: A single string or a list of strings to embed.
            model: Embedding model ID.

        Returns:
            A list of embedding vectors (one per input string).

        Raises:
            KiloAPIError: On any API error.

        Example::

            vectors = await llm.embed(["alchemy", "philosopher's stone"])
        """
        inputs: list[str] = [text] if isinstance(text, str) else text

        try:
            response = await self._client.embeddings.create(
                model=model, input=inputs
            )
            return [item.embedding for item in response.data]
        except openai.OpenAIError as exc:
            raise _wrap_openai_error(exc) from exc

    async def vision(
        self,
        prompt: str,
        image_url: str,
        model: str = "anthropic/claude-haiku-4.5",
        **kwargs: Any,
    ) -> str:
        """Perform multimodal vision inference on an image.

        Constructs a user message that includes both a text prompt and an
        ``image_url`` content part, then calls the chat completion endpoint.

        Args:
            prompt: Text instruction or question about the image.
            image_url: Publicly accessible URL of the image (HTTPS
                recommended).  Base-64 ``data:`` URIs are also accepted by
                most vision-capable models.
            model: Vision-capable model to use.
            **kwargs: Extra parameters forwarded to the API.

        Returns:
            The assistant's textual description / answer.

        Raises:
            KiloAuthError: On authentication failure.
            KiloRateLimitError: When rate-limited.
            KiloAPIError: For other API errors.

        Example::

            answer = await llm.vision(
                "Describe this alchemical diagram.",
                "https://example.com/diagram.png",
            )
        """
        messages: list[dict] = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }
        ]

        params: dict[str, Any] = {
            "model": model,
            "messages": messages,
            "max_tokens": kwargs.pop("max_tokens", self.config.max_tokens),
            **kwargs,
        }

        try:
            completion = await self._client.chat.completions.create(**params)
            return completion.choices[0].message.content or ""
        except openai.OpenAIError as exc:
            raise _wrap_openai_error(exc) from exc

    # ------------------------------------------------------------------
    # Model discovery
    # ------------------------------------------------------------------

    def get_available_models_sync(self) -> list[dict]:
        """Synchronously fetch the list of models from the KiloCode API.

        This is a blocking call intended for use outside async contexts (e.g.
        CLI scripts or module startup).  Prefer :meth:`get_available_models`
        inside async code.

        Returns:
            A list of model dicts as returned by the ``GET /models`` endpoint.

        Raises:
            RuntimeError: When called from within a running asyncio event loop.
                Use :meth:`get_available_models` (async) instead.
            KiloAPIError: When the HTTP request fails.

        Example::

            models = llm.get_available_models_sync()
        """
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                raise RuntimeError(
                    "get_available_models_sync() cannot be called from within a "
                    "running asyncio event loop. Use 'await get_available_models()' instead."
                )
        except RuntimeError as exc:
            # Re-raise our own RuntimeError unchanged; ignore "no current event loop"
            if "get_available_models_sync" in str(exc):
                raise
            # No event loop at all — safe to proceed with the blocking call.

        api_key = self.config.api_key or os.getenv("KILO_API_KEY", "")
        headers: dict[str, str] = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        if self.config.org_id:
            headers["X-KiloCode-OrganizationId"] = self.config.org_id

        try:
            with httpx.Client(timeout=30) as client:
                resp = client.get(
                    f"{self.config.base_url}/models", headers=headers
                )
                resp.raise_for_status()
                data = resp.json()
                return data.get("data", data) if isinstance(data, dict) else data
        except httpx.HTTPError as exc:
            raise KiloAPIError(f"Failed to fetch models: {exc}", cause=exc) from exc

    async def get_available_models(self) -> list[dict]:
        """Asynchronously fetch the list of models from the KiloCode API.

        Returns:
            A list of model dicts as returned by the ``GET /models`` endpoint.

        Raises:
            KiloAPIError: When the HTTP request fails.

        Example::

            models = await llm.get_available_models()
        """
        api_key = self.config.api_key or os.getenv("KILO_API_KEY", "")
        headers: dict[str, str] = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        if self.config.org_id:
            headers["X-KiloCode-OrganizationId"] = self.config.org_id

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    f"{self.config.base_url}/models", headers=headers
                )
                resp.raise_for_status()
                data = resp.json()
                return data.get("data", data) if isinstance(data, dict) else data
        except httpx.HTTPError as exc:
            raise KiloAPIError(f"Failed to fetch models: {exc}", cause=exc) from exc


# ---------------------------------------------------------------------------
# KiloHealthCheck
# ---------------------------------------------------------------------------


class KiloHealthCheck:
    """Liveness / readiness probe for the KiloCode AI Gateway.

    All methods are class-level so no instantiation is needed.

    Example::

        status = await KiloHealthCheck.check()
        print(status)
        # {'status': 'ok', 'model_count': 42, 'latency_ms': 123.4}
    """

    @classmethod
    async def check(cls) -> dict[str, Any]:
        """Probe the KiloCode gateway by calling ``GET /models`` (unauthenticated).

        The ``KILO_BASE_URL`` environment variable is read at call time so that
        changes made after import are always respected.

        Returns:
            A dict with the following keys:

            * ``status`` — ``"ok"``, ``"degraded"``, or ``"unreachable"``
            * ``model_count`` — number of models returned (0 on failure)
            * ``latency_ms`` — round-trip time in milliseconds

        Example::

            result = await KiloHealthCheck.check()
            if result["status"] != "ok":
                logger.warning("KiloCode gateway degraded: %s", result)
        """
        # Read from env at call time (H2 fix) so runtime changes are honoured.
        base_url = os.getenv("KILO_BASE_URL", "https://api.kilo.ai/api/gateway")

        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(f"{base_url}/models")
            latency_ms = (time.monotonic() - start) * 1000.0

            if resp.status_code == 200:
                data = resp.json()
                models = data.get("data", data) if isinstance(data, dict) else data
                model_count = len(models) if isinstance(models, list) else 0
                status = "ok" if model_count > 0 else "degraded"
            else:
                model_count = 0
                status = "degraded"

            return {
                "status": status,
                "model_count": model_count,
                "latency_ms": round(latency_ms, 2),
                "http_status": resp.status_code,
            }
        except Exception as exc:  # noqa: BLE001
            latency_ms = (time.monotonic() - start) * 1000.0
            logger.warning("KiloCode health check failed: %s", exc)
            return {
                "status": "unreachable",
                "model_count": 0,
                "latency_ms": round(latency_ms, 2),
                "error": str(exc),
            }


# ---------------------------------------------------------------------------
# Module-level thread-safe singleton and convenience functions
# ---------------------------------------------------------------------------

_llm_lock = threading.Lock()
_llm_singleton: Optional[AlchemicalLLM] = None


def get_llm() -> AlchemicalLLM:
    """Return the module-level singleton :class:`AlchemicalLLM` instance.

    Thread-safe: uses a double-checked locking pattern so that the singleton
    is constructed at most once even when called concurrently from multiple
    threads.

    Returns:
        The shared :class:`AlchemicalLLM` instance.

    Example::

        llm = get_llm()
        reply = await llm.chat("Hello!")
    """
    global _llm_singleton
    if _llm_singleton is None:
        with _llm_lock:
            if _llm_singleton is None:
                _llm_singleton = AlchemicalLLM()
    return _llm_singleton


async def quick_chat(prompt: str, model: Optional[str] = None) -> str:
    """One-shot helper: send *prompt* and return the reply string.

    Uses the module-level singleton client (see :func:`get_llm`).

    Args:
        prompt: Text prompt to send.
        model: Optional model override.

    Returns:
        The assistant reply as a plain string.

    Example::

        answer = await quick_chat("What is transmutation?")
    """
    return await get_llm().chat(prompt, model=model)
