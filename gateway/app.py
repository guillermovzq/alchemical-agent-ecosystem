"""Alchemical Agent Ecosystem — Gateway Service.

Production-quality FastAPI gateway providing:
- Agent registry and orchestration
- Channel connector management (Telegram, Discord, etc.)
- Job queue with exponential backoff
- SSE event/chat/usage streams
- KiloCode LLM proxy endpoints
- HMAC-verified webhooks
- Hashed API-key authentication with RBAC
- Circuit-breaking job worker
- Structured JSON logging
"""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
import logging
import os
import re
import secrets
import signal
import sqlite3
import sys
import time
import uuid
from collections import OrderedDict
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, AsyncIterator, Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Structured JSON logging — manual formatter (no external dependency needed)
# ---------------------------------------------------------------------------

class _JsonFormatter(logging.Formatter):
    """Emit log records as single-line JSON objects."""

    def format(self, record: logging.LogRecord) -> str:
        request_id: str = getattr(record, "request_id", "")
        entry: Dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "request_id": request_id,
            "message": record.getMessage(),
            "logger": record.name,
        }
        if record.exc_info:
            entry["exc_info"] = self.formatException(record.exc_info)
        extra_keys = set(record.__dict__) - {
            "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
            "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
            "created", "msecs", "relativeCreated", "thread", "threadName",
            "processName", "process", "message", "taskName", "request_id",
        }
        for k in extra_keys:
            entry[k] = getattr(record, k)
        return json.dumps(entry, ensure_ascii=False, default=str)


def _configure_logging() -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(_JsonFormatter())
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO)


_configure_logging()
logger = logging.getLogger("alchemical.gateway")


# ---------------------------------------------------------------------------
# Shared alchemical_core — importable from Docker (PYTHONPATH) or repo root
# ---------------------------------------------------------------------------
_SHARED_PYTHON = Path(__file__).resolve().parent.parent / "shared" / "python"
if str(_SHARED_PYTHON) not in sys.path:
    sys.path.insert(0, str(_SHARED_PYTHON))

AlchemicalLLM = None  # type: ignore[assignment,misc]
KiloHealthCheck = None  # type: ignore[assignment,misc]
LLMConfig = None  # type: ignore[assignment,misc]
ModelRegistry = None  # type: ignore[assignment,misc]
_kilo_available = False

try:
    from alchemical_core.llm import (  # type: ignore[assignment]
        AlchemicalLLM,
        KiloHealthCheck,
        LLMConfig,
        ModelRegistry,
    )
    _kilo_available = True
except ImportError:
    pass

# ---------------------------------------------------------------------------
# Environment / constants
# ---------------------------------------------------------------------------
KILO_API_KEY: str = os.getenv("KILO_API_KEY", "")
KILO_BASE_URL: str = os.getenv("KILO_BASE_URL", "https://api.kilo.ai/api/gateway")
KILO_DEFAULT_MODEL: str = os.getenv("KILO_DEFAULT_MODEL", "anthropic/claude-sonnet-4.5")
APP_VERSION: str = os.getenv("APP_VERSION", "2.0.0")

SERVICE_MAP: Dict[str, str] = {
    "velktharion": "http://velktharion:7401",
    "synapsara": "http://synapsara:7402",
    "kryonexus": "http://kryonexus:7403",
    "noctumbra-mail": "http://noctumbra-mail:7404",
    "temporaeth": "http://temporaeth:7405",
    "vaeloryn-conclave": "http://vaeloryn-conclave:7406",
    "ignivox": "http://ignivox:7407",
    "auralith": "http://auralith:7408",
    "resonvyr": "http://resonvyr:7409",
    "fluxenrath": "http://fluxenrath:7410",
}

_runtime_env = os.getenv("ALCHEMICAL_RUNTIME_DIR", ".runtime")
RUNTIME_DIR = Path(_runtime_env)
try:
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
except PermissionError:
    RUNTIME_DIR = Path("/tmp/alchemical-runtime")
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = RUNTIME_DIR / "gateway.db"

GATEWAY_TOKEN: str = os.getenv("ALCHEMICAL_GATEWAY_TOKEN", "")
ADMIN_ROLE = "admin"
OPERATOR_ROLE = "operator"
VIEWER_ROLE = "viewer"

TELEGRAM_WEBHOOK_SECRET: str = os.getenv("ALCHEMICAL_TELEGRAM_WEBHOOK_SECRET", "")
DISCORD_WEBHOOK_SECRET: str = os.getenv("ALCHEMICAL_DISCORD_WEBHOOK_SECRET", "")
TELEGRAM_SECRET: str = os.getenv("TELEGRAM_SECRET", TELEGRAM_WEBHOOK_SECRET)
DISCORD_SECRET: str = os.getenv("DISCORD_SECRET", DISCORD_WEBHOOK_SECRET)
MAX_BODY_BYTES: int = int(os.getenv("ALCHEMICAL_MAX_BODY_BYTES", "262144"))
RATE_LIMIT_PER_MIN: int = int(os.getenv("ALCHEMICAL_RATE_LIMIT_PER_MIN", "120"))
ALLOWED_ORIGINS: List[str] = [
    x.strip() for x in os.getenv("ALCHEMICAL_ALLOWED_ORIGINS", "*").split(",") if x.strip()
]

# Maximum unique client IPs tracked for rate limiting (LRU eviction beyond this)
_RATE_LIMIT_MAX_ENTRIES = 10_000

# Startup time for uptime calculation
_START_TIME: float = time.monotonic()

# Rate-limit state — guarded by _rate_lock
_rate_window: "OrderedDict[str, List[float]]" = OrderedDict()
_rate_lock: asyncio.Lock  # initialised in lifespan

# ---------------------------------------------------------------------------
# Catalogs
# ---------------------------------------------------------------------------
SKILLS_CATALOG: List[str] = [
    "planning",
    "critical-reflection",
    "routing",
    "long-term-context",
    "fact-checking",
    "source-comparison",
    "deep-research",
    "coding",
    "debugging",
    "testing",
    "deployment",
    "ui-ux",
    "branding",
    "image-generation",
    "motion",
    "storytelling",
    "seo",
    "multilingual-writing",
    "editing",
]

TOOLS_CATALOG: List[str] = [
    "http",
    "search",
    "memory",
    "shell",
    "docker-control",
    "logs",
    "notifications",
    "canvas",
    "browser",
]

CHANNEL_CONNECTORS: List[str] = ["telegram", "whatsapp", "discord", "slack", "signal"]

CORE_AGENT_TEMPLATES: List[Dict[str, Any]] = [
    {
        "name": "alquimista-mayor",
        "role": "Orquestador / Director / Alquimista Mayor",
        "model": "local-default",
        "tools": ["memory", "notifications", "logs"],
        "skills": ["planning", "critical-reflection", "routing", "long-term-context"],
        "enabled": 1,
        "parent": None,
        "target_service": "velktharion",
    },
    {
        "name": "investigador-analista",
        "role": "Investigador / Analista / Buscador de Verdad",
        "model": "local-default",
        "tools": ["search", "http", "memory"],
        "skills": ["fact-checking", "source-comparison", "deep-research"],
        "enabled": 1,
        "parent": "alquimista-mayor",
        "target_service": "synapsara",
    },
    {
        "name": "ingeniero-constructor",
        "role": "Desarrollador / Ingeniero / Constructor",
        "model": "local-default",
        "tools": ["shell", "docker-control", "http", "logs"],
        "skills": ["coding", "debugging", "testing", "deployment"],
        "enabled": 1,
        "parent": "alquimista-mayor",
        "target_service": "ignivox",
    },
    {
        "name": "creador-visual",
        "role": "Creador Visual / Diseñador / Artista Digital",
        "model": "local-default",
        "tools": ["canvas", "browser", "memory"],
        "skills": ["ui-ux", "branding", "image-generation", "motion"],
        "enabled": 1,
        "parent": "alquimista-mayor",
        "target_service": "auralith",
    },
    {
        "name": "redactor-narrador",
        "role": "Redactor / Copywriter / Narrador / Estratega de Contenido",
        "model": "local-default",
        "tools": ["memory", "search", "http"],
        "skills": ["storytelling", "seo", "multilingual-writing", "editing"],
        "enabled": 1,
        "parent": "alquimista-mayor",
        "target_service": "resonvyr",
    },
]

# ---------------------------------------------------------------------------
# Secret-scan regex (expanded)
# ---------------------------------------------------------------------------
_SECRET_PATTERN = re.compile(
    r"(ghp_|pat_|token|secret|sk-|xoxb-|AKIA[0-9A-Z]{16}|eyJ|-----BEGIN|glpat-|npm_|github_pat_)",
    re.IGNORECASE,
)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class AgentConfig(BaseModel):
    """Configuration payload for registering or updating an agent."""

    name: str = Field(min_length=2, max_length=64)
    role: str = Field(min_length=2, max_length=128)
    model: str = Field(default="local-default")
    tools: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    enabled: bool = True
    parent: Optional[str] = None
    target_service: Optional[str] = None


class ConnectorConfig(BaseModel):
    """Configuration for a channel connector."""

    channel: str
    enabled: bool = True
    bot_name: Optional[str] = None
    webhook_url: Optional[str] = None
    token_ref: Optional[str] = Field(default=None, description="Reference only (not raw secret)")


class ChatActionRequest(BaseModel):
    """Request body for the orchestrated action-plan endpoint."""

    goal: str
    use_skills: List[str] = Field(default_factory=list)
    use_tools: List[str] = Field(default_factory=list)
    create_subagents: List[str] = Field(default_factory=list)
    channels: List[str] = Field(default_factory=list)


class ChatMessage(BaseModel):
    """A single chat message posted to the thread."""

    sender: str = Field(min_length=2, max_length=64)
    text: str = Field(min_length=1, max_length=4000)
    kind: str = Field(default="message")


class ChatAskRequest(BaseModel):
    """Request body for the /chat/ask endpoint."""

    agent: str = Field(min_length=2, max_length=64)
    text: str = Field(min_length=1, max_length=4000)
    action: Optional[str] = Field(default="query")
    repo: Optional[str] = None
    thinking: Optional[str] = Field(default="balanced")
    auto_edit: bool = False
    attachments: List[str] = Field(default_factory=list)


class ChatRoundtableRequest(BaseModel):
    """Request body for the /chat/roundtable endpoint."""

    topic: str = Field(min_length=3, max_length=4000)
    agents: List[str] = Field(default_factory=list)
    rounds: int = Field(default=1, ge=1, le=5)
    action: str = Field(default="query")
    thinking: Optional[str] = Field(default="balanced")


class ConnectorSendRequest(BaseModel):
    """Request body for outbound connector message delivery."""

    channel: str
    target: str = Field(min_length=1, max_length=128)
    message: str = Field(min_length=1, max_length=4000)


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

@contextmanager
def db_conn():
    """Context manager that opens a SQLite connection, commits on success, rolls back on error."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def now_iso() -> str:
    """Return the current UTC time as an ISO 8601 string."""
    return datetime.now(timezone.utc).isoformat()


def _hash_key(key: str) -> str:
    """Return the SHA-256 hex digest of *key*."""
    return hashlib.sha256(key.encode()).hexdigest()


def init_db() -> None:
    """Create all required tables and seed bootstrap data (blocking)."""
    with db_conn() as conn:
        # H2 — WAL mode for better concurrent read performance
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS agents (
              name TEXT PRIMARY KEY,
              role TEXT NOT NULL,
              model TEXT NOT NULL,
              tools_json TEXT NOT NULL,
              skills_json TEXT NOT NULL,
              enabled INTEGER NOT NULL,
              parent TEXT,
              target_service TEXT,
              updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS connectors (
              channel TEXT PRIMARY KEY,
              enabled INTEGER NOT NULL,
              bot_name TEXT,
              webhook_url TEXT,
              token_ref TEXT,
              updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS chat_messages (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              sender TEXT NOT NULL,
              text TEXT NOT NULL,
              kind TEXT NOT NULL,
              ts TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS events (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              level TEXT NOT NULL,
              source TEXT NOT NULL,
              message TEXT NOT NULL,
              ts TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS api_keys (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              key_hash TEXT UNIQUE NOT NULL,
              role TEXT NOT NULL,
              enabled INTEGER NOT NULL DEFAULT 1,
              created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS jobs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              kind TEXT NOT NULL,
              payload_json TEXT NOT NULL,
              status TEXT NOT NULL,
              attempts INTEGER NOT NULL DEFAULT 0,
              max_attempts INTEGER NOT NULL DEFAULT 5,
              next_run_ts TEXT,
              error TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS usage_samples (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              source TEXT NOT NULL,
              model TEXT,
              tokens_in INTEGER NOT NULL DEFAULT 0,
              tokens_out INTEGER NOT NULL DEFAULT 0,
              total_tokens INTEGER NOT NULL DEFAULT 0,
              cost_usd REAL NOT NULL DEFAULT 0,
              ts TEXT NOT NULL
            )
            """
        )

        # Performance indices — created with IF NOT EXISTS so repeated calls are safe
        conn.execute("CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status, next_run_ts)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_events_ts ON events(id DESC)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_chat_messages_id ON chat_messages(id DESC)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_usage_id ON usage_samples(id DESC)")

        # C1 — seed bootstrap admin key with hash
        admin_key = os.getenv("ALCHEMICAL_ADMIN_API_KEY", "")
        if admin_key:
            conn.execute(
                "INSERT OR IGNORE INTO api_keys(name,key_hash,role,enabled,created_at) VALUES(?,?,?,?,?)",
                ("bootstrap-admin", _hash_key(admin_key), "admin", 1, now_iso()),
            )

        count = conn.execute("SELECT COUNT(*) c FROM agents").fetchone()["c"]
        if count == 0:
            for a in CORE_AGENT_TEMPLATES:
                conn.execute(
                    """
                    INSERT INTO agents(name, role, model, tools_json, skills_json, enabled, parent, target_service, updated_at)
                    VALUES(?,?,?,?,?,?,?,?,?)
                    """,
                    (
                        a["name"],
                        a["role"],
                        a["model"],
                        json.dumps(a["tools"]),
                        json.dumps(a["skills"]),
                        int(a["enabled"]),
                        a["parent"],
                        a["target_service"],
                        now_iso(),
                    ),
                )


# ---------------------------------------------------------------------------
# Row helpers
# ---------------------------------------------------------------------------

def row_to_agent(row: sqlite3.Row) -> Dict[str, Any]:
    """Convert a SQLite agents row to a serialisable dict."""
    return {
        "name": row["name"],
        "role": row["role"],
        "model": row["model"],
        "tools": json.loads(row["tools_json"]),
        "skills": json.loads(row["skills_json"]),
        "enabled": bool(row["enabled"]),
        "parent": row["parent"],
        "target_service": row["target_service"],
        "updated_at": row["updated_at"],
    }


# ---------------------------------------------------------------------------
# Chat / event / usage helpers
# ---------------------------------------------------------------------------

def append_chat(sender: str, text: str, kind: str = "message") -> None:
    """Persist a chat message to the database."""
    with db_conn() as conn:
        conn.execute(
            "INSERT INTO chat_messages(sender, text, kind, ts) VALUES(?,?,?,?)",
            (sender, text, kind, now_iso()),
        )


def append_event(level: str, source: str, message: str) -> None:
    """Persist a structured event to the database."""
    with db_conn() as conn:
        conn.execute(
            "INSERT INTO events(level, source, message, ts) VALUES(?,?,?,?)",
            (level, source, message, now_iso()),
        )


def append_usage(
    source: str,
    model: Optional[str],
    tokens_in: int,
    tokens_out: int,
    cost_usd: float = 0.0,
) -> None:
    """Record a token-usage sample."""
    total = max(0, int(tokens_in)) + max(0, int(tokens_out))
    with db_conn() as conn:
        conn.execute(
            "INSERT INTO usage_samples(source,model,tokens_in,tokens_out,total_tokens,cost_usd,ts) VALUES(?,?,?,?,?,?,?)",
            (
                source,
                model or "",
                max(0, int(tokens_in)),
                max(0, int(tokens_out)),
                total,
                float(cost_usd or 0),
                now_iso(),
            ),
        )


def _extract_usage(data: Dict[str, Any]) -> Dict[str, Any]:
    """Extract token-usage fields from an upstream response dict."""
    usage = data.get("usage") if isinstance(data, dict) else None
    model = data.get("model") if isinstance(data, dict) else None
    if isinstance(usage, dict):
        tin = int(
            usage.get("input_tokens", usage.get("prompt_tokens", usage.get("tokens_in", 0))) or 0
        )
        tout = int(
            usage.get("output_tokens", usage.get("completion_tokens", usage.get("tokens_out", 0))) or 0
        )
        cost = float(usage.get("cost_usd", usage.get("cost", 0.0)) or 0.0)
        return {
            "tokens_in": tin,
            "tokens_out": tout,
            "cost_usd": cost,
            "model": model or usage.get("model", ""),
        }
    return {"tokens_in": 0, "tokens_out": 0, "cost_usd": 0.0, "model": model or ""}


def enqueue_job(kind: str, payload: Dict[str, Any], max_attempts: int = 5) -> None:
    """Insert a new job into the jobs queue."""
    ts = now_iso()
    with db_conn() as conn:
        conn.execute(
            """
            INSERT INTO jobs(kind, payload_json, status, attempts, max_attempts, next_run_ts, error, created_at, updated_at)
            VALUES(?,?,?,?,?,?,?,?,?)
            """,
            (kind, json.dumps(payload), "queued", 0, max_attempts, ts, None, ts, ts),
        )


def normalize_inbound(channel: str, body: Dict[str, Any]) -> Dict[str, Any]:
    """Normalise an inbound webhook body into a canonical dict."""
    if channel == "telegram":
        msg = body.get("message") or body.get("edited_message") or {}
        chat = msg.get("chat") or {}
        text = msg.get("text") or msg.get("caption") or ""
        sender = (msg.get("from") or {}).get("username") or str(
            (msg.get("from") or {}).get("id", "unknown")
        )
        return {
            "channel": channel,
            "from": sender,
            "target": str(chat.get("id", "")),
            "text": text,
            "raw": body,
        }

    if channel == "discord":
        text = body.get("content", "")
        sender = (body.get("author") or {}).get("username") or "unknown"
        target = str(body.get("channel_id", ""))
        return {"channel": channel, "from": sender, "target": target, "text": text, "raw": body}

    return {
        "channel": channel,
        "from": str(body.get("from", "unknown")),
        "target": str(body.get("target", "")),
        "text": str(body.get("text", "")),
        "raw": body,
    }


def parse_ts(ts: Optional[str]) -> datetime:
    """Parse an ISO timestamp string, defaulting to now() on failure."""
    if not ts:
        return datetime.now(timezone.utc)
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


# ---------------------------------------------------------------------------
# Authentication helpers
# ---------------------------------------------------------------------------

def _auth_role_from_db(api_key: str) -> Optional[str]:
    """Look up the role for *api_key* by comparing its SHA-256 hash."""
    key_hash = _hash_key(api_key)
    with db_conn() as conn:
        row = conn.execute(
            "SELECT role,enabled FROM api_keys WHERE key_hash=?", (key_hash,)
        ).fetchone()
    if not row or not int(row["enabled"]):
        return None
    return row["role"]


def _require_auth(request: Request, min_role: str = VIEWER_ROLE) -> None:
    """Enforce gateway token, API-key role, and minimum role checks.

    Authentication logic:
    - If GATEWAY_TOKEN is set, the x-alchemy-token header MUST match it.
    - If x-api-key is provided, it is validated against the DB hash and its role is used.
    - If GATEWAY_TOKEN is set and matches but no x-api-key is given, the request is
      authenticated as ADMIN_ROLE (the gateway token is the master credential).
    - If neither GATEWAY_TOKEN nor x-api-key is configured server-side, auth is open.

    The ``x-alchemy-role`` client header is intentionally **never** trusted (C2).

    Raises HTTPException(401) or HTTPException(403) as appropriate.
    """
    _enforce_rate_limit(request)

    token_provided = request.headers.get("x-alchemy-token", "")
    api_key_provided = request.headers.get("x-api-key", "")

    # --- Validate gateway token if one is configured ---
    token_valid = False
    if GATEWAY_TOKEN:
        if not token_provided:
            raise HTTPException(
                status_code=401,
                detail="Missing gateway token",
                headers={"WWW-Authenticate": 'Bearer realm="alchemical-gateway"'},
            )
        if not hmac.compare_digest(token_provided, GATEWAY_TOKEN):
            raise HTTPException(
                status_code=401,
                detail="Invalid gateway token",
                headers={"WWW-Authenticate": 'Bearer realm="alchemical-gateway"'},
            )
        token_valid = True

    # --- Resolve role from API key (C2 — role only from DB, never from header) ---
    role: Optional[str] = None
    if api_key_provided:
        role = _auth_role_from_db(api_key_provided)
        if not role:
            raise HTTPException(
                status_code=401,
                detail="Invalid API key",
                headers={"WWW-Authenticate": 'Bearer realm="alchemical-gateway"'},
            )
    elif token_valid:
        # Gateway token without API key → grant admin (master credential)
        role = ADMIN_ROLE
    elif not GATEWAY_TOKEN:
        # No server-side auth configured — open access (dev mode)
        role = ADMIN_ROLE
    else:
        raise HTTPException(
            status_code=401,
            detail="Authentication required: provide x-api-key or x-alchemy-token",
            headers={"WWW-Authenticate": 'Bearer realm="alchemical-gateway"'},
        )

    order = {VIEWER_ROLE: 1, OPERATOR_ROLE: 2, ADMIN_ROLE: 3}
    if order.get(role, 0) < order.get(min_role, 1):
        raise HTTPException(403, f"Role '{role}' cannot access this endpoint")


# ---------------------------------------------------------------------------
# Rate limiting (thread-safe with asyncio.Lock + LRU eviction)
# ---------------------------------------------------------------------------

def _enforce_rate_limit(request: Request) -> None:
    """Synchronous rate-limit check; safe only when called from an async context
    that already holds the event-loop thread.  Full async version used in middleware.
    """
    client = request.client.host if request.client else "unknown"
    now = datetime.now(timezone.utc).timestamp()
    window_start = now - 60
    bucket = list(_rate_window.get(client, []))
    bucket = [t for t in bucket if t >= window_start]
    if len(bucket) >= RATE_LIMIT_PER_MIN:
        raise HTTPException(429, "Rate limit exceeded")
    bucket.append(now)
    # LRU eviction — move to end (most recently used)
    _rate_window.pop(client, None)
    if len(_rate_window) >= _RATE_LIMIT_MAX_ENTRIES:
        _rate_window.popitem(last=False)  # evict oldest
    _rate_window[client] = bucket


async def _enforce_rate_limit_async(request: Request) -> None:
    """Async rate-limit check using asyncio.Lock for safety under concurrency."""
    global _rate_lock  # noqa: PLW0603
    async with _rate_lock:
        client = request.client.host if request.client else "unknown"
        now = datetime.now(timezone.utc).timestamp()
        window_start = now - 60
        bucket = list(_rate_window.get(client, []))
        bucket = [t for t in bucket if t >= window_start]
        if len(bucket) >= RATE_LIMIT_PER_MIN:
            raise HTTPException(429, "Rate limit exceeded")
        bucket.append(now)
        _rate_window.pop(client, None)
        if len(_rate_window) >= _RATE_LIMIT_MAX_ENTRIES:
            _rate_window.popitem(last=False)
        _rate_window[client] = bucket


# ---------------------------------------------------------------------------
# Body-size enforcement
# ---------------------------------------------------------------------------

async def _enforce_body_size(request: Request) -> None:
    """Reject requests whose body exceeds MAX_BODY_BYTES.

    Checks the Content-Length header first (fast path) then reads actual bytes
    when the header is absent or within the limit.
    """
    cl = request.headers.get("content-length")
    if cl and cl.isdigit() and int(cl) > MAX_BODY_BYTES:
        raise HTTPException(413, f"Payload too large. Max {MAX_BODY_BYTES} bytes")
    # Verify actual body for requests without a declared Content-Length
    try:
        body = await request.body()
        if len(body) > MAX_BODY_BYTES:
            raise HTTPException(413, f"Payload too large. Max {MAX_BODY_BYTES} bytes")
    except HTTPException:
        raise
    except Exception:
        pass  # body already consumed elsewhere; header check suffices


# ---------------------------------------------------------------------------
# Webhook HMAC validation (C5)
# ---------------------------------------------------------------------------

def _validate_telegram_hmac(request: Request, raw_body: bytes) -> bool:
    """Validate Telegram webhook using X-Telegram-Bot-Api-Secret-Token header."""
    if not TELEGRAM_SECRET:
        logger.warning("TELEGRAM_SECRET not set; webhook signature validation skipped")
        return True
    received = request.headers.get("X-Telegram-Bot-Api-Secret-Token", "")
    return hmac.compare_digest(received, TELEGRAM_SECRET)


def _validate_discord_hmac(request: Request, raw_body: bytes) -> bool:
    """Validate Discord webhook using HMAC-SHA256 signature header."""
    if not DISCORD_SECRET:
        logger.warning("DISCORD_SECRET not set; webhook signature validation skipped")
        return True
    received = request.headers.get("X-Signature-Ed25519", "") or request.headers.get(
        "X-Discord-Webhook-Secret", ""
    )
    # Support both simple-secret and HMAC styles
    expected = hmac.new(
        DISCORD_SECRET.encode(), raw_body, hashlib.sha256
    ).hexdigest()
    # If header looks like a plain secret token, compare directly
    if len(received) != 64:
        return hmac.compare_digest(received, DISCORD_SECRET)
    return hmac.compare_digest(received, expected)


# ---------------------------------------------------------------------------
# Job worker (C3 — circuit breaker + H3 — exponential backoff polling)
# ---------------------------------------------------------------------------

async def job_worker() -> None:
    """Background task: dequeue and execute jobs with exponential backoff polling
    and a consecutive-failure circuit breaker.
    """
    poll_delay = 0.1
    poll_max = 2.0
    consecutive_failures: Dict[int, int] = {}

    while True:
        await asyncio.sleep(poll_delay)
        job: Optional[Dict[str, Any]] = None

        try:
            with db_conn() as conn:
                rows = conn.execute(
                    "SELECT * FROM jobs WHERE status IN ('queued','retry') ORDER BY id ASC LIMIT 1"
                ).fetchall()
                if rows:
                    candidate = rows[0]
                    if parse_ts(candidate["next_run_ts"]) <= datetime.now(timezone.utc):
                        job = dict(candidate)
                        conn.execute(
                            "UPDATE jobs SET status='processing', updated_at=? WHERE id=?",
                            (now_iso(), job["id"]),
                        )
        except Exception as db_err:
            logger.error("job_worker: DB error during poll: %s", db_err)
            poll_delay = min(poll_delay * 2, poll_max)
            continue

        if not job:
            # No work available — back off gently
            poll_delay = min(poll_delay * 1.5, poll_max)
            continue

        # Work found — reset poll delay
        poll_delay = 0.1
        job_id: int = job["id"]

        # Circuit breaker — permanent failure after 5 consecutive errors
        if consecutive_failures.get(job_id, 0) >= 5:
            logger.critical(
                "job_worker: job %d has failed 5 consecutive times — marking permanently failed",
                job_id,
            )
            attempts = int(job["attempts"])
            with db_conn() as conn:
                conn.execute(
                    "UPDATE jobs SET status='failed', attempts=?, error=?, updated_at=? WHERE id=?",
                    (attempts, "Circuit breaker: 5 consecutive failures", now_iso(), job_id),
                )
            append_event("error", "jobs", f"Job {job_id} permanently failed (circuit breaker)")
            consecutive_failures.pop(job_id, None)
            continue

        try:
            payload = json.loads(job["payload_json"])

            if job["kind"] == "connector_outbound":
                channel = payload.get("channel")
                target = payload.get("target")
                message = payload.get("message", "")
                delivered = False
                with db_conn() as conn:
                    c = conn.execute(
                        "SELECT webhook_url,enabled FROM connectors WHERE channel=?", (channel,)
                    ).fetchone()

                async with httpx.AsyncClient(timeout=15) as cli:
                    if channel == "telegram":
                        bot_token = os.getenv("ALCHEMICAL_TELEGRAM_BOT_TOKEN", "")
                        if bot_token and target:
                            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                            r = await cli.post(url, json={"chat_id": target, "text": message})
                            delivered = r.is_success
                    elif channel == "discord" and c and c["webhook_url"]:
                        r = await cli.post(c["webhook_url"], json={"content": message})
                        delivered = r.is_success
                    elif c and int(c["enabled"]) and c["webhook_url"]:
                        r = await cli.post(
                            c["webhook_url"],
                            json={"target": target, "message": message, "channel": channel},
                        )
                        delivered = r.is_success

                if delivered:
                    append_event("info", "connector", f"Outbound delivered to {channel}:{target}")
                else:
                    append_event("warn", "connector", f"Connector {channel} delivery fallback/store only")

                append_chat(f"connector:{channel}", message, "connector")

            elif job["kind"] == "connector_inbound":
                ch = payload.get("channel")
                frm = payload.get("from")
                txt = payload.get("text", "")
                append_event("info", "connector", f"Inbound from {ch}:{frm}")
                append_chat(f"inbound:{ch}", txt, "connector")

            else:
                append_event("warn", "jobs", f"Unknown job kind: {job['kind']}")

            with db_conn() as conn:
                conn.execute(
                    "UPDATE jobs SET status='done', updated_at=? WHERE id=?",
                    (now_iso(), job_id),
                )

            # Success — reset consecutive failure count
            consecutive_failures.pop(job_id, None)

        except Exception as exc:
            consecutive_failures[job_id] = consecutive_failures.get(job_id, 0) + 1
            consec = consecutive_failures[job_id]
            attempts = int(job["attempts"]) + 1
            max_attempts = int(job["max_attempts"])
            next_status = "failed" if attempts >= max_attempts else "retry"
            delay = min(2 ** attempts, 60)
            next_run_ts = datetime.fromtimestamp(
                datetime.now(timezone.utc).timestamp() + delay, tz=timezone.utc
            ).isoformat()
            with db_conn() as conn:
                conn.execute(
                    """
                    UPDATE jobs
                    SET status=?, attempts=?, next_run_ts=?, error=?, updated_at=?
                    WHERE id=?
                    """,
                    (next_status, attempts, next_run_ts, str(exc), now_iso(), job_id),
                )
            logger.error(
                "job_worker: job %d failed (%s), consecutive=%d: %s",
                job_id,
                next_status,
                consec,
                exc,
            )
            append_event("error", "jobs", f"Job {job_id} failed ({next_status}), consecutive={consec}")


# ---------------------------------------------------------------------------
# Lifespan (H6 — replaces deprecated @app.on_event("startup"))
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan: initialise resources on startup, clean up on shutdown."""
    global _rate_lock  # noqa: PLW0603

    _rate_lock = asyncio.Lock()

    # M5 — run blocking init_db in a thread
    await asyncio.to_thread(init_db)

    worker_task = asyncio.create_task(job_worker())

    key_status = "API key configured" if KILO_API_KEY else "no API key (free models only)"
    logger.info(
        "LLM engine: KiloCode AI Gateway | base_url=%s | model=%s | %s",
        KILO_BASE_URL,
        KILO_DEFAULT_MODEL,
        key_status,
    )
    if not _kilo_available:
        logger.warning(
            "alchemical_core.llm could not be imported — "
            "install 'openai>=1.50.0' to enable /gateway/llm/* endpoints"
        )
    append_event(
        "info",
        "gateway",
        f"KiloCode AI Gateway configured | model={KILO_DEFAULT_MODEL} | {key_status}",
    )

    # Graceful-shutdown on SIGTERM
    loop = asyncio.get_running_loop()

    def _handle_sigterm(*_: Any) -> None:
        logger.info("SIGTERM received — initiating graceful shutdown")
        worker_task.cancel()

    try:
        loop.add_signal_handler(signal.SIGTERM, _handle_sigterm)
    except (NotImplementedError, RuntimeError):
        pass  # Windows / non-main-thread fallback

    try:
        yield
    finally:
        worker_task.cancel()
        try:
            await asyncio.wait_for(asyncio.shield(worker_task), timeout=5.0)
        except (asyncio.CancelledError, asyncio.TimeoutError):
            pass
        logger.info("Gateway shutdown complete")


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title=f"alchemical-gateway v{APP_VERSION}",
    version=APP_VERSION,
    description="Local-first orchestration gateway for Alchemical Agent Ecosystem",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != ["*"] else ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Middleware: X-Request-ID injection + request/response logging
# ---------------------------------------------------------------------------

@app.middleware("http")
async def request_id_and_logging_middleware(request: Request, call_next: Any) -> Response:
    """Attach a unique request ID to every request, enforce body-size limit, and log
    method/path/status/duration."""
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    # Stash on request.state so route handlers can access it
    request.state.request_id = request_id

    # Fast-path body-size enforcement via Content-Length header
    cl = request.headers.get("content-length")
    if cl and cl.isdigit() and int(cl) > MAX_BODY_BYTES:
        return Response(
            content=json.dumps({"detail": f"Payload too large. Max {MAX_BODY_BYTES} bytes"}),
            status_code=413,
            media_type="application/json",
            headers={"X-Request-ID": request_id},
        )

    start = time.monotonic()
    response: Response = await call_next(request)
    duration_ms = round((time.monotonic() - start) * 1000, 2)

    response.headers["X-Request-ID"] = request_id

    logger.info(
        "%s %s %d %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "duration_ms": duration_ms,
        },
    )
    return response


# ---------------------------------------------------------------------------
# Health / readiness / stats endpoints
# ---------------------------------------------------------------------------

@app.get("/health", tags=["system"])
async def health() -> Dict[str, Any]:
    """Lightweight liveness probe — no auth required.

    Returns only safe fields; DB_PATH is intentionally omitted (M4).
    """
    return {
        "status": "ok",
        "version": APP_VERSION,
        "engine": "kilo-ai",
        "timestamp": now_iso(),
    }


@app.get("/ready", tags=["system"])
async def ready(request: Request) -> Dict[str, Any]:
    """Readiness probe — confirms DB is accessible and agents are loaded."""
    _require_auth(request, VIEWER_ROLE)
    with db_conn() as conn:
        agent_count = conn.execute("SELECT COUNT(*) c FROM agents").fetchone()["c"]
        connector_count = conn.execute("SELECT COUNT(*) c FROM connectors").fetchone()["c"]
    return {
        "status": "ready",
        "agents": agent_count,
        "connectors": connector_count,
        "service_targets": len(SERVICE_MAP),
        "timestamp": now_iso(),
    }


@app.get("/stats", tags=["system"])
async def stats(request: Request) -> Dict[str, Any]:
    """Aggregate system stats endpoint."""
    _require_auth(request, VIEWER_ROLE)
    with db_conn() as conn:
        jobs = conn.execute("SELECT status, COUNT(*) c FROM jobs GROUP BY status").fetchall()
        chats = conn.execute("SELECT COUNT(*) c FROM chat_messages").fetchone()["c"]
        events = conn.execute("SELECT COUNT(*) c FROM events").fetchone()["c"]
        agents = conn.execute("SELECT COUNT(*) c FROM agents").fetchone()["c"]
        usage = conn.execute(
            "SELECT COALESCE(SUM(tokens_in),0) tin, COALESCE(SUM(tokens_out),0) tout, "
            "COALESCE(SUM(total_tokens),0) t, COALESCE(SUM(cost_usd),0) c FROM usage_samples"
        ).fetchone()
    uptime_seconds = round(time.monotonic() - _START_TIME, 1)
    return {
        "total_agents": agents,
        "total_jobs": sum(r["c"] for r in jobs),
        "total_chat_messages": chats,
        "total_events": events,
        "uptime_seconds": uptime_seconds,
        "jobs": {r["status"]: r["c"] for r in jobs},
        "usage": {
            "tokens_in": usage["tin"],
            "tokens_out": usage["tout"],
            "total_tokens": usage["t"],
            "cost_usd": usage["c"],
        },
        "timestamp": now_iso(),
    }


@app.get("/gateway/stats", tags=["system"])
async def gateway_stats(request: Request) -> Dict[str, Any]:
    """Gateway-namespaced aggregate stats (mirrors /stats for external consumers)."""
    return await stats(request)


# ---------------------------------------------------------------------------
# Usage endpoints
# ---------------------------------------------------------------------------

@app.get("/usage/summary", tags=["usage"])
async def usage_summary(
    request: Request, limit: int = Query(50, ge=1, le=500)
) -> Dict[str, Any]:
    """Return a usage summary and the most recent *limit* samples."""
    _require_auth(request, VIEWER_ROLE)
    with db_conn() as conn:
        agg = conn.execute(
            "SELECT COALESCE(SUM(tokens_in),0) tin, COALESCE(SUM(tokens_out),0) tout, "
            "COALESCE(SUM(total_tokens),0) t, COALESCE(SUM(cost_usd),0) c FROM usage_samples"
        ).fetchone()
        rows = conn.execute(
            "SELECT id,source,model,tokens_in,tokens_out,total_tokens,cost_usd,ts "
            "FROM usage_samples ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return {
        "summary": {
            "tokens_in": agg["tin"],
            "tokens_out": agg["tout"],
            "total_tokens": agg["t"],
            "cost_usd": agg["c"],
        },
        "items": [dict(r) for r in rows],
    }


@app.get("/usage/stream", tags=["usage"])
async def usage_stream(request: Request, limit: int = 80) -> StreamingResponse:
    """SSE stream of live usage updates."""
    _require_auth(request, VIEWER_ROLE)

    async def event_gen() -> AsyncIterator[str]:
        last_id = -1
        lim = max(1, min(limit, 500))
        try:
            while True:
                try:
                    with db_conn() as conn:
                        row = conn.execute(
                            "SELECT COALESCE(MAX(id),0) m FROM usage_samples"
                        ).fetchone()
                        max_id = int(row["m"])
                    if max_id != last_id:
                        with db_conn() as conn:
                            agg = conn.execute(
                                "SELECT COALESCE(SUM(tokens_in),0) tin, "
                                "COALESCE(SUM(tokens_out),0) tout, "
                                "COALESCE(SUM(total_tokens),0) t, "
                                "COALESCE(SUM(cost_usd),0) c FROM usage_samples"
                            ).fetchone()
                            rows = conn.execute(
                                "SELECT id,source,model,tokens_in,tokens_out,total_tokens,cost_usd,ts "
                                "FROM usage_samples ORDER BY id DESC LIMIT ?",
                                (lim,),
                            ).fetchall()
                        payload_str = json.dumps(
                            {
                                "summary": {
                                    "tokens_in": agg["tin"],
                                    "tokens_out": agg["tout"],
                                    "total_tokens": agg["t"],
                                    "cost_usd": agg["c"],
                                },
                                "items": [dict(r) for r in rows],
                            },
                            ensure_ascii=False,
                        )
                        yield f"data: {payload_str}\n\n"
                        last_id = max_id
                    else:
                        yield ": keepalive\n\n"
                    await asyncio.sleep(1)
                except asyncio.CancelledError:
                    raise
                except Exception as exc:
                    logger.error("usage_stream generator error: %s", exc)
                    yield f"data: {json.dumps({'error': 'stream error'})}\n\n"
                    await asyncio.sleep(2)
        finally:
            pass  # DB connections are closed inside db_conn() context managers

    return StreamingResponse(event_gen(), media_type="text/event-stream")


# ---------------------------------------------------------------------------
# Events endpoints
# ---------------------------------------------------------------------------

@app.get("/events", tags=["events"])
async def list_events(
    request: Request, limit: int = Query(100, ge=1, le=500)
) -> Dict[str, Any]:
    """Return the most recent *limit* events."""
    _require_auth(request, VIEWER_ROLE)
    with db_conn() as conn:
        rows = conn.execute(
            "SELECT id,level,source,message,ts FROM events ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
    return {"items": [dict(r) for r in rows], "count": len(rows)}


@app.get("/events/stream", tags=["events"])
async def events_stream(request: Request, limit: int = 100) -> StreamingResponse:
    """SSE stream of live event updates."""
    _require_auth(request, VIEWER_ROLE)

    async def event_gen() -> AsyncIterator[str]:
        last_id = -1
        lim = max(1, min(limit, 500))
        try:
            while True:
                try:
                    with db_conn() as conn:
                        row = conn.execute(
                            "SELECT COALESCE(MAX(id),0) m FROM events"
                        ).fetchone()
                        max_id = int(row["m"])
                    if max_id != last_id:
                        with db_conn() as conn:
                            rows = conn.execute(
                                "SELECT id,level,source,message,ts FROM events "
                                "ORDER BY id DESC LIMIT ?",
                                (lim,),
                            ).fetchall()
                        payload_str = json.dumps(
                            {"items": [dict(r) for r in rows], "count": len(rows)},
                            ensure_ascii=False,
                        )
                        yield f"data: {payload_str}\n\n"
                        last_id = max_id
                    else:
                        yield ": keepalive\n\n"
                    await asyncio.sleep(1)
                except asyncio.CancelledError:
                    raise
                except Exception as exc:
                    logger.error("events_stream generator error: %s", exc)
                    yield f"data: {json.dumps({'error': 'stream error'})}\n\n"
                    await asyncio.sleep(2)
        finally:
            pass  # DB connections are closed inside db_conn() context managers

    return StreamingResponse(event_gen(), media_type="text/event-stream")


# ---------------------------------------------------------------------------
# Capabilities
# ---------------------------------------------------------------------------

@app.get("/capabilities", tags=["catalog"])
async def capabilities(request: Request) -> Dict[str, Any]:
    """Return available skills, tools, connectors, agents, and service targets."""
    _require_auth(request, VIEWER_ROLE)
    with db_conn() as conn:
        agents = [r["name"] for r in conn.execute("SELECT name FROM agents ORDER BY name").fetchall()]
    return {
        "skills": SKILLS_CATALOG,
        "tools": TOOLS_CATALOG,
        "connectors": CHANNEL_CONNECTORS,
        "agents": agents,
        "service_targets": list(SERVICE_MAP.keys()),
    }


# ---------------------------------------------------------------------------
# Agents endpoints
# ---------------------------------------------------------------------------

@app.get("/agents", tags=["agents"])
async def list_agents(request: Request) -> Dict[str, Any]:
    """Return all registered agents."""
    _require_auth(request, VIEWER_ROLE)
    with db_conn() as conn:
        rows = conn.execute("SELECT * FROM agents ORDER BY name").fetchall()
    items = [row_to_agent(r) for r in rows]
    return {"items": items, "count": len(items)}


@app.get("/agents/{agent_id}", tags=["agents"])
async def get_agent(agent_id: str, request: Request) -> Dict[str, Any]:
    """Return a single agent by name/ID."""
    _require_auth(request, VIEWER_ROLE)
    with db_conn() as conn:
        row = conn.execute("SELECT * FROM agents WHERE name=?", (agent_id,)).fetchone()
    if not row:
        raise HTTPException(404, f"Agent not found: {agent_id}")
    return {"agent": row_to_agent(row)}


@app.post("/agents", tags=["agents"])
async def register_agent(payload: AgentConfig, request: Request) -> Dict[str, Any]:
    """Register or update an agent configuration."""
    _require_auth(request, OPERATOR_ROLE)
    if payload.target_service and payload.target_service not in SERVICE_MAP:
        raise HTTPException(400, f"Unknown target_service: {payload.target_service}")

    tools = sorted(list(dict.fromkeys(payload.tools)))
    skills = sorted(list(dict.fromkeys(payload.skills)))

    with db_conn() as conn:
        conn.execute(
            """
            INSERT INTO agents(name, role, model, tools_json, skills_json, enabled, parent, target_service, updated_at)
            VALUES(?,?,?,?,?,?,?,?,?)
            ON CONFLICT(name) DO UPDATE SET
              role=excluded.role,
              model=excluded.model,
              tools_json=excluded.tools_json,
              skills_json=excluded.skills_json,
              enabled=excluded.enabled,
              parent=excluded.parent,
              target_service=excluded.target_service,
              updated_at=excluded.updated_at
            """,
            (
                payload.name,
                payload.role,
                payload.model,
                json.dumps(tools),
                json.dumps(skills),
                int(payload.enabled),
                payload.parent,
                payload.target_service,
                now_iso(),
            ),
        )

    append_event("info", "agents", f"Agent upserted: {payload.name}")
    return {"ok": True, "agent": payload.model_dump()}


@app.delete("/agents/{agent_id}", tags=["agents"])
async def delete_agent(agent_id: str, request: Request) -> Dict[str, Any]:
    """Delete an agent by name/ID.  Core bootstrap agents can be deleted and will be
    re-seeded on the next gateway restart if the table is empty."""
    _require_auth(request, ADMIN_ROLE)
    with db_conn() as conn:
        row = conn.execute("SELECT name FROM agents WHERE name=?", (agent_id,)).fetchone()
        if not row:
            raise HTTPException(404, f"Agent not found: {agent_id}")
        conn.execute("DELETE FROM agents WHERE name=?", (agent_id,))
    append_event("info", "agents", f"Agent deleted: {agent_id}")
    return {"ok": True, "deleted": agent_id}


# ---------------------------------------------------------------------------
# Auth / API-key management
# ---------------------------------------------------------------------------

@app.get("/auth/keys", tags=["auth"])
async def list_keys(request: Request) -> Dict[str, Any]:
    """List all API keys (hashes never exposed)."""
    _require_auth(request, ADMIN_ROLE)
    with db_conn() as conn:
        rows = conn.execute(
            "SELECT id,name,role,enabled,created_at FROM api_keys ORDER BY id DESC"
        ).fetchall()
    return {"items": [dict(r) for r in rows]}


@app.post("/auth/keys", tags=["auth"])
async def create_key(
    request: Request,
    name: str = Query(..., min_length=2),
    role: str = Query(OPERATOR_ROLE),
) -> Dict[str, Any]:
    """Create a new API key.  The plaintext key is returned only once."""
    _require_auth(request, ADMIN_ROLE)
    if role not in [VIEWER_ROLE, OPERATOR_ROLE, ADMIN_ROLE]:
        raise HTTPException(400, "Invalid role")
    key_plain = secrets.token_urlsafe(32)
    with db_conn() as conn:
        conn.execute(
            "INSERT INTO api_keys(name,key_hash,role,enabled,created_at) VALUES(?,?,?,?,?)",
            (name, _hash_key(key_plain), role, 1, now_iso()),
        )
    return {"ok": True, "api_key": key_plain, "role": role, "name": name}


@app.post("/auth/keys/{key_id}/disable", tags=["auth"])
async def disable_key(key_id: int, request: Request) -> Dict[str, Any]:
    """Disable an API key by ID."""
    _require_auth(request, ADMIN_ROLE)
    with db_conn() as conn:
        row = conn.execute("SELECT id FROM api_keys WHERE id=?", (key_id,)).fetchone()
        if not row:
            raise HTTPException(404, f"API key not found: {key_id}")
        conn.execute("UPDATE api_keys SET enabled=0 WHERE id=?", (key_id,))
    append_event("info", "auth", f"API key {key_id} disabled")
    return {"ok": True, "id": key_id, "enabled": False}


@app.delete("/auth/keys/{key_id}", tags=["auth"])
async def delete_key(key_id: int, request: Request) -> Dict[str, Any]:
    """Permanently delete an API key by ID."""
    _require_auth(request, ADMIN_ROLE)
    with db_conn() as conn:
        row = conn.execute("SELECT id FROM api_keys WHERE id=?", (key_id,)).fetchone()
        if not row:
            raise HTTPException(404, f"API key not found: {key_id}")
        conn.execute("DELETE FROM api_keys WHERE id=?", (key_id,))
    append_event("info", "auth", f"API key {key_id} deleted")
    return {"ok": True, "deleted": key_id}


# ---------------------------------------------------------------------------
# Connector endpoints
# ---------------------------------------------------------------------------

@app.get("/connectors", tags=["connectors"])
async def list_connectors(request: Request) -> Dict[str, Any]:
    """Return all configured connectors."""
    _require_auth(request, VIEWER_ROLE)
    with db_conn() as conn:
        rows = conn.execute("SELECT * FROM connectors ORDER BY channel").fetchall()
    items = [dict(r) for r in rows]
    return {"items": items, "supported": CHANNEL_CONNECTORS}


@app.post("/connectors", tags=["connectors"])
async def configure_connector(payload: ConnectorConfig, request: Request) -> Dict[str, Any]:
    """Create or update a channel connector configuration."""
    _require_auth(request, OPERATOR_ROLE)
    if payload.channel not in CHANNEL_CONNECTORS:
        raise HTTPException(400, f"Unsupported channel: {payload.channel}")

    if payload.token_ref and _SECRET_PATTERN.search(payload.token_ref.lower()):
        raise HTTPException(
            400, "token_ref looks like a raw secret. Store only a secure reference/key name."
        )

    with db_conn() as conn:
        conn.execute(
            """
            INSERT INTO connectors(channel, enabled, bot_name, webhook_url, token_ref, updated_at)
            VALUES(?,?,?,?,?,?)
            ON CONFLICT(channel) DO UPDATE SET
              enabled=excluded.enabled,
              bot_name=excluded.bot_name,
              webhook_url=excluded.webhook_url,
              token_ref=excluded.token_ref,
              updated_at=excluded.updated_at
            """,
            (
                payload.channel,
                int(payload.enabled),
                payload.bot_name,
                payload.webhook_url,
                payload.token_ref,
                now_iso(),
            ),
        )

    append_event("info", "connectors", f"Connector configured: {payload.channel}")
    return {"ok": True, "connector": payload.model_dump()}


@app.post("/connectors/send", tags=["connectors"])
async def connector_send(payload: ConnectorSendRequest, request: Request) -> Dict[str, Any]:
    """Enqueue an outbound message for delivery via the specified channel."""
    _require_auth(request, OPERATOR_ROLE)
    if payload.channel not in CHANNEL_CONNECTORS:
        raise HTTPException(400, f"Unsupported channel: {payload.channel}")

    enqueue_job("connector_outbound", payload.model_dump())
    return {"ok": True, "queued": True}


@app.post("/connectors/webhook/{channel}", tags=["connectors"])
async def connector_webhook(
    channel: str, body: Dict[str, Any], request: Request
) -> Dict[str, Any]:
    """Receive inbound webhook from a channel connector.

    Performs HMAC validation when the corresponding secret is configured (C5).
    """
    if channel not in CHANNEL_CONNECTORS:
        raise HTTPException(400, f"Unsupported channel: {channel}")

    # Read raw body for HMAC validation
    try:
        raw_body = await request.body()
    except Exception:
        raw_body = b""

    if channel == "telegram":
        if not _validate_telegram_hmac(request, raw_body):
            raise HTTPException(401, "Invalid webhook signature")
    elif channel == "discord":
        if not _validate_discord_hmac(request, raw_body):
            raise HTTPException(401, "Invalid webhook signature")

    normalized = normalize_inbound(channel, body)
    enqueue_job("connector_inbound", normalized)
    return {"ok": True, "accepted": True}


# ---------------------------------------------------------------------------
# Jobs endpoint
# ---------------------------------------------------------------------------

@app.get("/jobs", tags=["jobs"])
async def list_jobs(
    request: Request, status: Optional[str] = None
) -> Dict[str, Any]:
    """Return the most recent 200 jobs, optionally filtered by status."""
    _require_auth(request, VIEWER_ROLE)
    with db_conn() as conn:
        if status:
            rows = conn.execute(
                "SELECT * FROM jobs WHERE status=? ORDER BY id DESC LIMIT 200", (status,)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM jobs ORDER BY id DESC LIMIT 200"
            ).fetchall()
    return {"items": [dict(r) for r in rows]}


# ---------------------------------------------------------------------------
# Chat endpoints
# ---------------------------------------------------------------------------

@app.post("/chat/actions/plan", tags=["chat"])
async def chat_action_plan(payload: ChatActionRequest, request: Request) -> Dict[str, Any]:
    """Generate an orchestration plan for the given goal."""
    _require_auth(request, VIEWER_ROLE)
    plan = {
        "goal": payload.goal,
        "steps": [
            "Analyze goal and constraints",
            "Select skills and tools",
            "Assign/subdivide tasks to agents",
            "Execute with safety checks",
            "Verify results and publish report",
        ],
        "selected_skills": list(payload.use_skills),
        "selected_tools": list(payload.use_tools),
        "subagents": payload.create_subagents,
        "channels": [c for c in payload.channels if c in CHANNEL_CONNECTORS],
    }
    append_chat("orchestrator", f"Plan generated for goal: {payload.goal}", "system")
    return {"ok": True, "plan": plan}


@app.get("/chat/thread", tags=["chat"])
async def chat_thread(request: Request, limit: int = 100) -> Dict[str, Any]:
    """Return the most recent *limit* chat messages in chronological order."""
    _require_auth(request, VIEWER_ROLE)
    lim = max(1, min(limit, 500))
    with db_conn() as conn:
        rows = conn.execute(
            "SELECT sender,text,kind,ts FROM chat_messages ORDER BY id DESC LIMIT ?", (lim,)
        ).fetchall()
    items = [dict(r) for r in reversed(rows)]
    return {"items": items, "count": len(items)}


@app.post("/chat/thread", tags=["chat"])
async def chat_post(payload: ChatMessage, request: Request) -> Dict[str, Any]:
    """Append a message to the chat thread."""
    _require_auth(request, VIEWER_ROLE)
    append_chat(payload.sender, payload.text, payload.kind)
    est_in = max(1, len(payload.text) // 4)
    append_usage(f"chat:{payload.sender}", None, est_in, 0, 0.0)
    return {"ok": True}


@app.post("/chat/ask", tags=["chat"])
async def chat_ask(payload: ChatAskRequest, request: Request) -> Dict[str, Any]:
    """Route a chat message to the appropriate agent service and return the response."""
    _require_auth(request, OPERATOR_ROLE)
    action = payload.action or "query"
    meta = []
    if payload.repo:
        meta.append(f"repo={payload.repo}")
    meta.append(f"thinking={payload.thinking or 'balanced'}")
    if payload.auto_edit:
        meta.append("auto_edit=true")
    if payload.attachments:
        meta.append(f"attachments={len(payload.attachments)}")

    append_chat("operator", payload.text, "human")
    append_chat("orchestrator", f"Ask -> {payload.agent}/{action} ({', '.join(meta)})", "dispatch")

    with db_conn() as conn:
        row = conn.execute("SELECT * FROM agents WHERE name=?", (payload.agent,)).fetchone()
    target = row["target_service"] if row and row["target_service"] else payload.agent
    base = SERVICE_MAP.get(target)
    if not base:
        target = "velktharion"
        base = SERVICE_MAP.get(target)
        append_event("warn", "chat", f"fallback target applied for agent={payload.agent} -> {target}")
    if not base:
        append_chat("orchestrator", f"Unknown target service for agent: {payload.agent}", "error")
        raise HTTPException(404, f"Unknown agent or target service: {payload.agent}")

    url = f"{base}/{action}"
    body = {
        "prompt": payload.text,
        "query": payload.text,
        "message": payload.text,
        "input": payload.text,
        "repo": payload.repo,
        "thinking": payload.thinking,
        "auto_edit": payload.auto_edit,
        "attachments": payload.attachments,
    }

    async with httpx.AsyncClient(timeout=30) as cli:
        try:
            r = await cli.post(url, json=body)
            result = r.json()
            u = _extract_usage(result if isinstance(result, dict) else {})
            if u["tokens_in"] or u["tokens_out"] or u["cost_usd"]:
                append_usage(
                    f"chatask:{payload.agent}/{action}",
                    u.get("model"),
                    int(u["tokens_in"]),
                    int(u["tokens_out"]),
                    float(u["cost_usd"]),
                )
            text = result.get("message") if isinstance(result, dict) else str(result)
            append_chat(payload.agent, str(text)[:4000], "agent")
            append_event("info", "chat", f"{payload.agent}/{action} -> {r.status_code}")
            return {
                "ok": True,
                "agent": payload.agent,
                "action": action,
                "status": r.status_code,
                "result": result,
            }
        except HTTPException:
            raise
        except Exception as exc:
            # C4 — log full error server-side, return generic message to client
            logger.error("chat_ask: %s/%s failed: %s", payload.agent, action, exc)
            append_chat(payload.agent, "chat ask failed", "error")
            append_event("error", "chat", f"{payload.agent}/{action} failed")
            raise HTTPException(502, "Upstream service error")


@app.post("/chat/roundtable", tags=["chat"])
async def chat_roundtable(payload: ChatRoundtableRequest, request: Request) -> Dict[str, Any]:
    """Run a multi-agent roundtable discussion on *topic*."""
    _require_auth(request, OPERATOR_ROLE)
    agents = payload.agents[:]
    if not agents:
        with db_conn() as conn:
            rows = conn.execute(
                "SELECT name FROM agents WHERE enabled=1 ORDER BY name LIMIT 5"
            ).fetchall()
            agents = [r["name"] for r in rows]

    transcript: List[Dict[str, Any]] = []
    append_chat("orchestrator", f"Roundtable started: {payload.topic}", "system")
    for round_i in range(payload.rounds):
        for ag in agents:
            ask = ChatAskRequest(
                agent=ag,
                text=f"[Round {round_i + 1}] {payload.topic}",
                action=payload.action,
                thinking=payload.thinking,
            )
            try:
                res = await chat_ask(ask, request)
                transcript.append({"agent": ag, "status": res.get("status", 200)})
            except Exception as exc:
                transcript.append({"agent": ag, "error": str(exc)})

    append_chat(
        "orchestrator", f"Roundtable finished with {len(transcript)} responses", "system"
    )
    return {
        "ok": True,
        "topic": payload.topic,
        "agents": agents,
        "rounds": payload.rounds,
        "items": transcript,
    }


@app.get("/chat/stream", tags=["chat"])
async def chat_stream(request: Request, limit: int = 120) -> StreamingResponse:
    """SSE stream of live chat-thread updates."""
    _require_auth(request, VIEWER_ROLE)

    async def event_gen() -> AsyncIterator[str]:
        last_count = -1
        lim = max(1, min(limit, 500))
        try:
            while True:
                try:
                    with db_conn() as conn:
                        count = conn.execute(
                            "SELECT COUNT(*) c FROM chat_messages"
                        ).fetchone()["c"]
                    if count != last_count:
                        with db_conn() as conn:
                            rows = conn.execute(
                                "SELECT sender,text,kind,ts FROM chat_messages "
                                "ORDER BY id DESC LIMIT ?",
                                (lim,),
                            ).fetchall()
                        items = [dict(r) for r in reversed(rows)]
                        payload_str = json.dumps(
                            {"items": items, "count": count}, ensure_ascii=False
                        )
                        yield f"data: {payload_str}\n\n"
                        last_count = count
                    else:
                        yield ": keepalive\n\n"
                    await asyncio.sleep(1)
                except asyncio.CancelledError:
                    raise
                except Exception as exc:
                    logger.error("chat_stream generator error: %s", exc)
                    yield f"data: {json.dumps({'error': 'stream error'})}\n\n"
                    await asyncio.sleep(2)
        finally:
            pass  # DB connections are closed inside db_conn() context managers

    return StreamingResponse(event_gen(), media_type="text/event-stream")


# ---------------------------------------------------------------------------
# Dispatch endpoint
# ---------------------------------------------------------------------------

@app.post("/dispatch/{agent}/{action}", tags=["dispatch"])
async def dispatch(
    agent: str, action: str, payload: Dict[str, Any], request: Request
) -> Dict[str, Any]:
    """Directly dispatch a request to an agent service."""
    _require_auth(request, OPERATOR_ROLE)

    with db_conn() as conn:
        row = conn.execute("SELECT * FROM agents WHERE name=?", (agent,)).fetchone()
    target = row["target_service"] if row and row["target_service"] else agent

    base = SERVICE_MAP.get(target)
    if not base:
        raise HTTPException(404, f"Unknown agent or target service: {agent}")

    url = f"{base}/{action}"
    append_chat("orchestrator", f"Dispatch -> {agent}/{action}", "dispatch")

    async with httpx.AsyncClient(timeout=30) as cli:
        try:
            r = await cli.post(url, json=payload)
            result = r.json()
            u = _extract_usage(result if isinstance(result, dict) else {})
            if u["tokens_in"] or u["tokens_out"] or u["cost_usd"]:
                append_usage(
                    f"dispatch:{agent}/{action}",
                    u.get("model"),
                    int(u["tokens_in"]),
                    int(u["tokens_out"]),
                    float(u["cost_usd"]),
                )
            append_chat(agent, f"Response status={r.status_code} action={action}", "agent")
            append_event("info", "dispatch", f"{agent}/{action} -> {r.status_code}")
            return {"agent": agent, "action": action, "status": r.status_code, "result": result}
        except HTTPException:
            raise
        except Exception as exc:
            # C4 — log full error server-side, return generic message to client
            logger.error("dispatch: %s/%s failed: %s", agent, action, exc)
            append_chat(agent, f"Dispatch error action={action}", "error")
            append_event("error", "dispatch", f"{agent}/{action} failed")
            raise HTTPException(502, "Upstream service error")


# ---------------------------------------------------------------------------
# KiloCode LLM endpoints
# ---------------------------------------------------------------------------

@app.get(
    "/gateway/llm/models",
    summary="List available KiloCode AI models",
    tags=["llm"],
)
async def llm_models(request: Request) -> Dict[str, Any]:
    """Proxy ``GET /models`` from the KiloCode AI Gateway and return the list.

    Requires at least viewer-level authentication.

    Returns a JSON object::

        {
          "engine": "kilocode",
          "base_url": "https://api.kilo.ai/api/gateway",
          "model_count": 42,
          "models": [...]
        }
    """
    _require_auth(request, VIEWER_ROLE)

    if not _kilo_available:
        raise HTTPException(503, "alchemical_core.llm is not installed (missing openai>=1.50.0)")

    try:
        _cfg = LLMConfig.from_env()  # type: ignore[union-attr]
        llm = AlchemicalLLM(_cfg)  # type: ignore[misc]
        models = await llm.get_available_models()
        return {
            "engine": "kilocode",
            "base_url": KILO_BASE_URL,
            "model_count": len(models),
            "models": models,
        }
    except Exception as exc:
        append_event("error", "llm", f"llm_models failed: {exc}")
        logger.error("llm_models failed: %s", exc)
        raise HTTPException(502, "Upstream service error")


@app.get(
    "/gateway/llm/health",
    summary="KiloCode AI Gateway health check",
    tags=["llm"],
)
async def llm_health() -> Dict[str, Any]:
    """Run a lightweight health probe against the KiloCode AI Gateway.

    Does **not** require authentication so that monitoring systems can call it
    without credentials.

    Returns a JSON object::

        {
          "engine": "kilocode",
          "api_key_configured": true,
          "default_model": "anthropic/claude-sonnet-4.5",
          "status": "ok",
          "model_count": 42,
          "latency_ms": 123.4
        }
    """
    if not _kilo_available:
        return {
            "engine": "kilocode",
            "api_key_configured": bool(KILO_API_KEY),
            "default_model": KILO_DEFAULT_MODEL,
            "status": "unavailable",
            "error": "alchemical_core.llm not importable — install openai>=1.50.0",
        }

    result = await KiloHealthCheck.check()  # type: ignore[union-attr]
    return {
        "engine": "kilocode",
        "api_key_configured": bool(KILO_API_KEY),
        "default_model": KILO_DEFAULT_MODEL,
        **result,
    }
