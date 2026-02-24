import asyncio
import json
import os
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="alchemical-gateway",
    version="0.2.0",
    description="Local-first orchestration gateway for Alchemical Agent Ecosystem",
)


MAP = {
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
  # CI/readonly fallback
  RUNTIME_DIR = Path("/tmp/alchemical-runtime")
  RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = RUNTIME_DIR / "gateway.db"

GATEWAY_TOKEN = os.getenv("ALCHEMICAL_GATEWAY_TOKEN", "")
ADMIN_ROLE = "admin"
OPERATOR_ROLE = "operator"
VIEWER_ROLE = "viewer"
MAX_BODY_BYTES = int(os.getenv("ALCHEMICAL_MAX_BODY_BYTES", "262144"))
RATE_LIMIT_PER_MIN = int(os.getenv("ALCHEMICAL_RATE_LIMIT_PER_MIN", "120"))
ALLOWED_ORIGINS = [x.strip() for x in os.getenv("ALCHEMICAL_ALLOWED_ORIGINS", "*").split(",") if x.strip()]
_rate_window: Dict[str, List[float]] = {}

app.add_middleware(
  CORSMiddleware,
  allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != ["*"] else ["*"],
  allow_credentials=False,
  allow_methods=["*"],
  allow_headers=["*"],
)

SKILLS_CATALOG = [
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

TOOLS_CATALOG = [
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

CHANNEL_CONNECTORS = ["telegram", "whatsapp", "discord", "slack", "signal"]

CORE_AGENT_TEMPLATES = [
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


class AgentConfig(BaseModel):
  name: str = Field(min_length=2, max_length=64)
  role: str = Field(min_length=2, max_length=128)
  model: str = Field(default="local-default")
  tools: List[str] = Field(default_factory=list)
  skills: List[str] = Field(default_factory=list)
  enabled: bool = True
  parent: Optional[str] = None
  target_service: Optional[str] = None


class ConnectorConfig(BaseModel):
  channel: str
  enabled: bool = True
  bot_name: Optional[str] = None
  webhook_url: Optional[str] = None
  token_ref: Optional[str] = Field(default=None, description="Reference only (not raw secret)")


class ChatActionRequest(BaseModel):
  goal: str
  use_skills: List[str] = Field(default_factory=list)
  use_tools: List[str] = Field(default_factory=list)
  create_subagents: List[str] = Field(default_factory=list)
  channels: List[str] = Field(default_factory=list)


class ChatMessage(BaseModel):
  sender: str = Field(min_length=2, max_length=64)
  text: str = Field(min_length=1, max_length=4000)
  kind: str = Field(default="message")


class ConnectorSendRequest(BaseModel):
  channel: str
  target: str = Field(min_length=1, max_length=128)
  message: str = Field(min_length=1, max_length=4000)


@contextmanager
def db_conn():
  conn = sqlite3.connect(DB_PATH)
  conn.row_factory = sqlite3.Row
  try:
    yield conn
    conn.commit()
  finally:
    conn.close()


def now_iso() -> str:
  return datetime.now(timezone.utc).isoformat()


def _require_auth(request: Request, min_role: str = VIEWER_ROLE):
  _enforce_rate_limit(request)
  _enforce_body_size(request)

  # primary token guard
  if GATEWAY_TOKEN:
    token = request.headers.get("x-alchemy-token", "")
    if token != GATEWAY_TOKEN:
      raise HTTPException(401, "Invalid or missing gateway token")

  # role can come from API key or explicit header
  role = None
  api_key = request.headers.get("x-api-key", "")
  if api_key:
    role = _auth_role_from_db(api_key)
    if not role:
      raise HTTPException(401, "Invalid API key")
  if not role:
    role = request.headers.get("x-alchemy-role", OPERATOR_ROLE)

  order = {VIEWER_ROLE: 1, OPERATOR_ROLE: 2, ADMIN_ROLE: 3}
  if order.get(role, 0) < order.get(min_role, 1):
    raise HTTPException(403, f"Role '{role}' cannot access this endpoint")



def _enforce_rate_limit(request: Request):
  client = request.client.host if request.client else "unknown"
  now = datetime.now(timezone.utc).timestamp()
  window_start = now - 60
  bucket = _rate_window.get(client, [])
  bucket = [t for t in bucket if t >= window_start]
  if len(bucket) >= RATE_LIMIT_PER_MIN:
    raise HTTPException(429, "Rate limit exceeded")
  bucket.append(now)
  _rate_window[client] = bucket


def _enforce_body_size(request: Request):
  cl = request.headers.get("content-length")
  if cl and cl.isdigit() and int(cl) > MAX_BODY_BYTES:
    raise HTTPException(413, f"Payload too large. Max {MAX_BODY_BYTES} bytes")


def _auth_role_from_db(api_key: str) -> Optional[str]:
  with db_conn() as conn:
    row = conn.execute("SELECT role,enabled FROM api_keys WHERE key_hash=?", (api_key,)).fetchone()
  if not row or not int(row["enabled"]):
    return None
  return row["role"]

def init_db():
  with db_conn() as conn:
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

    admin_key = os.getenv("ALCHEMICAL_ADMIN_API_KEY", "")
    if admin_key:
      conn.execute("INSERT OR IGNORE INTO api_keys(name,key_hash,role,enabled,created_at) VALUES(?,?,?,?,?)", ("bootstrap-admin", admin_key, "admin", 1, now_iso()))

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


def row_to_agent(row: sqlite3.Row) -> Dict[str, Any]:
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


def append_chat(sender: str, text: str, kind: str = "message"):
  with db_conn() as conn:
    conn.execute(
      "INSERT INTO chat_messages(sender, text, kind, ts) VALUES(?,?,?,?)",
      (sender, text, kind, now_iso()),
    )


def append_event(level: str, source: str, message: str):
  with db_conn() as conn:
    conn.execute(
      "INSERT INTO events(level, source, message, ts) VALUES(?,?,?,?)",
      (level, source, message, now_iso()),
    )


def enqueue_job(kind: str, payload: Dict[str, Any], max_attempts: int = 5):
  ts = now_iso()
  with db_conn() as conn:
    conn.execute(
      """
      INSERT INTO jobs(kind, payload_json, status, attempts, max_attempts, next_run_ts, error, created_at, updated_at)
      VALUES(?,?,?,?,?,?,?,?,?)
      """,
      (kind, json.dumps(payload), "queued", 0, max_attempts, ts, None, ts, ts),
    )


def parse_ts(ts: Optional[str]) -> datetime:
  if not ts:
    return datetime.now(timezone.utc)
  return datetime.fromisoformat(ts.replace("Z", "+00:00"))


async def job_worker():
  while True:
    await asyncio.sleep(1)
    job = None
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

    if not job:
      continue

    try:
      payload = json.loads(job["payload_json"])
      if job["kind"] == "connector_outbound":
        channel = payload.get("channel")
        target = payload.get("target")
        message = payload.get("message", "")
        with db_conn() as conn:
          c = conn.execute("SELECT webhook_url,enabled FROM connectors WHERE channel=?", (channel,)).fetchone()
        if c and int(c["enabled"]) and c["webhook_url"]:
          async with httpx.AsyncClient(timeout=15) as cli:
            await cli.post(c["webhook_url"], json={"target": target, "message": message, "channel": channel})
          append_event("info", "connector", f"Outbound delivered to {channel}:{target}")
        else:
          append_event("warn", "connector", f"Connector {channel} has no webhook_url; stored only")
        append_chat(f"connector:{channel}", message, "connector")
      elif job["kind"] == "connector_inbound":
        append_event("info", "connector", f"Inbound from {payload.get('channel')}:{payload.get('from')}")
        append_chat(f"inbound:{payload.get('channel')}", payload.get("text", ""), "connector")
      else:
        append_event("warn", "jobs", f"Unknown job kind: {job['kind']}")

      with db_conn() as conn:
        conn.execute(
          "UPDATE jobs SET status='done', updated_at=? WHERE id=?",
          (now_iso(), job["id"]),
        )
    except Exception as e:
      attempts = int(job["attempts"]) + 1
      max_attempts = int(job["max_attempts"])
      next_status = "failed" if attempts >= max_attempts else "retry"
      delay = min(2 ** attempts, 60)
      next_run = datetime.now(timezone.utc).timestamp() + delay
      next_run_ts = datetime.fromtimestamp(next_run, tz=timezone.utc).isoformat()
      with db_conn() as conn:
        conn.execute(
          """
          UPDATE jobs
          SET status=?, attempts=?, next_run_ts=?, error=?, updated_at=?
          WHERE id=?
          """,
          (next_status, attempts, next_run_ts, str(e), now_iso(), job["id"]),
        )
      append_event("error", "jobs", f"Job {job['id']} failed ({next_status}): {e}")


@app.on_event("startup")
async def startup_event():
  init_db()
  asyncio.create_task(job_worker())


@app.get('/health')
async def health():
  return {"status": "ok", "service": "gateway", "db": str(DB_PATH)}




@app.get('/ready')
async def ready(request: Request):
  _require_auth(request, VIEWER_ROLE)
  with db_conn() as conn:
    agent_count = conn.execute("SELECT COUNT(*) c FROM agents").fetchone()["c"]
    connector_count = conn.execute("SELECT COUNT(*) c FROM connectors").fetchone()["c"]
  return {
    "status": "ready",
    "agents": agent_count,
    "connectors": connector_count,
    "service_targets": len(MAP),
    "timestamp": now_iso(),
  }


@app.get('/stats')
async def stats(request: Request):
  _require_auth(request, VIEWER_ROLE)
  with db_conn() as conn:
    jobs = conn.execute("SELECT status, COUNT(*) c FROM jobs GROUP BY status").fetchall()
    chats = conn.execute("SELECT COUNT(*) c FROM chat_messages").fetchone()["c"]
    events = conn.execute("SELECT COUNT(*) c FROM events").fetchone()["c"]
  return {
    "chat_messages": chats,
    "events": events,
    "jobs": {r["status"]: r["c"] for r in jobs},
    "timestamp": now_iso(),
  }


@app.get('/events')
async def list_events(request: Request, limit: int = Query(100, ge=1, le=500)):
  _require_auth(request, VIEWER_ROLE)
  with db_conn() as conn:
    rows = conn.execute("SELECT id,level,source,message,ts FROM events ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
  return {"items": [dict(r) for r in rows], "count": len(rows)}


@app.get('/events/stream')
async def events_stream(request: Request, limit: int = 100):
  _require_auth(request, VIEWER_ROLE)

  async def event_gen():
    last_id = -1
    lim = max(1, min(limit, 500))
    while True:
      with db_conn() as conn:
        row = conn.execute("SELECT COALESCE(MAX(id),0) m FROM events").fetchone()
        max_id = int(row["m"])
      if max_id != last_id:
        with db_conn() as conn:
          rows = conn.execute("SELECT id,level,source,message,ts FROM events ORDER BY id DESC LIMIT ?", (lim,)).fetchall()
        payload = json.dumps({"items": [dict(r) for r in rows], "count": len(rows)}, ensure_ascii=False)
        yield f"data: {payload}\n\n"
        last_id = max_id
      else:
        yield ": keepalive\n\n"
      await asyncio.sleep(1)

  return StreamingResponse(event_gen(), media_type='text/event-stream')

@app.get('/capabilities')
async def capabilities(request: Request):
  _require_auth(request, VIEWER_ROLE)
  with db_conn() as conn:
    agents = [r["name"] for r in conn.execute("SELECT name FROM agents ORDER BY name").fetchall()]
  return {
    "skills": SKILLS_CATALOG,
    "tools": TOOLS_CATALOG,
    "connectors": CHANNEL_CONNECTORS,
    "agents": agents,
    "service_targets": list(MAP.keys()),
  }


@app.get('/agents')
async def list_agents(request: Request):
  _require_auth(request, VIEWER_ROLE)
  with db_conn() as conn:
    rows = conn.execute("SELECT * FROM agents ORDER BY name").fetchall()
  items = [row_to_agent(r) for r in rows]
  return {"items": items, "count": len(items)}




@app.get('/agents/{name}')
async def get_agent(name: str, request: Request):
  _require_auth(request, VIEWER_ROLE)
  with db_conn() as conn:
    row = conn.execute("SELECT * FROM agents WHERE name=?", (name,)).fetchone()
  if not row:
    raise HTTPException(404, f"Agent not found: {name}")
  return {"agent": row_to_agent(row)}

@app.post('/agents')
async def register_agent(payload: AgentConfig, request: Request):
  _require_auth(request, OPERATOR_ROLE)
  if payload.target_service and payload.target_service not in MAP:
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




@app.get('/auth/keys')
async def list_keys(request: Request):
  _require_auth(request, ADMIN_ROLE)
  with db_conn() as conn:
    rows = conn.execute("SELECT id,name,role,enabled,created_at FROM api_keys ORDER BY id DESC").fetchall()
  return {"items": [dict(r) for r in rows]}


@app.post('/auth/keys')
async def create_key(request: Request, name: str = Query(..., min_length=2), role: str = Query(OPERATOR_ROLE)):
  _require_auth(request, ADMIN_ROLE)
  if role not in [VIEWER_ROLE, OPERATOR_ROLE, ADMIN_ROLE]:
    raise HTTPException(400, "Invalid role")
  key_plain = secrets.token_urlsafe(32)
  with db_conn() as conn:
    conn.execute(
      "INSERT INTO api_keys(name,key_hash,role,enabled,created_at) VALUES(?,?,?,?,?)",
      (name, key_plain, role, 1, now_iso()),
    )
  return {"ok": True, "api_key": key_plain, "role": role, "name": name}


@app.post('/auth/keys/{key_id}/disable')
async def disable_key(key_id: int, request: Request):
  _require_auth(request, ADMIN_ROLE)
  with db_conn() as conn:
    conn.execute("UPDATE api_keys SET enabled=0 WHERE id=?", (key_id,))
  return {"ok": True, "id": key_id, "enabled": False}

@app.get('/connectors')
async def list_connectors(request: Request):
  _require_auth(request, VIEWER_ROLE)
  with db_conn() as conn:
    rows = conn.execute("SELECT * FROM connectors ORDER BY channel").fetchall()
  items = [dict(r) for r in rows]
  return {"items": items, "supported": CHANNEL_CONNECTORS}


@app.post('/connectors')
async def configure_connector(payload: ConnectorConfig, request: Request):
  _require_auth(request, OPERATOR_ROLE)
  if payload.channel not in CHANNEL_CONNECTORS:
    raise HTTPException(400, f"Unsupported channel: {payload.channel}")

  if payload.token_ref and any(x in payload.token_ref.lower() for x in ["ghp_", "pat_", "token", "secret"]):
    raise HTTPException(400, "token_ref looks like a raw secret. Store only a secure reference/key name.")

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
      (payload.channel, int(payload.enabled), payload.bot_name, payload.webhook_url, payload.token_ref, now_iso()),
    )

  append_event("info", "connectors", f"Connector configured: {payload.channel}")
  return {"ok": True, "connector": payload.model_dump()}


@app.post('/connectors/send')
async def connector_send(payload: ConnectorSendRequest, request: Request):
  _require_auth(request, OPERATOR_ROLE)
  if payload.channel not in CHANNEL_CONNECTORS:
    raise HTTPException(400, f"Unsupported channel: {payload.channel}")

  enqueue_job("connector_outbound", payload.model_dump())
  return {"ok": True, "queued": True}


@app.post('/connectors/webhook/{channel}')
async def connector_webhook(channel: str, body: Dict[str, Any], request: Request):
  _require_auth(request, OPERATOR_ROLE)
  if channel not in CHANNEL_CONNECTORS:
    raise HTTPException(400, f"Unsupported channel: {channel}")

  enqueue_job("connector_inbound", {"channel": channel, **body})
  return {"ok": True, "accepted": True}


@app.get('/jobs')
async def list_jobs(request: Request, status: Optional[str] = None):
  _require_auth(request, VIEWER_ROLE)
  with db_conn() as conn:
    if status:
      rows = conn.execute("SELECT * FROM jobs WHERE status=? ORDER BY id DESC LIMIT 200", (status,)).fetchall()
    else:
      rows = conn.execute("SELECT * FROM jobs ORDER BY id DESC LIMIT 200").fetchall()
  return {"items": [dict(r) for r in rows]}


@app.post('/chat/actions/plan')
async def chat_action_plan(payload: ChatActionRequest, request: Request):
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
    "selected_skills": [s for s in payload.use_skills],
    "selected_tools": [t for t in payload.use_tools],
    "subagents": payload.create_subagents,
    "channels": [c for c in payload.channels if c in CHANNEL_CONNECTORS],
  }
  append_chat("orchestrator", f"Plan generated for goal: {payload.goal}", "system")
  return {"ok": True, "plan": plan}


@app.get('/chat/thread')
async def chat_thread(request: Request, limit: int = 100):
  _require_auth(request, VIEWER_ROLE)
  lim = max(1, min(limit, 500))
  with db_conn() as conn:
    rows = conn.execute("SELECT sender,text,kind,ts FROM chat_messages ORDER BY id DESC LIMIT ?", (lim,)).fetchall()
  items = [dict(r) for r in reversed(rows)]
  return {"items": items, "count": len(items)}


@app.post('/chat/thread')
async def chat_post(payload: ChatMessage, request: Request):
  _require_auth(request, VIEWER_ROLE)
  append_chat(payload.sender, payload.text, payload.kind)
  return {"ok": True}


@app.get('/chat/stream')
async def chat_stream(request: Request, limit: int = 120):
  _require_auth(request, VIEWER_ROLE)

  async def event_gen():
    last_count = -1
    lim = max(1, min(limit, 500))
    while True:
      with db_conn() as conn:
        count = conn.execute("SELECT COUNT(*) c FROM chat_messages").fetchone()["c"]
      if count != last_count:
        with db_conn() as conn:
          rows = conn.execute("SELECT sender,text,kind,ts FROM chat_messages ORDER BY id DESC LIMIT ?", (lim,)).fetchall()
        items = [dict(r) for r in reversed(rows)]
        payload = json.dumps({"items": items, "count": count}, ensure_ascii=False)
        yield f"data: {payload}\n\n"
        last_count = count
      else:
        yield ": keepalive\n\n"
      await asyncio.sleep(1)

  return StreamingResponse(event_gen(), media_type='text/event-stream')


@app.post('/dispatch/{agent}/{action}')
async def dispatch(agent: str, action: str, payload: Dict[str, Any], request: Request):
  _require_auth(request, OPERATOR_ROLE)

  with db_conn() as conn:
    row = conn.execute("SELECT * FROM agents WHERE name=?", (agent,)).fetchone()
  target = row["target_service"] if row and row["target_service"] else agent

  base = MAP.get(target)
  if not base:
    raise HTTPException(404, f"Unknown agent or target service: {agent}")

  url = f"{base}/{action}"
  append_chat("orchestrator", f"Dispatch -> {agent}/{action}", "dispatch")

  async with httpx.AsyncClient(timeout=30) as cli:
    try:
      r = await cli.post(url, json=payload)
      result = r.json()
      append_chat(agent, f"Response status={r.status_code} action={action}", "agent")
      append_event("info", "dispatch", f"{agent}/{action} -> {r.status_code}")
      return {"agent": agent, "action": action, "status": r.status_code, "result": result}
    except Exception as e:
      append_chat(agent, f"Dispatch error action={action}: {e}", "error")
      append_event("error", "dispatch", f"{agent}/{action} failed: {e}")
      raise HTTPException(502, f"Dispatch error: {e}")
