from pathlib import Path
import os
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# ensure gateway runtime path is writable in CI/import time
os.environ.setdefault("ALCHEMICAL_RUNTIME_DIR", "/tmp/alchemical-runtime-test")

from fastapi.testclient import TestClient  # noqa: E402
import gateway.app as gw  # noqa: E402


def setup_module():
    gw.DB_PATH = Path('/tmp/alchemical-gateway-test.db')
    if gw.DB_PATH.exists():
        gw.DB_PATH.unlink()
    gw.GATEWAY_TOKEN = ""
    gw.init_db()


def test_health():
    c = TestClient(gw.app)
    r = c.get('/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'


def test_capabilities_and_agents():
    c = TestClient(gw.app)
    r = c.get('/capabilities', headers={"x-alchemy-role": "viewer"})
    assert r.status_code == 200
    data = r.json()
    assert 'skills' in data and 'agents' in data

    r2 = c.get('/agents', headers={"x-alchemy-role": "viewer"})
    assert r2.status_code == 200
    assert isinstance(r2.json().get('items'), list)
