# Architecture

## Servicios (`docker-compose.yml`, 5)
| Servicio | Rol | Puerto |
|---|---|---|
| caddy | Proxy inverso / TLS | 81, 444 |
| redis | Caché, pub/sub, colas | - |
| chromadb 0.5.5 | Vector store | - |
| alchemical-gateway | FastAPI | 7411 |
| alchemical-dashboard | Next.js 15 | 8080 |

## Gateway (`gateway/`)
- `app.py` (~2.3k líneas): auth por API keys con roles (RBAC), rate limit, límite de cuerpo, HMAC de webhooks (Telegram/Discord), worker de jobs, SSE (`/events/stream`, `/usage/stream`, `/chat/stream`), rutas de agentes, claves, conectores, chat (ask/roundtable/plan), `/dispatch/{agent}/{action}`, modelos LLM.
- `agents_router.py`: proveedores de IA, roles, KiloCode, OpenClaw, CRUD de agentes. Duplica helpers de `app.py` (`db_conn`, `row_to_agent`, rutas `/agents`).
- Persistencia: SQLite en `.runtime/gateway.db`.

## Dashboard (`apps/alchemical-dashboard/`)
Componentes en `components/`; `app/api/gateway/*` hace de proxy al gateway; stores zustand en `lib/stores`.

## Compartido
`shared/python/alchemical_core`: contratos Pydantic (`AgentTask`, `AgentResult`, `CircleTask`, `ServiceResponse`) y cliente LLM.

## Otros
- `workspace/skills/Gitmancer`: skill generador de README/gobernanza (CI y tests propios).
- `ops/`, `scripts/`, `infra/caddy`: operaciones, despliegue VPS, CI local, chequeo de secretos.
- `docs/`: arquitectura, API, runbook, roadmap, `PENDIENTES.md`.
