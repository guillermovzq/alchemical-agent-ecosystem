"""Alchemical Agents Router - CRUD operations and provider management.

This module provides endpoints for:
- Agent management (CRUD)
- AI Provider configuration
- OpenClaw integration
- KiloCode integration
"""

from __future__ import annotations

import json
import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Generator, List, Optional

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

# Create router
router = APIRouter(prefix="/api/v1", tags=["agents"])

# Database path (must match app.py)
DB_PATH = Path(os.getenv("GATEWAY_DB_PATH", "/data/gateway.db"))

# Ensure data directory exists
def ensure_data_dir():
    """Ensure the data directory exists for SQLite database."""
    try:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        return True
    except Exception as e:
        print(f"Error creating data directory: {e}", flush=True)
        return False

# Create directory on module load
ensure_data_dir()


# ---------------------------------------------------------------------------
# Database Helper
# ---------------------------------------------------------------------------

@contextmanager
def db_conn() -> Generator[sqlite3.Connection, None, None]:
    """Context manager that opens a SQLite connection."""
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


# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------

class AgentCreate(BaseModel):
    """Model for creating a new agent."""
    name: str = Field(min_length=2, max_length=64)
    codename: Optional[str] = Field(default=None, max_length=64)
    role: str = Field(min_length=2, max_length=128)
    role_name: Optional[str] = Field(default=None)
    model: str = Field(default="anthropic/claude-sonnet-4")
    provider: str = Field(default="kilocode")
    description: Optional[str] = Field(default=None, max_length=512)
    system_prompt: Optional[str] = Field(default=None, max_length=8000)
    tools: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    capabilities: List[str] = Field(default_factory=list)
    enabled: bool = True
    parent: Optional[str] = None
    target_service: Optional[str] = None
    icon: Optional[str] = Field(default="🤖", max_length=8)
    color: Optional[str] = Field(default="#8B5CF6", max_length=7)


class AgentUpdate(BaseModel):
    """Model for updating an existing agent."""
    name: Optional[str] = Field(default=None, min_length=2, max_length=64)
    codename: Optional[str] = Field(default=None, max_length=64)
    role: Optional[str] = Field(default=None, min_length=2, max_length=128)
    role_name: Optional[str] = Field(default=None)
    model: Optional[str] = Field(default=None)
    provider: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None, max_length=512)
    system_prompt: Optional[str] = Field(default=None, max_length=8000)
    tools: Optional[List[str]] = Field(default=None)
    skills: Optional[List[str]] = Field(default=None)
    capabilities: Optional[List[str]] = Field(default=None)
    enabled: Optional[bool] = Field(default=None)
    parent: Optional[str] = Field(default=None)
    target_service: Optional[str] = Field(default=None)
    icon: Optional[str] = Field(default=None, max_length=8)
    color: Optional[str] = Field(default=None, max_length=7)


class ProviderInfo(BaseModel):
    """Information about an AI provider."""
    id: str
    name: str
    enabled: bool
    models: List[str]
    features: List[str]
    icon: str


class ProviderTestRequest(BaseModel):
    """Request to test a provider connection."""
    provider: str
    api_key: Optional[str] = Field(default=None)
    model: Optional[str] = Field(default=None)


class OpenClawRequest(BaseModel):
    """Request for OpenClaw integration."""
    action: str
    payload: Dict[str, Any] = Field(default_factory=dict)


# ---------------------------------------------------------------------------
# AI Providers Configuration
# ---------------------------------------------------------------------------

AI_PROVIDERS: Dict[str, Dict[str, Any]] = {
    "kilocode": {
        "name": "KiloCode AI Gateway",
        "enabled": bool(os.getenv("KILO_API_KEY", "")),
        "base_url": os.getenv("KILO_BASE_URL", "https://api.kilo.ai/api/gateway"),
        "api_key_env": "KILO_API_KEY",
        "models": [
            "anthropic/claude-sonnet-4",
            "anthropic/claude-3-haiku",
            "openai/gpt-4o",
            "openai/gpt-4o-mini",
            "google/gemini-1.5-flash",
            "google/gemini-1.5-pro",
            "deepseek/deepseek-chat",
            "deepseek/deepseek-coder",
            "meta/llama-3.3-70b",
            "meta/llama-3.2-1b",
        ],
        "features": ["streaming", "function_calling", "vision"],
        "icon": "⚡",
    },
    "openclaw": {
        "name": "OpenClaw",
        "enabled": bool(os.getenv("OPENCLAW_API_KEY", "")),
        "base_url": os.getenv("OPENCLAW_BASE_URL", "https://api.openclaw.ai/v1"),
        "api_key_env": "OPENCLAW_API_KEY",
        "models": [
            "claude-3-5-sonnet",
            "claude-3-haiku",
            "gpt-4o",
            "gpt-4o-mini",
        ],
        "features": ["streaming", "function_calling"],
        "icon": "🦾",
    },
    "openai": {
        "name": "OpenAI",
        "enabled": bool(os.getenv("OPENAI_API_KEY", "")),
        "base_url": "https://api.openai.com/v1",
        "api_key_env": "OPENAI_API_KEY",
        "models": [
            "gpt-4o",
            "gpt-4o-mini",
            "gpt-4-turbo",
            "gpt-3.5-turbo",
        ],
        "features": ["streaming", "function_calling", "vision"],
        "icon": "🤖",
    },
    "anthropic": {
        "name": "Anthropic",
        "enabled": bool(os.getenv("ANTHROPIC_API_KEY", "")),
        "base_url": "https://api.anthropic.com/v1",
        "api_key_env": "ANTHROPIC_API_KEY",
        "models": [
            "claude-3-5-sonnet-20241022",
            "claude-3-haiku-20240307",
            "claude-3-opus-20240229",
        ],
        "features": ["streaming", "function_calling", "vision"],
        "icon": "🧠",
    },
    "google": {
        "name": "Google AI",
        "enabled": bool(os.getenv("GOOGLE_API_KEY", "")),
        "base_url": "https://generativelanguage.googleapis.com/v1beta",
        "api_key_env": "GOOGLE_API_KEY",
        "models": [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro",
        ],
        "features": ["streaming", "vision"],
        "icon": "🔍",
    },
    "ollama": {
        "name": "Ollama (Local)",
        "enabled": bool(os.getenv("OLLAMA_HOST", "")),
        "base_url": os.getenv("OLLAMA_HOST", "http://localhost:11434"),
        "api_key_env": None,
        "models": [
            "llama3.2",
            "llama3.3",
            "mistral",
            "codellama",
            "phi3",
            "gemma2",
            "deepseek-r1",
        ],
        "features": ["streaming"],
        "icon": "🏠",
    },
}


# ---------------------------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------------------------

def row_to_agent(row: sqlite3.Row) -> Dict[str, Any]:
    """Convert a database row to an agent dictionary."""
    return {
        "id": row["name"],
        "name": row["name"],
        "codename": row["codename"],
        "role": row["role"],
        "role_name": row["role_name"],
        "model": row["model"],
        "provider": row["provider"],
        "description": row["description"],
        "system_prompt": row["system_prompt"],
        "tools": json.loads(row["tools_json"] or "[]"),
        "skills": json.loads(row["skills_json"] or "[]"),
        "capabilities": json.loads(row["capabilities_json"] or "[]"),
        "enabled": bool(row["enabled"]),
        "is_default": bool(row["is_default"]),
        "parent": row["parent"],
        "target_service": row["target_service"],
        "icon": row["icon"] or "🤖",
        "color": row["color"] or "#8B5CF6",
        "created_by": row["created_by"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


# ---------------------------------------------------------------------------
# Endpoints - Providers
# ---------------------------------------------------------------------------

@router.get("/providers", response_model=List[ProviderInfo])
async def list_providers() -> List[ProviderInfo]:
    """List all available AI providers and their status."""
    providers = []
    for provider_id, config in AI_PROVIDERS.items():
        providers.append(ProviderInfo(
            id=provider_id,
            name=config["name"],
            enabled=config["enabled"],
            models=config["models"],
            features=config["features"],
            icon=config["icon"],
        ))
    return providers


@router.get("/providers/{provider_id}")
async def get_provider(provider_id: str) -> Dict[str, Any]:
    """Get details about a specific provider."""
    if provider_id not in AI_PROVIDERS:
        raise HTTPException(status_code=404, detail=f"Provider '{provider_id}' not found")
    
    config = AI_PROVIDERS[provider_id].copy()
    # Remove sensitive info
    config.pop("api_key_env", None)
    return config


@router.post("/providers/{provider_id}/test")
async def test_provider(provider_id: str, request: ProviderTestRequest) -> Dict[str, Any]:
    """Test connection to a provider."""
    if provider_id not in AI_PROVIDERS:
        raise HTTPException(status_code=404, detail=f"Provider '{provider_id}' not found")
    
    config = AI_PROVIDERS[provider_id]
    api_key = request.api_key or os.getenv(config.get("api_key_env", ""), "")
    
    if not api_key and config.get("api_key_env"):
        return {
            "success": False,
            "message": f"API key not configured for {config['name']}",
        }
    
    try:
        # Simple connectivity test
        async with httpx.AsyncClient(timeout=10) as client:
            if provider_id == "ollama":
                # Test Ollama connection
                response = await client.get(f"{config['base_url']}/api/tags")
                if response.status_code == 200:
                    return {
                        "success": True,
                        "message": f"Successfully connected to {config['name']}",
                        "models": response.json().get("models", []),
                    }
            else:
                # For other providers, just verify we can reach the base URL
                headers = {}
                if api_key:
                    headers["Authorization"] = f"Bearer {api_key}"
                
                response = await client.get(config["base_url"], headers=headers)
                return {
                    "success": True,
                    "message": f"Successfully connected to {config['name']}",
                    "status_code": response.status_code,
                }
                
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to connect to {config['name']}: {str(e)}",
        }
    
    return {
        "success": False,
        "message": "Connection test failed",
    }


# ---------------------------------------------------------------------------
# Endpoints - Agents CRUD
# ---------------------------------------------------------------------------

@router.get("/agents")
async def list_agents(
    created_by: Optional[str] = None,
    enabled_only: bool = False,
    role: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """List all agents with optional filtering."""
    with db_conn() as conn:
        query = "SELECT * FROM agents WHERE 1=1"
        params: List[Any] = []
        
        if created_by:
            query += " AND created_by = ?"
            params.append(created_by)
        
        if enabled_only:
            query += " AND enabled = 1"
        
        if role:
            query += " AND role = ?"
            params.append(role)
        
        query += " ORDER BY is_default DESC, created_at DESC"
        
        rows = conn.execute(query, params).fetchall()
        return [row_to_agent(row) for row in rows]


@router.post("/agents")
async def create_agent(agent: AgentCreate, request: Request) -> Dict[str, Any]:
    """Create a new agent."""
    agent_id = f"agent-{uuid.uuid4().hex[:8]}"
    now = now_iso()
    
    # Get user from request if available, else 'system'
    created_by = getattr(request.state, 'user', 'system')
    
    with db_conn() as conn:
        # Check if name already exists
        existing = conn.execute(
            "SELECT 1 FROM agents WHERE name = ?", (agent.name,)
        ).fetchone()
        
        if existing:
            raise HTTPException(status_code=409, detail=f"Agent with name '{agent.name}' already exists")
        
        conn.execute(
            """
            INSERT INTO agents (
                id, name, codename, role, role_name, model, provider,
                description, system_prompt, tools_json, skills_json, capabilities_json,
                enabled, is_default, parent, target_service, icon, color,
                created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                agent_id,
                agent.name,
                agent.codename,
                agent.role,
                agent.role_name,
                agent.model,
                agent.provider,
                agent.description,
                agent.system_prompt,
                json.dumps(agent.tools),
                json.dumps(agent.skills),
                json.dumps(agent.capabilities),
                int(agent.enabled),
                0,  # Not default
                agent.parent,
                agent.target_service,
                agent.icon,
                agent.color,
                created_by,
                now,
                now,
            ),
        )
    
    # Return the created agent
    with db_conn() as conn:
        row = conn.execute("SELECT * FROM agents WHERE id = ?", (agent_id,)).fetchone()
        return row_to_agent(row)


@router.get("/agents/{agent_id}")
async def get_agent(agent_id: str) -> Dict[str, Any]:
    """Get a specific agent by ID."""
    with db_conn() as conn:
        row = conn.execute("SELECT * FROM agents WHERE id = ?", (agent_id,)).fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
        
        return row_to_agent(row)


@router.put("/agents/{agent_id}")
async def update_agent(agent_id: str, update: AgentUpdate) -> Dict[str, Any]:
    """Update an existing agent."""
    now = now_iso()
    
    with db_conn() as conn:
        # Check if agent exists
        row = conn.execute("SELECT * FROM agents WHERE id = ?", (agent_id,)).fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
        
        # Cannot update default agents
        if row["is_default"]:
            raise HTTPException(status_code=403, detail="Cannot modify default agents")
        
        # Build update fields
        updates = []
        params = []
        
        if update.name is not None:
            updates.append("name = ?")
            params.append(update.name)
        if update.codename is not None:
            updates.append("codename = ?")
            params.append(update.codename)
        if update.role is not None:
            updates.append("role = ?")
            params.append(update.role)
        if update.role_name is not None:
            updates.append("role_name = ?")
            params.append(update.role_name)
        if update.model is not None:
            updates.append("model = ?")
            params.append(update.model)
        if update.provider is not None:
            updates.append("provider = ?")
            params.append(update.provider)
        if update.description is not None:
            updates.append("description = ?")
            params.append(update.description)
        if update.system_prompt is not None:
            updates.append("system_prompt = ?")
            params.append(update.system_prompt)
        if update.tools is not None:
            updates.append("tools_json = ?")
            params.append(json.dumps(update.tools))
        if update.skills is not None:
            updates.append("skills_json = ?")
            params.append(json.dumps(update.skills))
        if update.capabilities is not None:
            updates.append("capabilities_json = ?")
            params.append(json.dumps(update.capabilities))
        if update.enabled is not None:
            updates.append("enabled = ?")
            params.append(int(update.enabled))
        if update.parent is not None:
            updates.append("parent = ?")
            params.append(update.parent)
        if update.target_service is not None:
            updates.append("target_service = ?")
            params.append(update.target_service)
        if update.icon is not None:
            updates.append("icon = ?")
            params.append(update.icon)
        if update.color is not None:
            updates.append("color = ?")
            params.append(update.color)
        
        updates.append("updated_at = ?")
        params.append(now)
        params.append(agent_id)
        
        conn.execute(
            f"UPDATE agents SET {', '.join(updates)} WHERE id = ?",
            params,
        )
    
    # Return updated agent
    with db_conn() as conn:
        row = conn.execute("SELECT * FROM agents WHERE id = ?", (agent_id,)).fetchone()
        return row_to_agent(row)


@router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str) -> Dict[str, Any]:
    """Delete an agent."""
    with db_conn() as conn:
        # Check if agent exists
        row = conn.execute("SELECT * FROM agents WHERE id = ?", (agent_id,)).fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
        
        # Cannot delete default agents
        if row["is_default"]:
            raise HTTPException(status_code=403, detail="Cannot delete default agents")
        
        conn.execute("DELETE FROM agents WHERE id = ?", (agent_id,))
        
        return {"success": True, "message": f"Agent '{agent_id}' deleted"}


# ---------------------------------------------------------------------------
# Endpoints - OpenClaw Integration
# ---------------------------------------------------------------------------

@router.post("/openclaw/{action}")
async def openclaw_action(action: str, request: OpenClawRequest) -> Dict[str, Any]:
    """Execute an action through OpenClaw integration."""
    openclaw_key = os.getenv("OPENCLAW_API_KEY", "")
    openclaw_base = os.getenv("OPENCLAW_BASE_URL", "https://api.openclaw.ai/v1")
    
    if not openclaw_key:
        raise HTTPException(status_code=503, detail="OpenClaw not configured")
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{openclaw_base}/{action}",
                json=request.payload,
                headers={
                    "Authorization": f"Bearer {openclaw_key}",
                    "Content-Type": "application/json",
                },
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "data": response.json(),
                }
            else:
                return {
                    "success": False,
                    "error": f"OpenClaw returned {response.status_code}",
                    "detail": response.text,
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenClaw request failed: {str(e)}")


@router.get("/openclaw/status")
async def openclaw_status() -> Dict[str, Any]:
    """Check OpenClaw integration status."""
    openclaw_key = os.getenv("OPENCLAW_API_KEY", "")
    openclaw_base = os.getenv("OPENCLAW_BASE_URL", "https://api.openclaw.ai/v1")
    
    if not openclaw_key:
        return {
            "enabled": False,
            "message": "OpenClaw API key not configured",
        }
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{openclaw_base}/status",
                headers={"Authorization": f"Bearer {openclaw_key}"},
            )
            
            return {
                "enabled": True,
                "connected": response.status_code == 200,
                "status_code": response.status_code,
            }
            
    except Exception as e:
        return {
            "enabled": True,
            "connected": False,
            "error": str(e),
        }


# ---------------------------------------------------------------------------
# Endpoints - Alchemical Roles
# ---------------------------------------------------------------------------

@router.get("/roles")
async def list_roles() -> Dict[str, Any]:
    """List all available alchemical agent roles."""
    return {
        "prima_materia": {
            "name": "Prima Materia",
            "description": "El punto de origen. Todo comienza aquí. Arquitectura, visión global y fundamentos.",
            "glyph": "🜔",
            "color": "#FFD700",
        },
        "tejedor": {
            "name": "Tejedor",
            "description": "Conecta, integra y da contexto. Sincroniza entre sistemas y agentes.",
            "glyph": "🜚",
            "color": "#8B5CF6",
        },
        "centinela": {
            "name": "Centinela",
            "description": "Vigía silencioso. Seguridad, monitoreo y alertas.",
            "glyph": "🜏",
            "color": "#EF4444",
        },
        "catalizador": {
            "name": "Catalizador",
            "description": "Acelera, transforma y potencia. Optimización y mejora continua.",
            "glyph": "🜂",
            "color": "#FF4D00",
        },
        "refinador": {
            "name": "Refinador",
            "description": "Purifica y perfecciona. Documentación, claridad y excelencia.",
            "glyph": "🜁",
            "color": "#00CED1",
        },
    }


# ---------------------------------------------------------------------------
# Endpoints - KiloCode Integration
# ---------------------------------------------------------------------------

@router.get("/kilocode/status")
async def kilocode_status() -> Dict[str, Any]:
    """Check KiloCode integration status."""
    kilo_key = os.getenv("KILO_API_KEY", "")
    kilo_base = os.getenv("KILO_BASE_URL", "https://api.kilo.ai/api/gateway")
    
    if not kilo_key and request.get("model", "").find(":free") == -1:
        return {
            "enabled": False,
            "message": "KiloCode API key not configured",
        }
    
    return {
        "enabled": True,
        "base_url": kilo_base,
        "message": "KiloCode configured",
    }


@router.post("/kilocode/chat")
async def kilocode_chat(request: Dict[str, Any]) -> Dict[str, Any]:
    """Send a chat request to KiloCode."""
    kilo_key = os.getenv("KILO_API_KEY", "")
    kilo_base = os.getenv("KILO_BASE_URL", "https://api.kilo.ai/api/gateway")
    
    if not kilo_key and request.get("model", "").find(":free") == -1:
        raise HTTPException(status_code=503, detail="KiloCode not configured")
    
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{kilo_base}/chat/completions",
                json=request,
                headers={
                    "Authorization": f"Bearer {kilo_key}" if kilo_key else "",
                    "Content-Type": "application/json",
                },
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "data": response.json(),
                }
            else:
                return {
                    "success": False,
                    "error": f"KiloCode returned {response.status_code}",
                    "detail": response.text,
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"KiloCode request failed: {str(e)}")

# ── Sincentes OpenClawronización de Ag/KiloCode ─────────────────
import os
import glob

@router.post("/sync/openclaw-agents")
async def sync_openclaw_agents():
    """Sincroniza agentes de OpenClaw con Alchemical."""
    openclaw_agents_dir = os.getenv("OPENCLAW_AGENTS_DIR", "/openclaw-agents")
    
    if not os.path.exists(openclaw_agents_dir):
        return {"success": False, "error": "OpenClaw agents directory not found"}
    
    agents_dir = glob.glob(os.path.join(openclaw_agents_dir, "*/"))
    synced = []
    
    with db_conn() as conn:
        for agent_dir in agents_dir:
            agent_name = os.path.basename(os.path.dirname(agent_dir))
            
            role = "openclaw"
            model = "minimax/minimax-m2.5:free"
            
            existing = conn.execute(
                "SELECT name FROM agents WHERE name = ?", [agent_name]
            ).fetchone()
            
            if not existing:
                conn.execute(
                    """INSERT INTO agents (name, role, model, tools_json, skills_json, enabled, parent, target_service, updated_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    [agent_name, role, model, "[]", "[]", 1, None, None, "2026-03-02"]
                )
                synced.append(agent_name)
    
    return {"success": True, "synced": synced, "total": len(synced)}

@router.get("/providers")
async def list_providers():
    """Lista proveedores LLM disponibles."""
    return {
        "providers": [
            {"id": "kilocode", "name": "KiloCode AI", "status": "active", "models": ["minimax/minimax-m2.5:free", "anthropic/claude-sonnet-4.5:free"]},
            {"id": "openclaude", "name": "OpenClaw", "status": "active", "agents": ["vps-ops", "rpgclaw-ops", "flickclaw-ops", "img-ops", "main"]},
        ]
    }
