"""
fluxenrath — Flow orchestration, action planning, task decomposition, and plan evaluation.
Port: 7405
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
SERVICE_NAME = os.getenv("SERVICE_NAME", "fluxenrath")
SERVICE_PORT = int(os.getenv("PORT", "7405"))
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
    logger.info(f"fluxenrath awakening on port {SERVICE_PORT}")
    yield
    logger.info("fluxenrath going dark")

app = FastAPI(title=SERVICE_NAME, version="2.0.0", lifespan=lifespan)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class PlanRequest(BaseModel):
    goal: str = Field(..., description="High-level goal to plan towards")
    resources: list[str] = Field(default_factory=list, description="Available resources")
    constraints: list[str] = Field(default_factory=list, description="Hard constraints on the plan")

class DecomposeRequest(BaseModel):
    task: str = Field(..., description="Complex task to break down")
    max_steps: int = Field(default=10, ge=2, le=50, description="Maximum number of subtasks")

class EvaluateRequest(BaseModel):
    goal: str = Field(..., description="The original goal or acceptance criteria")
    result: str = Field(..., description="The result or plan to evaluate against the goal")

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

@app.post("/plan", dependencies=[Depends(verify_internal)])
async def plan(req: PlanRequest) -> ServiceResponse:
    """Generate a step-by-step, dependency-aware action plan for a goal."""
    logger.info(f"plan: goal={req.goal[:60]!r}")
    resources_text = "\n".join(f"- {r}" for r in req.resources) if req.resources else "None specified"
    constraints_text = "\n".join(f"- {c}" for c in req.constraints) if req.constraints else "None specified"
    messages = [
        {"role": "system", "content": (
            "You are an expert project orchestrator. Produce a numbered, dependency-aware action plan "
            "to achieve the stated goal. Each step must include: what to do, why, and expected output. "
            "Respect all stated resources and constraints."
        )},
        {"role": "user", "content": (
            f"Goal: {req.goal}\n\nAvailable Resources:\n{resources_text}\n\nConstraints:\n{constraints_text}"
        )},
    ]
    return await _llm(messages)

@app.post("/decompose", dependencies=[Depends(verify_internal)])
async def decompose(req: DecomposeRequest) -> ServiceResponse:
    """Break a complex task into parallelisable or sequential subtasks."""
    logger.info(f"decompose: task={req.task[:60]!r} max_steps={req.max_steps}")
    messages = [
        {"role": "system", "content": (
            f"You are a task decomposition expert. Break the provided task into at most {req.max_steps} "
            "concrete, actionable subtasks. Return JSON: {{\"subtasks\": [{{\"id\": 1, \"title\": \"...\", "
            "\"description\": \"...\", \"depends_on\": []}}]}}."
        )},
        {"role": "user", "content": f"Task: {req.task}"},
    ]
    return await _llm(messages)

@app.post("/evaluate", dependencies=[Depends(verify_internal)])
async def evaluate(req: EvaluateRequest) -> ServiceResponse:
    """Evaluate whether a result or plan adequately satisfies the stated goal."""
    logger.info(f"evaluate: goal={req.goal[:60]!r}")
    messages = [
        {"role": "system", "content": (
            "You are a quality evaluator. Score the provided result against the stated goal. "
            "Return JSON: {{\"score\": <0-10>, \"verdict\": \"pass|fail|partial\", "
            "\"strengths\": [...], \"gaps\": [...], \"recommendation\": \"...\"}}."
        )},
        {"role": "user", "content": f"Goal / Acceptance Criteria:\n{req.goal}\n\nResult to Evaluate:\n{req.result}"},
    ]
    return await _llm(messages, temperature=0.2)
