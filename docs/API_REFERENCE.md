# API Reference

## Gateway (`/gateway/*`)

### Health and status
- `GET /gateway/health` — liveness
- `GET /gateway/ready` — readiness with counters
- `GET /gateway/stats` — runtime stats
- `GET /gateway/events?limit=100` — recent events feed

### Agents
- `GET /gateway/agents` — list logical agents
- `GET /gateway/agents/{name}` — get single logical agent
- `POST /gateway/agents` — create/update logical agent

### Connectors
- `GET /gateway/connectors` — list connectors
- `POST /gateway/connectors` — create/update connector config
- `POST /gateway/connectors/send` — queue outbound message
- `POST /gateway/connectors/webhook/{channel}` — ingest inbound payload (Telegram/Discord normalization + optional webhook secret validation)

### Planning / dispatch
- `GET /gateway/capabilities` — skills/tools/connectors catalog
- `POST /gateway/chat/actions/plan` — planning endpoint
- `POST /gateway/dispatch/{agent}/{action}` — dispatch action to target backend

### Chat + jobs
- `GET /gateway/chat/thread?limit=120`
- `POST /gateway/chat/thread`
- `POST /gateway/chat/ask` — direct operator→agent interaction (dispatch-backed, supports repo/thinking/auto_edit/attachments metadata)
- `POST /gateway/chat/roundtable` — run multi-agent discussion rounds on a topic
- `GET /gateway/chat/stream` (SSE)
- `GET /gateway/jobs?status=queued`
- `GET /gateway/usage/summary` — aggregated usage/cost + recent samples
- `GET /gateway/usage/stream` — SSE stream for usage/cost

## Dashboard (`/api/*`)

### Core
- `GET /api/agents`
- `GET /api/system`
- `POST /api/control`
- `GET /api/config`
- `PUT /api/config`
- `GET /api/metrics`

### Logs
- `GET /api/logs`
- `GET /api/logs/stream` (SSE)

### Gateway proxy
- `GET /api/gateway/capabilities`
- `GET/POST /api/gateway/agents`
- `GET/POST /api/gateway/connectors`
- `POST /api/gateway/chat-plan`
- `POST /api/gateway/chat-ask`
- `POST /api/gateway/chat-roundtable`
- `GET/POST /api/gateway/chat-thread`
- `GET /api/gateway/chat-stream` (SSE)
