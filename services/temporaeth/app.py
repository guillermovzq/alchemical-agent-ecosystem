"""
temporaeth — Temporal reasoning, scheduling, and effort estimation.
Port: 7401
"""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, HTTPException
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
SERVICE_NAME = os.getenv("SERVICE_NAME", "temporaeth")
SERVICE_PORT = int(os.getenv("PORT", "7401"))
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
    logger.info(f"temporaeth awakening on port {SERVICE_PORT}")
    yield
    logger.info("temporaeth going dark")

app = FastAPI(title=SERVICE_NAME, version="2.0.0", lifespan=lifespan)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class ReasonRequest(BaseModel):
    task: str = Field(..., description="Task description to reason about temporally")
    context: str = Field(default="", description="Optional surrounding context")

class ScheduleRequest(BaseModel):
    goal: str = Field(..., description="High-level goal to schedule")
    constraints: list[str] = Field(default_factory=list, description="Time or resource constraints")

class EstimateRequest(BaseModel):
    description: str = Field(..., description="Description of the work to estimate")
    complexity: str = Field(default="medium", description="Perceived complexity: low | medium | high")

class ServiceResponse(BaseModel):
    result: str
    confidence: float
    model_used: str
    tokens_used: int

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
async def _llm(messages: list[dict], temperature: float = 0.5) -> ServiceResponse:
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

@app.post("/reason", dependencies=[Depends(verify_internal)])
async def reason(req: ReasonRequest) -> ServiceResponse:
    """Reason about temporal dependencies, scheduling, and deadlines for a task."""
    logger.info(f"reason: task={req.task[:60]!r}")
    messages = [
        {"role": "system", "content": (
            "You are a temporal reasoning expert. Analyse the provided task for "
            "time dependencies, hard deadlines, sequencing constraints, and critical-path risks. "
            "Be concise and structured."
        )},
        {"role": "user", "content": f"Task: {req.task}\nContext: {req.context}" if req.context else f"Task: {req.task}"},
    ]
    return await _llm(messages)

@app.post("/schedule", dependencies=[Depends(verify_internal)])
async def schedule(req: ScheduleRequest) -> ServiceResponse:
    """Break a goal into time-ordered, dependency-aware steps."""
    logger.info(f"schedule: goal={req.goal[:60]!r}")
    constraints_text = "\n".join(f"- {c}" for c in req.constraints) if req.constraints else "None specified"
    messages = [
        {"role": "system", "content": (
            "You are a project scheduling expert. Produce a numbered, time-ordered action plan "
            "respecting the stated constraints. Include realistic time estimates per step."
        )},
        {"role": "user", "content": f"Goal: {req.goal}\n\nConstraints:\n{constraints_text}"},
    ]
    return await _llm(messages)

@app.post("/estimate", dependencies=[Depends(verify_internal)])
async def estimate(req: EstimateRequest) -> ServiceResponse:
    """Estimate time and effort required for a described task."""
    logger.info(f"estimate: description={req.description[:60]!r} complexity={req.complexity}")
    messages = [
        {"role": "system", "content": (
            "You are a software-engineering estimation expert. Given a task description and "
            "complexity hint, provide a realistic effort estimate (hours/days), risk factors, "
            "and key assumptions. Be concise."
        )},
        {"role": "user", "content": f"Task: {req.description}\nComplexity: {req.complexity}"},
    ]
    return await _llm(messages)
