# Architecture — Alchemical Agent Ecosystem

This document defines the **real runtime architecture** and the logical mapping of responsibilities.

---

## 1) System goal

Provide a **local-first multi-agent runtime** where:
- operators control everything from a dashboard,
- the gateway enforces auth/routing/persistence,
- execution services run specialized actions,
- state and observability remain auditable.

No simulated runtime behavior should be used for core operations.

---

## 2) Layered architecture (clear mapping)

```mermaid
flowchart TB
  U[Operator / Admin] --> D[Dashboard\nNext.js]
  D -->|Gateway proxy API + SSE| G[Gateway\nFastAPI]

  G -->|dispatch/{agent}/{action}| S1[Service 7401]
  G --> S2[Service 7402]
  G --> S3[Service 7403]
  G --> SX[Service 7410]

  G --> DB[(SQLite runtime DB)]
  G --> R[(Redis)]
  G --> V[(ChromaDB)]
  S1 --> O[(Ollama)]
  S2 --> O
  S3 --> O

  G --> CADDY[Caddy Reverse Proxy]
  CADDY --> NET[HTTPS/Local network]
```

### Layer responsibilities

1. **Dashboard layer (UI / control plane)**
   - Presents system health, jobs, events, usage, chat workbench.
   - Uses gateway proxy routes (`/api/gateway/*`) to avoid direct coupling.
   - Consumes realtime streams (SSE) for thread/events/usage/logs.

2. **Gateway layer (policy + orchestration)**
   - Single entry point for API auth (`x-alchemy-token`) and role checks.
   - Owns registries (agents/connectors), queue/jobs, event log, usage tracking.
   - Routes actions to execution services using logical agent mapping.
   - Normalizes connector inbound payloads (Telegram/Discord).

3. **Execution layer (workers/services)**
   - Stateless specialized services behind gateway dispatch.
   - No direct public exposure required.
   - Must return machine-readable outcomes (status/error/usage when available).

4. **State/model layer**
   - SQLite: canonical runtime state (jobs, events, chat, keys, connectors, usage).
   - Redis/ChromaDB/Ollama: performance and AI runtime support.

5. **Infra layer**
   - Docker Compose as deployment backbone.
   - Caddy as reverse proxy/TLS edge.
   - Safe ops lifecycle via scripts (`update-safe`, `rollback`, `project-tidy`, ritual sync).

---

## 3) Logical agent mapping model

Logical agents are decoupled from container count.

- `agent.name` = orchestration identity
- `agent.target_service` = execution destination
- `dispatch/{agent}/{action}` resolves target service through registry + map

This enables:
- stable agent identities,
- flexible service scaling/replacement,
- safer runtime evolution without breaking operator workflows.

---

## 4) Critical runtime flows

### A) Action dispatch flow

```text
Dashboard -> Gateway (/dispatch/{agent}/{action})
         -> Auth + RBAC + payload validation
         -> Resolve target_service
         -> Call execution service
         -> Persist event/usage/result
         -> Return response + stream updates (SSE)
```

### B) Connector outbound flow

```text
Dashboard/API -> Gateway (/connectors/send)
              -> Queue job (connector_outbound)
              -> Worker sends to Telegram/Discord/webhook
              -> Retry policy on failure
              -> Event log + job state updated
```

### C) Connector inbound flow

```text
Provider webhook -> Gateway (/connectors/webhook/{channel})
                 -> Optional secret validation (per channel)
                 -> Normalize payload
                 -> Queue connector_inbound
                 -> Append event + chat record
```

---

## 5) Security boundaries

1. **Edge auth**
   - Gateway token required for protected APIs.
   - Optional API keys with role scoping.

2. **RBAC roles**
   - `viewer`: read-only runtime data
   - `operator`: runtime actions/configuration
   - `admin`: key lifecycle and sensitive controls

3. **Connector hygiene**
   - `token_ref` only in connector records (no raw token persistence).
   - Optional webhook secret validation for Telegram/Discord inbound paths.

4. **Operational safeguards**
   - Secret scan before commit.
   - Safe update and rollback scripts for controlled deployments.

---

## 6) Reliability model

- Queue worker with retries and delayed next-run scheduling.
- Event store for auditability.
- Usage sampling for cost/tokens visibility.
- Readiness endpoint distinguishes liveness vs operational readiness.

Failure handling principle:
- **fail closed on auth/policy**,
- **fail visible on runtime errors** (events + job status),
- **recover via retry/rollback**.

---

## 7) Deployment topology (single-host baseline)

```text
[Caddy :80/:443]
      |
      +--> /dashboard (Next.js)
      +--> /gateway   (FastAPI)

Internal network:
- execution services :7401..7410
- redis/chromadb/ollama
- sqlite runtime volume
```

This baseline supports local-first operation and can be extended to multi-host by moving execution services behind private networking while keeping the gateway as policy/control plane.

---

## 8) Architecture invariants (must stay true)

1. Gateway is the authoritative policy/routing boundary.
2. Dashboard never bypasses gateway for protected operations.
3. Logical agent identity remains stable even if service topology changes.
4. Runtime state is persisted; no critical state in-memory only.
5. Documentation and runtime behavior must remain synchronized.

---

## 9) Quick validation checklist

```bash
# core health
curl -fsS http://localhost/gateway/health
curl -fsS http://localhost/gateway/ready

# runtime observability
curl -fsS http://localhost/gateway/stats
curl -fsS http://localhost/gateway/events | jq '.count'
curl -fsS http://localhost/gateway/usage/summary | jq '.summary'

# security/quality
./scripts/alchemical scan-secrets
```

If any check fails: stop rollout, inspect logs/events/jobs, apply minimal fix, and keep rollback path ready.
