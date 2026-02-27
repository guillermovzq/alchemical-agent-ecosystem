"""
resonvyr — Semantic search, text summarization, classification, and streaming.
Port: 7402
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
SERVICE_NAME = os.getenv("SERVICE_NAME", "resonvyr")
SERVICE_PORT = int(os.getenv("PORT", "7402"))
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
    logger.info(f"resonvyr awakening on port {SERVICE_PORT}")
    yield
    logger.info("resonvyr going dark")

app = FastAPI(title=SERVICE_NAME, version="2.0.0", lifespan=lifespan)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class SearchRequest(BaseModel):
    query: str = Field(..., description="Semantic search query")
    documents: list[str] = Field(..., description="Corpus of documents to search")

class SummarizeRequest(BaseModel):
    text: str = Field(..., description="Text to summarize")
    max_length: int = Field(default=200, description="Approximate maximum word count of the summary")

class ClassifyRequest(BaseModel):
    text: str = Field(..., description="Text to classify")
    categories: list[str] = Field(..., description="Possible classification labels")

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

@app.post("/search", dependencies=[Depends(verify_internal)])
async def search(req: SearchRequest) -> ServiceResponse:
    """Semantically rank documents by relevance to the query using LLM reasoning."""
    logger.info(f"search: query={req.query[:60]!r} docs={len(req.documents)}")
    docs_text = "\n".join(f"[{i}] {d}" for i, d in enumerate(req.documents))
    messages = [
        {"role": "system", "content": (
            "You are a semantic search engine. Given a query and numbered documents, "
            "rank the documents by semantic relevance. Return a JSON array of objects with "
            "keys 'index', 'score' (0-1), and 'reason'. Most relevant first."
        )},
        {"role": "user", "content": f"Query: {req.query}\n\nDocuments:\n{docs_text}"},
    ]
    return await _llm(messages)

@app.post("/summarize", dependencies=[Depends(verify_internal)])
async def summarize(req: SummarizeRequest) -> ServiceResponse:
    """Summarize text to the requested approximate length."""
    logger.info(f"summarize: text_len={len(req.text)} max_length={req.max_length}")
    messages = [
        {"role": "system", "content": (
            f"You are a precise summarizer. Summarize the provided text in roughly {req.max_length} words. "
            "Preserve the most important facts and conclusions. Do not add commentary."
        )},
        {"role": "user", "content": req.text},
    ]
    return await _llm(messages)

@app.post("/classify", dependencies=[Depends(verify_internal)])
async def classify(req: ClassifyRequest) -> ServiceResponse:
    """Classify text into one of the provided categories."""
    logger.info(f"classify: text_len={len(req.text)} categories={req.categories}")
    cats = ", ".join(req.categories)
    messages = [
        {"role": "system", "content": (
            f"You are a text classifier. Classify the input into exactly one of these categories: {cats}. "
            "Respond with JSON: {{\"category\": \"<chosen>\", \"confidence\": <0-1>, \"reasoning\": \"<brief>\"}}."
        )},
        {"role": "user", "content": req.text},
    ]
    return await _llm(messages)

@app.websocket("/ws/stream")
async def ws_stream(ws: WebSocket) -> None:
    """Stream LLM responses token-by-token over WebSocket.

    Send JSON: {"prompt": "..."} to receive streamed tokens.
    """
    await ws.accept()
    logger.info("ws/stream: client connected")
    try:
        while True:
            raw = await ws.receive_text()
            try:
                data = json.loads(raw)
                prompt = data.get("prompt", "")
            except (json.JSONDecodeError, AttributeError):
                prompt = raw

            if not prompt:
                await ws.send_json({"error": "empty prompt"})
                continue

            try:
                stream = await kilo.chat.completions.create(
                    model=DEFAULT_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=512,
                    temperature=0.7,
                    stream=True,
                )
                async for chunk in stream:
                    delta = chunk.choices[0].delta.content if chunk.choices else None
                    if delta:
                        await ws.send_json({"token": delta})
                await ws.send_json({"done": True})
            except APIError as e:
                logger.error(f"ws/stream API error: {e}")
                await ws.send_json({"error": "LLM service unavailable"})
    except WebSocketDisconnect:
        logger.info("ws/stream: client disconnected")
