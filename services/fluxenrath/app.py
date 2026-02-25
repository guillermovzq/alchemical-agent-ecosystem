import os
from datetime import datetime, timezone
from fastapi import FastAPI, WebSocket
from fastapi.responses import PlainTextResponse

SERVICE = os.getenv('SERVICE_NAME', 'fluxenrath')
app = FastAPI(title=SERVICE)

def response(endpoint: str, payload: dict):
    return {
        'service': SERVICE,
        'endpoint': endpoint,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'confidence': 0.9,
        'provenance': ['local'],
        'input': payload
    }

@app.get('/health')
async def health():
    return {'status':'ok','service':SERVICE}

@app.post('/')
async def ep_0(payload: dict):
    return response('/', payload)

@app.get('/')
async def ide():
    return {
        'service': SERVICE,
        'status': 'ok',
        'description': 'fluxenrath diagnostics and flow runtime endpoint',
        'endpoints': ['GET /health', 'GET /', 'POST /'],
        'timestamp': datetime.now(timezone.utc).isoformat(),
    }

