# Alchemical Ecosystem Roadmap

## Vision
Build a fully self-hosted, local-first AI ecosystem with:
- agent creation and orchestration,
- skill/tool assignment,
- connector integrations,
- safe-by-default runtime controls.

## Phase 1 (Done)
- Runtime profiles by RAM: 2g/4g/8g/16g/32g.
- Premium dashboard with real runtime data.
- Security guardrails: secrets scan + pre-commit hook.

## Phase 2 (In progress)
- Gateway capability APIs:
  - `GET /capabilities`
  - `GET/POST /agents`
  - `GET/POST /connectors`
  - `POST /chat/actions/plan`
- Secret-safe connector references (`token_ref`, no raw token storage).

## Phase 3 (Next)
- Real chat UI in dashboard with:
  - Quick action buttons (skills/tools/subagents)
  - One-click task templates
  - Agent creation wizard wired to `/agents`
  - Connector setup wizard wired to `/connectors`
- Live execution timeline + streaming logs.

## Phase 4
- Policy engine (role-based permissions).
- Connector webhooks and retry queue.
- Multi-node orchestration and distributed worker pools.
