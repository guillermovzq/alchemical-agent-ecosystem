"""
synapsara — Neural synthesis, creative content generation, refinement, and brainstorming.
Port: 7407
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
SERVICE_NAME = os.getenv("SERVICE_NAME", "synapsara")
SERVICE_PORT = int(os.getenv("PORT", "7407"))
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
    logger.info(f"synapsara awakening on port {SERVICE_PORT}")
    yield
    logger.info("synapsara going dark")

app = FastAPI(title=SERVICE_NAME, version="2.0.0", lifespan=lifespan)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="Creative prompt or specification")
    style: str = Field(default="professional", description="Tone/style: professional | casual | technical | creative")
    format: str = Field(default="text", description="Output format: text | markdown | code | json")

class RefineRequest(BaseModel):
    content: str = Field(..., description="Existing content to refine")
    instructions: str = Field(..., description="Specific refinement instructions")

class BrainstormRequest(BaseModel):
    topic: str = Field(..., description="Topic or problem to brainstorm around")
    count: int = Field(default=5, ge=1, le=20, description="Number of distinct ideas to generate")

class ServiceResponse(BaseModel):
    result: str
    confidence: float
    model_used: str
    tokens_used: int

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
async def _llm(messages: list[dict], temperature: float = 0.8) -> ServiceResponse:
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

@app.post("/generate", dependencies=[Depends(verify_internal)])
async def generate(req: GenerateRequest) -> ServiceResponse:
    """Generate creative content — text, code, or ideas — from a prompt."""
    logger.info(f"generate: style={req.style} format={req.format} prompt={req.prompt[:60]!r}")
    format_hint = {
        "markdown": "Respond in Markdown.",
        "code": "Respond with clean, well-commented code only.",
        "json": "Respond with valid JSON only.",
    }.get(req.format, "Respond in plain prose.")
    messages = [
        {"role": "system", "content": (
            f"You are a creative synthesis engine with a {req.style} style. "
            f"{format_hint} Produce original, high-quality output."
        )},
        {"role": "user", "content": req.prompt},
    ]
    return await _llm(messages, temperature=0.85)

@app.post("/refine", dependencies=[Depends(verify_internal)])
async def refine(req: RefineRequest) -> ServiceResponse:
    """Improve existing content according to explicit refinement instructions."""
    logger.info(f"refine: content_len={len(req.content)} instructions={req.instructions[:60]!r}")
    messages = [
        {"role": "system", "content": (
            "You are an expert editor and refiner. Apply the provided instructions to improve the content. "
            "Preserve the author's intent and voice unless instructed otherwise. Return the refined content only."
        )},
        {"role": "user", "content": f"Instructions: {req.instructions}\n\nContent to Refine:\n{req.content}"},
    ]
    return await _llm(messages, temperature=0.6)

@app.post("/brainstorm", dependencies=[Depends(verify_internal)])
async def brainstorm(req: BrainstormRequest) -> ServiceResponse:
    """Generate multiple distinct, creative ideas on a topic."""
    logger.info(f"brainstorm: topic={req.topic[:60]!r} count={req.count}")
    messages = [
        {"role": "system", "content": (
            f"You are a creative ideation engine. Generate exactly {req.count} distinct, "
            "concrete, and actionable ideas for the given topic. Number each idea and include "
            "a one-sentence rationale. Think divergently — avoid obvious or repetitive suggestions."
        )},
        {"role": "user", "content": f"Topic: {req.topic}"},
    ]
    return await _llm(messages, temperature=0.95)
