"""
Expanded test suite for alchemical-gateway API.

Fixtures are provided by tests/conftest.py:
  - client       : TestClient with GATEWAY_TOKEN="test-token-123"
  - auth_headers : {"x-alchemy-token": "test-token-123"}

Run with:
  pytest -q tests/test_gateway_api.py
"""

import pytest

# ---------------------------------------------------------------------------
# 1. Health endpoint
# ---------------------------------------------------------------------------

def test_health_returns_200(client):
    r = client.get("/health")
    assert r.status_code == 200


def test_health_shape(client):
    r = client.get("/health")
    data = r.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "engine" in data
    assert "timestamp" in data


# ---------------------------------------------------------------------------
# 2. Authentication guard
# ---------------------------------------------------------------------------

def test_auth_missing_token_returns_401(client):
    r = client.get("/agents")
    assert r.status_code == 401


def test_auth_missing_token_has_no_www_authenticate_but_is_401(client):
    # gateway returns a plain JSON 401; assert body content
    r = client.get("/agents")
    assert r.status_code == 401
    body = r.json()
    assert "detail" in body


def test_auth_wrong_token_returns_401(client):
    r = client.get("/agents", headers={"x-alchemy-token": "wrong-token"})
    assert r.status_code == 401


def test_auth_role_header_alone_is_not_a_bypass(client):
    """x-alchemy-role header must NOT bypass the token check."""
    r = client.get("/agents", headers={"x-alchemy-role": "admin"})
    assert r.status_code == 401


def test_auth_valid_token_grants_access(client, auth_headers):
    r = client.get("/agents", headers=auth_headers)
    assert r.status_code == 200


# ---------------------------------------------------------------------------
# 3. Agents CRUD
# ---------------------------------------------------------------------------

def test_agents_list_returns_items_list(client, auth_headers):
    r = client.get("/agents", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert isinstance(data["items"], list)
    assert "count" in data


def test_agents_create(client, auth_headers):
    payload = {
        "name": "test-agent-alpha",
        "role": "Test role for CI",
        "model": "local-default",
        "tools": ["http"],
        "skills": ["coding"],
        "enabled": True,
        "parent": None,
        "target_service": None,
    }
    r = client.post("/agents", json=payload, headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert data["agent"]["name"] == "test-agent-alpha"


def test_agents_get_single(client, auth_headers):
    r = client.get("/agents/test-agent-alpha", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "agent" in data
    assert data["agent"]["name"] == "test-agent-alpha"


def test_agents_get_nonexistent_returns_404(client, auth_headers):
    r = client.get("/agents/no-such-agent-xyz", headers=auth_headers)
    assert r.status_code == 404


def test_agents_update_via_post_upsert(client, auth_headers):
    payload = {
        "name": "test-agent-alpha",
        "role": "Updated role",
        "model": "local-default",
        "tools": ["http", "search"],
        "skills": ["coding", "debugging"],
        "enabled": True,
        "parent": None,
        "target_service": None,
    }
    r = client.post("/agents", json=payload, headers=auth_headers)
    assert r.status_code == 200
    # confirm updated
    r2 = client.get("/agents/test-agent-alpha", headers=auth_headers)
    assert r2.json()["agent"]["role"] == "Updated role"


def test_agents_create_rejects_unknown_target_service(client, auth_headers):
    payload = {
        "name": "bad-service-agent",
        "role": "Test",
        "model": "local-default",
        "tools": [],
        "skills": [],
        "enabled": True,
        "target_service": "non-existent-service-99",
    }
    r = client.post("/agents", json=payload, headers=auth_headers)
    assert r.status_code == 400


# ---------------------------------------------------------------------------
# 4. Jobs
# ---------------------------------------------------------------------------

def test_jobs_list(client, auth_headers):
    r = client.get("/jobs", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert isinstance(data["items"], list)


def test_jobs_list_filter_by_status(client, auth_headers):
    r = client.get("/jobs?status=queued", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    # All returned items (if any) must have status=queued
    for item in data["items"]:
        assert item["status"] == "queued"


# ---------------------------------------------------------------------------
# 5. Chat
# ---------------------------------------------------------------------------

def test_chat_post_message(client, auth_headers):
    payload = {"sender": "ci-tester", "text": "Hello from CI test", "kind": "message"}
    r = client.post("/chat/thread", json=payload, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_chat_get_history(client, auth_headers):
    r = client.get("/chat/thread", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert isinstance(data["items"], list)
    assert "count" in data


def test_chat_history_contains_posted_message(client, auth_headers):
    r = client.get("/chat/thread", headers=auth_headers)
    texts = [item["text"] for item in r.json()["items"]]
    assert any("Hello from CI test" in t for t in texts)


def test_chat_post_rejects_empty_text(client, auth_headers):
    payload = {"sender": "ci-tester", "text": "", "kind": "message"}
    r = client.post("/chat/thread", json=payload, headers=auth_headers)
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# 6. LLM endpoints
# ---------------------------------------------------------------------------

def test_llm_health_no_auth_required(client):
    """GET /gateway/llm/health does not require auth per docstring."""
    r = client.get("/gateway/llm/health")
    assert r.status_code == 200
    data = r.json()
    assert "engine" in data
    assert data["engine"] == "kilocode"
    assert "status" in data


def test_llm_models_requires_auth(client):
    r = client.get("/gateway/llm/models")
    assert r.status_code == 401


def test_llm_models_with_auth_returns_valid_response(client, auth_headers):
    r = client.get("/gateway/llm/models", headers=auth_headers)
    # Either 200 (models available) or 503 (openai not installed in test env)
    assert r.status_code in (200, 503)
    if r.status_code == 200:
        data = r.json()
        assert "engine" in data
        assert "models" in data
        assert isinstance(data["models"], list)


# ---------------------------------------------------------------------------
# 7. Stats endpoint
# ---------------------------------------------------------------------------

def test_stats_requires_auth(client):
    r = client.get("/stats")
    assert r.status_code == 401


def test_stats_returns_correct_shape(client, auth_headers):
    r = client.get("/stats", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "chat_messages" in data
    assert "events" in data
    assert "jobs" in data
    assert "usage" in data
    assert "timestamp" in data
    usage = data["usage"]
    assert "tokens_in" in usage
    assert "tokens_out" in usage
    assert "total_tokens" in usage
    assert "cost_usd" in usage


# ---------------------------------------------------------------------------
# 8. Capabilities endpoint
# ---------------------------------------------------------------------------

def test_capabilities_returns_correct_keys(client, auth_headers):
    r = client.get("/capabilities", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "skills" in data
    assert "tools" in data
    assert "connectors" in data
    assert "agents" in data
    assert isinstance(data["skills"], list)
    assert isinstance(data["agents"], list)


# ---------------------------------------------------------------------------
# 9. Webhook endpoint — secret enforcement
# ---------------------------------------------------------------------------

def test_telegram_webhook_rejects_missing_secret(client):
    """Telegram webhook with a configured secret must reject requests without it."""
    body = {"message": {"chat": {"id": 123}, "text": "hi", "from": {"username": "user1"}}}
    r = client.post("/connectors/webhook/telegram", json=body)
    assert r.status_code == 401


def test_telegram_webhook_accepts_correct_secret(client):
    body = {"message": {"chat": {"id": 123}, "text": "hi", "from": {"username": "user1"}}}
    r = client.post(
        "/connectors/webhook/telegram",
        json=body,
        headers={"X-Telegram-Bot-Api-Secret-Token": "tg-secret-xyz"},
    )
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_discord_webhook_rejects_wrong_secret(client):
    body = {"content": "hello", "author": {"username": "u1"}, "channel_id": "ch1"}
    r = client.post(
        "/connectors/webhook/discord",
        json=body,
        headers={"X-Discord-Webhook-Secret": "wrong-secret"},
    )
    assert r.status_code == 401


def test_webhook_unsupported_channel_returns_400(client):
    r = client.post("/connectors/webhook/unknownchannel", json={})
    assert r.status_code == 400


# ---------------------------------------------------------------------------
# 10. Secret scanner — connector token_ref
# ---------------------------------------------------------------------------

def test_connector_rejects_raw_secret_in_token_ref(client, auth_headers):
    payload = {
        "channel": "telegram",
        "enabled": True,
        "token_ref": "ghp_myrawGitHubToken",
    }
    r = client.post("/connectors", json=payload, headers=auth_headers)
    assert r.status_code == 400


def test_connector_accepts_safe_token_ref(client, auth_headers):
    payload = {
        "channel": "telegram",
        "enabled": True,
        "bot_name": "test-bot",
        "token_ref": "vault://telegram/bot-ref",
    }
    r = client.post("/connectors", json=payload, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["ok"] is True


# ---------------------------------------------------------------------------
# 11. Events endpoint
# ---------------------------------------------------------------------------

def test_events_list_requires_auth(client):
    r = client.get("/events")
    assert r.status_code == 401


def test_events_list_returns_items(client, auth_headers):
    r = client.get("/events", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert isinstance(data["items"], list)
