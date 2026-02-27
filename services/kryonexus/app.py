"""
kryonexus — Knowledge crystallization, synthesis, relationship mapping, and streaming search.
Port: 7403
"""
import json
import logging
import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, HTTPException, WebSocket, WebSocketDisconnect
from openai import APIError, AsyncOpenAI
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SERVICE_NAME = os.getenv("SERVICE_NAME", "kryonexus")
SERVICE_PORT = int(os.getenv("PORT", "7403"))
GATEWAY_SECRET = os.getenv("GATEWAY_SECRET", "")

kilo = AsyncOpenAI(
    api_key=os.getenv("KILO_API_KEY", ""),
    base_url=os.getenv("KILO_BASE_URL", "https://api.kilo.ai/api/gateway"),
)
DEFAULT_MODEL = os.getenv("KILO_DEFAULT_MODEL", "anthropic/claude-sonnet-4.5")

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
async def verify_internal(x_gateway_secret: str = Header(default="")) -> None:
    """Validate internal gateway secret when configured."""
    if GATEWAY_SECRET and x_gateway_secret != GATEWAY_SECRET:
        raise HTTPException(status_code=403, detail="Invalid gateway secret")

# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"kryonexus awakening on port {SERVICE_PORT}")
    yield
    logger.info("kryonexus going dark")

app = FastAPI(title=SERVICE_NAME, version="2.0.0", lifespan=lifespan)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class CrystallizeRequest(BaseModel):
    text: str = Field(..., description="Unstructured text to extract key facts from")

class SynthesizeRequest(BaseModel):
    sources: list[str] = Field(..., description="List of text sources to synthesize")

class RelateRequest(BaseModel):
    concept_a: str = Field(..., description="First concept")
    concept_b: str = Field(..., description="Second concept")

class ServiceResponse(BaseModel):
    result: str
    confidence: float
    model_used: str
    tokens_used: int

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
async def _llm(messages: list[dict], temperature: float = 0.3) -> ServiceResponse:
    """Send messages to KiloCode and return a ServiceResponse."""
    try:
        completion = await kilo.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=messages,
            max_tokens=1024,
            temperature=temperature,
        )
        result = completion.choices[0].message.content or ""
        tokens = completion.usage.total_tokens if completion.usage else 0
        return ServiceResponse(result=result, confidence=0.9, model_used=DEFAULT_MODEL, tokens_used=tokens)
    except APIError as e:
        logger.error(f"KiloCode API error: {e}")
        raise HTTPException(status_code=502, detail="LLM service unavailable")

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health")
async def health() -> dict:
    """Service liveness check."""
    return {"status": "ok", "service": SERVICE_NAME, "version": "2.0.0"}

@app.post("/crystallize", dependencies=[Depends(verify_internal)])
async def crystallize(req: CrystallizeRequest) -> ServiceResponse:
    """Extract and structure key facts from unstructured text."""
    logger.info(f"crystallize: text_len={len(req.text)}")
    messages = [
        {"role": "system", "content": (
            "You are a knowledge extraction engine. From the provided text, extract all key facts, "
            "entities, dates, and relationships. Return structured JSON with keys: "
            "'facts' (list of strings), 'entities' (list of strings), 'relationships' (list of strings)."
        )},
        {"role": "user", "content": req.text},
    ]
    return await _llm(messages)

@app.post("/synthesize", dependencies=[Depends(verify_internal)])
async def synthesize(req: SynthesizeRequest) -> ServiceResponse:
    """Combine multiple information sources into a coherent, deduplicated summary."""
    logger.info(f"synthesize: sources={len(req.sources)}")
    numbered = "\n\n".join(f"Source {i+1}:\n{s}" for i, s in enumerate(req.sources))
    messages = [
        {"role": "system", "content": (
            "You are a knowledge synthesis expert. Combine the provided sources into a single "
            "coherent, deduplicated summary. Resolve contradictions by noting both views. "
            "Be thorough yet concise."
        )},
        {"role": "user", "content": numbered},
    ]
    return await _llm(messages)

@app.post("/relate", dependencies=[Depends(verify_internal)])
async def relate(req: RelateRequest) -> ServiceResponse:
    """Identify and explain the relationships between two concepts."""
    logger.info(f"relate: a={req.concept_a!r} b={req.concept_b!r}")
    messages = [
        {"role": "system", "content": (
            "You are a concept-relationship analyst. Given two concepts, identify all meaningful "
            "relationships between them (causal, hierarchical, analogical, temporal, etc.). "
            "Return JSON with key 'relationships' as a list of {{type, description}} objects."
        )},
        {"role": "user", "content": f"Concept A: {req.concept_a}\nConcept B: {req.concept_b}"},
    ]
    return await _llm(messages)

@app.websocket("/ws/search")
async def ws_search(ws: WebSocket) -> None:
    """Stream knowledge search results over WebSocket.

    Send JSON: {"query": "..."} to receive streamed response tokens.
    """
    await ws.accept()
    logger.info("ws/search: client connected")
    try:
        while True:
            raw = await ws.receive_text()
            try:
                data = json.loads(raw)
                query = data.get("query", "")
            except (json.JSONDecodeError, AttributeError):
                query = raw

            if not query:
                await ws.send_json({"error": "empty query"})
                continue

            try:
                stream = await kilo.chat.completions.create(
                    model=DEFAULT_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a knowledge retrieval assistant. Answer the query concisely."},
                        {"role": "user", "content": query},
                    ],
                    max_tokens=512,
                    temperature=0.3,
                    stream=True,
                )
                async for chunk in stream:
                    delta = chunk.choices[0].delta.content if chunk.choices else None
                    if delta:
                        await ws.send_json({"token": delta})
                await ws.send_json({"done": True})
            except APIError as e:
                logger.error(f"ws/search API error: {e}")
                await ws.send_json({"error": "LLM service unavailable"})
    except WebSocketDisconnect:
        logger.info("ws/search: client disconnected")
