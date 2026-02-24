# Architecture

## Summary

Alchemical Agent Ecosystem is built as a layered local-first platform:

1. **Dashboard Layer** (Next.js)
   - control plane UI
   - SSE chat/log streams
   - gateway API proxies

2. **Gateway Layer** (FastAPI)
   - token auth + role checks
   - logical agent and connector registries
   - chat/events persistence
   - queue worker with retries
   - dispatch routing to execution services

3. **Execution Layer** (FastAPI services 7401..7410)
   - specialized runtime backends
   - invoked through gateway dispatch

4. **Data/Model Layer**
   - SQLite (runtime state)
   - Redis (fast state)
   - ChromaDB (vector layer)
   - Ollama (local model serving)

5. **Infra Layer**
   - Docker Compose
   - Caddy reverse proxy
   - ops scripts (`update-safe`, `rollback`)

## Design principles

- Local-first and self-hosted
- Skills/tools as capabilities (not fixed identities)
- Operational safety with automated checks
- Progressive extensibility for connectors and services
