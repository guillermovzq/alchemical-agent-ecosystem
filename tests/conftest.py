import os
import sys
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'gateway'))

# Ensure gateway runtime path is writable in CI/import time
os.environ.setdefault("ALCHEMICAL_RUNTIME_DIR", "/tmp/alchemical-runtime-test")


@pytest.fixture(scope="module")
def test_db(tmp_path_factory):
    db = tmp_path_factory.mktemp("data") / "test.db"
    return str(db)


@pytest.fixture(scope="module")
def client(test_db):
    import app as gw
    from pathlib import Path
    from fastapi.testclient import TestClient

    gw.DB_PATH = Path(test_db)
    gw.GATEWAY_TOKEN = "test-token-123"
    gw.TELEGRAM_WEBHOOK_SECRET = "tg-secret-xyz"
    gw.DISCORD_WEBHOOK_SECRET = "dc-secret-xyz"
    gw.init_db()
    with TestClient(gw.app) as c:
        yield c


@pytest.fixture(scope="module")
def auth_headers():
    return {"x-alchemy-token": "test-token-123"}
