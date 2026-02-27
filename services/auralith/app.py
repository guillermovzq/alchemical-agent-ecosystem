"""
auralith — Metrics analytics reasoning, anomaly detection, and Prometheus exposition.
Port: 7406
"""
import logging
import os
import time
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.responses import PlainTextResponse
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
SERVICE_NAME = os.getenv("SERVICE_NAME", "auralith")
SERVICE_PORT = int(os.getenv("PORT", "7406"))
GATEWAY_SECRET = os.getenv("GATEWAY_SECRET", "")

kilo = AsyncOpenAI(
    api_key=os.getenv("KILO_API_KEY", ""),
    base_url=os.getenv("KILO_BASE_URL", "https://api.kilo.ai/api/gateway"),
)
DEFAULT_MODEL = os.getenv("KILO_DEFAULT_MODEL", "anthropic/claude-sonnet-4.5")

# ---------------------------------------------------------------------------
# Runtime counters (in-process; replace with a real registry for production)
# ---------------------------------------------------------------------------
_START_TIME = time.time()
_request_count: dict[str, int] = {}

def _inc(endpoint: str) -> None:
    _request_count[endpoint] = _request_count.get(endpoint, 0) + 1

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
    logger.info(f"auralith awakening on port {SERVICE_PORT}")
    yield
    logger.info("auralith going dark")

app = FastAPI(title=SERVICE_NAME, version="2.0.0", lifespan=lifespan)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    data: dict = Field(..., description="Metrics or data payload to analyse")
    question: str = Field(default="What are the key insights?", description="Analytical question to answer")

class AnomalyRequest(BaseModel):
    series: list[float] = Field(..., description="Time-series values to inspect for anomalies")
    description: str = Field(default="", description="Optional context about the metric")

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

@app.post("/analyze", dependencies=[Depends(verify_internal)])
async def analyze(req: AnalyzeRequest) -> ServiceResponse:
    """Analyse a metrics/data payload and answer a specified analytical question."""
    _inc("analyze")
    logger.info(f"analyze: question={req.question[:80]!r} data_keys={list(req.data.keys())}")
    messages = [
        {"role": "system", "content": (
            "You are a data analytics expert. Analyse the provided metrics data and answer the question. "
            "Highlight trends, outliers, and actionable recommendations. Be concise and structured."
        )},
        {"role": "user", "content": f"Data:\n{req.data}\n\nQuestion: {req.question}"},
    ]
    return await _llm(messages)

@app.post("/anomaly", dependencies=[Depends(verify_internal)])
async def anomaly(req: AnomalyRequest) -> ServiceResponse:
    """Detect anomalies in a numeric time-series using LLM pattern reasoning."""
    _inc("anomaly")
    logger.info(f"anomaly: series_len={len(req.series)}")
    series_str = ", ".join(str(v) for v in req.series)
    context = f"\nContext: {req.description}" if req.description else ""
    messages = [
        {"role": "system", "content": (
            "You are an anomaly detection specialist. Inspect the time-series values for spikes, dips, "
            "trend breaks, or other anomalies. Return JSON: {{\"anomalies\": [{{\"index\": <int>, "
            "\"value\": <float>, \"type\": \"spike|dip|trend_break|other\", \"severity\": \"low|medium|high\", "
            "\"explanation\": \"...\"}}], \"summary\": \"...\"}}."
        )},
        {"role": "user", "content": f"Series: [{series_str}]{context}"},
    ]
    return await _llm(messages)

@app.get("/metrics", response_class=PlainTextResponse)
async def metrics() -> str:
    """Expose Prometheus-compatible metrics for scraping."""
    uptime = time.time() - _START_TIME
    lines = [
        "# HELP alchemical_up Service liveness (1 = up)",
        "# TYPE alchemical_up gauge",
        f'alchemical_up{{service="{SERVICE_NAME}"}} 1',
        "# HELP alchemical_uptime_seconds Seconds since service start",
        "# TYPE alchemical_uptime_seconds counter",
        f'alchemical_uptime_seconds{{service="{SERVICE_NAME}"}} {uptime:.2f}',
        "# HELP alchemical_requests_total Total requests per endpoint",
        "# TYPE alchemical_requests_total counter",
    ]
    for endpoint, count in _request_count.items():
        lines.append(f'alchemical_requests_total{{service="{SERVICE_NAME}",endpoint="{endpoint}"}} {count}')
    return "\n".join(lines) + "\n"
