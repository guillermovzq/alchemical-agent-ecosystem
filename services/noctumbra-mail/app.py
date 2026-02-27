"""
noctumbra-mail — Communication composition, reply generation, and message extraction.
Port: 7404
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
SERVICE_NAME = os.getenv("SERVICE_NAME", "noctumbra-mail")
SERVICE_PORT = int(os.getenv("PORT", "7404"))
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
    logger.info(f"noctumbra-mail awakening on port {SERVICE_PORT}")
    yield
    logger.info("noctumbra-mail going dark")

app = FastAPI(title=SERVICE_NAME, version="2.0.0", lifespan=lifespan)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class ComposeRequest(BaseModel):
    intent: str = Field(..., description="What the message should communicate or achieve")
    recipient: str = Field(default="", description="Recipient name or role (for personalisation)")
    tone: str = Field(default="professional", description="Tone: professional | friendly | formal | assertive")

class ReplyRequest(BaseModel):
    original: str = Field(..., description="The message being replied to")
    intent: str = Field(..., description="What the reply should communicate or achieve")

class ExtractRequest(BaseModel):
    message: str = Field(..., description="Message to extract information from")

class ServiceResponse(BaseModel):
    result: str
    confidence: float
    model_used: str
    tokens_used: int

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
async def _llm(messages: list[dict], temperature: float = 0.6) -> ServiceResponse:
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

@app.post("/compose", dependencies=[Depends(verify_internal)])
async def compose(req: ComposeRequest) -> ServiceResponse:
    """Compose a message or email from an intent, recipient, and desired tone."""
    logger.info(f"compose: intent={req.intent[:60]!r} tone={req.tone}")
    recipient_line = f" addressed to {req.recipient}" if req.recipient else ""
    messages = [
        {"role": "system", "content": (
            f"You are a professional communications writer. Compose a clear, well-structured message"
            f"{recipient_line} in a {req.tone} tone. Include an appropriate subject line if it reads "
            "like an email. Return only the composed message."
        )},
        {"role": "user", "content": f"Intent: {req.intent}"},
    ]
    return await _llm(messages)

@app.post("/reply", dependencies=[Depends(verify_internal)])
async def reply(req: ReplyRequest) -> ServiceResponse:
    """Generate a contextually appropriate reply to a message."""
    logger.info(f"reply: intent={req.intent[:60]!r}")
    messages = [
        {"role": "system", "content": (
            "You are a communications expert. Draft a clear, contextually appropriate reply to the "
            "provided message. Honour the stated intent. Match the formality of the original unless "
            "instructed otherwise. Return the reply only."
        )},
        {"role": "user", "content": f"Original Message:\n{req.original}\n\nReply Intent: {req.intent}"},
    ]
    return await _llm(messages)

@app.post("/extract", dependencies=[Depends(verify_internal)])
async def extract(req: ExtractRequest) -> ServiceResponse:
    """Extract action items, deadlines, decisions, and key facts from a message."""
    logger.info(f"extract: message_len={len(req.message)}")
    messages = [
        {"role": "system", "content": (
            "You are an information extraction specialist. From the provided message, extract: "
            "action items (with owner and deadline if mentioned), key decisions made, "
            "important facts, and any open questions. "
            "Return structured JSON: {{\"action_items\": [...], \"decisions\": [...], "
            "\"key_facts\": [...], \"open_questions\": [...]}}."
        )},
        {"role": "user", "content": req.message},
    ]
    return await _llm(messages, temperature=0.2)
