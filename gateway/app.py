import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException
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


class AgentConfig(BaseModel):
  name: str = Field(min_length=2, max_length=64)
  role: str = Field(min_length=2, max_length=128)
  model: str = Field(default="local-default")
  tools: List[str] = Field(default_factory=list)
  skills: List[str] = Field(default_factory=list)
  enabled: bool = True
  parent: Optional[str] = None


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
async def capabilities():
  return {
    "skills": SKILLS_CATALOG,
    "tools": TOOLS_CATALOG,
    "connectors": CHANNEL_CONNECTORS,
    "agents": list(MAP.keys()),
  }


@app.get('/agents')
async def list_agents():
  data = _read_json(AGENTS_REGISTRY, [])
  return {"items": data, "count": len(data)}


@app.post('/agents')
async def register_agent(payload: AgentConfig):
  data = _read_json(AGENTS_REGISTRY, [])
  filtered_tools = [t for t in payload.tools if t in TOOLS_CATALOG]
  filtered_skills = [s for s in payload.skills if s in SKILLS_CATALOG]

  record = payload.model_dump()
  record["tools"] = filtered_tools
  record["skills"] = filtered_skills

  data = [x for x in data if x.get("name") != payload.name]
  data.append(record)
  _write_json(AGENTS_REGISTRY, data)
  return {"ok": True, "agent": record}


@app.get('/connectors')
async def list_connectors():
  data = _read_json(CONNECTORS_REGISTRY, [])
  return {"items": data, "supported": CHANNEL_CONNECTORS}


@app.post('/connectors')
async def configure_connector(payload: ConnectorConfig):
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
async def chat_action_plan(payload: ChatActionRequest):
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


def _load_thread() -> List[Dict[str, Any]]:
  return _read_json(CHAT_THREAD, [])


def _save_thread(items: List[Dict[str, Any]]):
  _write_json(CHAT_THREAD, items[-500:])


@app.get('/chat/thread')
async def chat_thread(limit: int = 100):
  items = _load_thread()
  lim = max(1, min(limit, 500))
  return {"items": items[-lim:], "count": len(items)}


@app.post('/chat/thread')
async def chat_post(payload: ChatMessage):
  items = _load_thread()
  msg = payload.model_dump()
  msg["ts"] = __import__('datetime').datetime.utcnow().isoformat() + "Z"
  items.append(msg)
  _save_thread(items)
  return {"ok": True, "item": msg}


@app.post('/chat/simulate')
async def chat_simulate(goal: str = "sync-status"):
  participants = ["orchestrator", "velktharion", "synapsara", "kryonexus"]
  lines = [
    f"Objective received: {goal}",
    "Checking system health and active services",
    "Routing subtasks and collecting outputs",
    "Merging responses into final action plan",
  ]
  items = _load_thread()
  for i, line in enumerate(lines):
    items.append({
      "sender": participants[i % len(participants)],
      "text": line,
      "kind": "agent",
      "ts": __import__('datetime').datetime.utcnow().isoformat() + "Z",
    })
  _save_thread(items)
  return {"ok": True, "added": len(lines)}

@app.post('/dispatch/{agent}/{action}')
async def dispatch(agent: str, action: str, payload: Dict[str, Any]):
  base = MAP.get(agent)
  if not base:
    raise HTTPException(404, f"Unknown agent: {agent}")
  url = f"{base}/{action}"
  async with httpx.AsyncClient(timeout=30) as cli:
    try:
      r = await cli.post(url, json=payload)
      return {"agent": agent, "action": action, "status": r.status_code, "result": r.json()}
    except Exception as e:
      raise HTTPException(502, f"Dispatch error: {e}")
