import json
import os
import asyncio
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

app = FastAPI(title="alchemical-gateway")

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

RUNTIME_DIR = Path("/app/.runtime")
RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
AGENTS_REGISTRY = RUNTIME_DIR / "agents.registry.json"
CONNECTORS_REGISTRY = RUNTIME_DIR / "connectors.registry.json"

SKILLS_CATALOG = [
  "routing",
  "safety-guardrails",
  "task-planning",
  "summarization",
  "incident-response",
  "devops-ops",
  "code-review",
  "analytics",
]

TOOLS_CATALOG = [
  "http",
  "search",
  "memory",
  "shell",
  "docker-control",
  "logs",
  "notifications",
]

CHANNEL_CONNECTORS = ["telegram", "whatsapp", "discord", "slack", "signal"]


CORE_AGENT_TEMPLATES = [
  {
    "name": "alquimista-mayor",
    "role": "Orquestador / Director / Alquimista Mayor",
    "model": "local-default",
    "tools": ["memory", "notifications", "logs"],
    "skills": ["planning", "critical-reflection", "routing", "long-term-context"],
    "enabled": True,
    "parent": None,
    "target_service": "velktharion",
  },
  {
    "name": "investigador-analista",
    "role": "Investigador / Analista / Buscador de Verdad",
    "model": "local-default",
    "tools": ["search", "http", "memory"],
    "skills": ["fact-checking", "source-comparison", "deep-research"],
    "enabled": True,
    "parent": "alquimista-mayor",
    "target_service": "synapsara",
  },
  {
    "name": "ingeniero-constructor",
    "role": "Desarrollador / Ingeniero / Constructor",
    "model": "local-default",
    "tools": ["shell", "docker-control", "http", "logs"],
    "skills": ["coding", "debugging", "testing", "deployment"],
    "enabled": True,
    "parent": "alquimista-mayor",
    "target_service": "ignivox",
  },
  {
    "name": "creador-visual",
    "role": "Creador Visual / Diseñador / Artista Digital",
    "model": "local-default",
    "tools": ["http", "memory"],
    "skills": ["ui-ux", "branding", "image-generation", "motion"],
    "enabled": True,
    "parent": "alquimista-mayor",
    "target_service": "auralith",
  },
  {
    "name": "redactor-narrador",
    "role": "Redactor / Copywriter / Narrador / Estratega de Contenido",
    "model": "local-default",
    "tools": ["memory", "search", "http"],
    "skills": ["storytelling", "seo", "multilingual-writing", "editing"],
    "enabled": True,
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




def _ensure_registry_seeded():
  if not AGENTS_REGISTRY.exists():
    _write_json(AGENTS_REGISTRY, CORE_AGENT_TEMPLATES)

def _read_json(path: Path, fallback: Any):
  if not path.exists():
    return fallback
  try:
    return json.loads(path.read_text(encoding="utf-8"))
  except Exception:
    return fallback


def _write_json(path: Path, data: Any):
  path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


@app.get('/health')
async def health():
  return {"status": "ok", "service": "gateway"}


@app.get('/capabilities')
async def capabilities(request: Request):
  _require_token(request)
  return {
    "skills": SKILLS_CATALOG,
    "tools": TOOLS_CATALOG,
    "connectors": CHANNEL_CONNECTORS,
    "agents": [a.get("name") for a in _read_json(AGENTS_REGISTRY, CORE_AGENT_TEMPLATES)],
    "service_targets": list(MAP.keys()),
  }


@app.get('/agents')
async def list_agents(request: Request):
  _require_token(request)
  _ensure_registry_seeded()
  data = _read_json(AGENTS_REGISTRY, CORE_AGENT_TEMPLATES)
  return {"items": data, "count": len(data)}


@app.post('/agents')
async def register_agent(payload: AgentConfig, request: Request):
  _require_token(request)
  _ensure_registry_seeded()
  data = _read_json(AGENTS_REGISTRY, CORE_AGENT_TEMPLATES)

  # skills and tools are extensible by design (not hard-coupled to fixed agent list)
  record = payload.model_dump()
  record["tools"] = sorted(list(dict.fromkeys(payload.tools)))
  record["skills"] = sorted(list(dict.fromkeys(payload.skills)))
  if record.get("target_service") and record["target_service"] not in MAP:
    raise HTTPException(400, f"Unknown target_service: {record['target_service']}")

  data = [x for x in data if x.get("name") != payload.name]
  data.append(record)
  _write_json(AGENTS_REGISTRY, data)
  return {"ok": True, "agent": record}


@app.get('/connectors')
async def list_connectors(request: Request):
  _require_token(request)
  data = _read_json(CONNECTORS_REGISTRY, [])
  return {"items": data, "supported": CHANNEL_CONNECTORS}


@app.post('/connectors')
async def configure_connector(payload: ConnectorConfig, request: Request):
  _require_token(request)
  if payload.channel not in CHANNEL_CONNECTORS:
    raise HTTPException(400, f"Unsupported channel: {payload.channel}")

  # never store raw secrets; only references
  record = payload.model_dump()
  if record.get("token_ref") and any(x in record["token_ref"].lower() for x in ["ghp_", "pat_", "token", "secret"]):
    # heuristic guard to avoid accidentally storing raw secrets
    raise HTTPException(400, "token_ref looks like a raw secret. Store only a secure reference/key name.")

  data = _read_json(CONNECTORS_REGISTRY, [])
  data = [x for x in data if x.get("channel") != payload.channel]
  data.append(record)
  _write_json(CONNECTORS_REGISTRY, data)
  return {"ok": True, "connector": record}


@app.post('/chat/actions/plan')
async def chat_action_plan(payload: ChatActionRequest, request: Request):
  _require_token(request)
  plan = {
    "goal": payload.goal,
    "steps": [
      "Analyze goal and constraints",
      "Select skills and tools",
      "Assign/subdivide tasks to agents",
      "Execute with safety checks",
      "Verify results and publish report",
    ],
    "selected_skills": [s for s in payload.use_skills if s in SKILLS_CATALOG],
    "selected_tools": [t for t in payload.use_tools if t in TOOLS_CATALOG],
    "subagents": payload.create_subagents,
    "channels": [c for c in payload.channels if c in CHANNEL_CONNECTORS],
  }
  return {"ok": True, "plan": plan}




class ChatMessage(BaseModel):
  sender: str = Field(min_length=2, max_length=64)
  text: str = Field(min_length=1, max_length=4000)
  kind: str = Field(default="message")

CHAT_THREAD = RUNTIME_DIR / "chat.thread.json"


GATEWAY_TOKEN = os.getenv("ALCHEMICAL_GATEWAY_TOKEN", "")

def _require_token(request: Request):
  if not GATEWAY_TOKEN:
    return
  token = request.headers.get("x-alchemy-token", "")
  if token != GATEWAY_TOKEN:
    raise HTTPException(401, "Invalid or missing gateway token")


def _load_thread() -> List[Dict[str, Any]]:
  return _read_json(CHAT_THREAD, [])


def _save_thread(items: List[Dict[str, Any]]):
  _write_json(CHAT_THREAD, items[-500:])


@app.get('/chat/thread')
async def chat_thread(request: Request, limit: int = 100):
  _require_token(request)
  items = _load_thread()
  lim = max(1, min(limit, 500))
  return {"items": items[-lim:], "count": len(items)}


@app.post('/chat/thread')
async def chat_post(payload: ChatMessage, request: Request):
  _require_token(request)
  items = _load_thread()
  msg = payload.model_dump()
  msg["ts"] = __import__('datetime').datetime.utcnow().isoformat() + "Z"
  items.append(msg)
  _save_thread(items)
  return {"ok": True, "item": msg}





@app.get('/chat/stream')
async def chat_stream(request: Request, limit: int = 120):
  _require_token(request)
  async def event_gen():
    last_count = 0
    lim = max(1, min(limit, 500))
    while True:
      items = _load_thread()
      if len(items) != last_count:
        payload = json.dumps({"items": items[-lim:], "count": len(items)}, ensure_ascii=False)
        yield f"data: {payload}\n\n"
        last_count = len(items)
      else:
        yield ": keepalive\n\n"
      await asyncio.sleep(1)
  return StreamingResponse(event_gen(), media_type='text/event-stream')

@app.post('/dispatch/{agent}/{action}')
async def dispatch(agent: str, action: str, payload: Dict[str, Any], request: Request):
  _require_token(request)
  _ensure_registry_seeded()
  registry = _read_json(AGENTS_REGISTRY, CORE_AGENT_TEMPLATES)
  reg = next((a for a in registry if a.get("name") == agent), None)

  target = reg.get("target_service") if reg else agent
  base = MAP.get(target)
  if not base:
    raise HTTPException(404, f"Unknown agent or target service: {agent}")
  url = f"{base}/{action}"

  thread = _load_thread()
  thread.append({
    "sender": "orchestrator",
    "kind": "dispatch",
    "ts": __import__('datetime').datetime.utcnow().isoformat() + "Z",
    "text": f"Dispatch -> {agent}/{action}",
  })

  async with httpx.AsyncClient(timeout=30) as cli:
    try:
      r = await cli.post(url, json=payload)
      result = r.json()
      thread.append({
        "sender": agent,
        "kind": "agent",
        "ts": __import__('datetime').datetime.utcnow().isoformat() + "Z",
        "text": f"Response status={r.status_code} for action={action}",
      })
      _save_thread(thread)
      return {"agent": agent, "action": action, "status": r.status_code, "result": result}
    except Exception as e:
      thread.append({
        "sender": agent,
        "kind": "error",
        "ts": __import__('datetime').datetime.utcnow().isoformat() + "Z",
        "text": f"Dispatch error on action={action}: {e}",
      })
      _save_thread(thread)
      raise HTTPException(502, f"Dispatch error: {e}")
