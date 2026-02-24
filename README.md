<h1 align="center">⚗️ Alchemical Agent Ecosystem</h1>

<p align="center">
  <img src="./assets/branding/variants/logo-horizontal.svg" alt="Alchemical Agent Ecosystem" width="760" />
</p>

<p align="center"><em>Local-first multi-agent cockpit for real orchestration, realtime control, and safe operations.</em></p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=16&pause=1200&center=true&vCenter=true&width=980&lines=Local-first+runtime+orchestration;Gateway+policy+%2B+RBAC+%2B+jobs+%2B+events;Agent+Node+Studio+for+visual+agent+customization;Realtime+chat+ask+%2B+multi-agent+roundtable;Docker+profiles+2g%2F4g%2F8g%2F16g%2F32g" alt="feature ticker" />
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/smouj/alchemical-agent-ecosystem" alt="License"></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/commits/main"><img src="https://img.shields.io/github/last-commit/smouj/alchemical-agent-ecosystem" alt="Last commit"></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/actions/workflows/ci.yml"><img src="https://github.com/smouj/alchemical-agent-ecosystem/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/actions/workflows/release.yml"><img src="https://github.com/smouj/alchemical-agent-ecosystem/actions/workflows/release.yml/badge.svg" alt="Release"></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/actions/workflows/sync-project-status.yml"><img src="https://github.com/smouj/alchemical-agent-ecosystem/actions/workflows/sync-project-status.yml/badge.svg" alt="Project sync"></a>
  <img src="https://img.shields.io/badge/runtime-Docker%20Compose-2496ED" alt="Docker Compose">
  <img src="https://img.shields.io/badge/gateway-FastAPI-009688" alt="FastAPI">
  <img src="https://img.shields.io/badge/dashboard-Next.js%2015-black" alt="Next.js 15">
  <img src="https://img.shields.io/badge/realtime-SSE-06b6d4" alt="SSE">
  <img src="https://img.shields.io/github/stars/smouj/alchemical-agent-ecosystem?style=social" alt="Stars">
  <img src="https://img.shields.io/github/forks/smouj/alchemical-agent-ecosystem?style=social" alt="Forks">
</p>

<p align="center">
  <a href="./README.md"><img src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge" alt="English"></a>
  <a href="./README.es.md"><img src="https://img.shields.io/badge/Idioma-Espa%C3%B1ol-c92a2a?style=for-the-badge" alt="Español"></a>
</p>

---

## 🚀 Installation first (recommended)

```bash
cd /mnt/d/alchemical-agent-ecosystem
./install.sh --wizard
./scripts/alchemical up-fast
curl -fsS http://localhost/gateway/health
```

Runtime URLs:
- `http://localhost` → runtime via Docker + Caddy
- `http://localhost:3000` → dashboard dev mode (`cd apps/alchemical-dashboard && npm run dev`)

---

## ✨ What this project is for

Use Alchemical when you need a **local operational cockpit** for AI-agent workflows:
- orchestrate logical agents over real services,
- manage connectors/jobs/events/chat from one place,
- run multi-agent discussions and action dispatch,
- keep runtime observable, auditable, and safe.

---

## 🧠 Key capabilities (implemented)

| Area | Current capability |
|---|---|
| Agent control | Start/stop/restart + dispatch checks |
| Agent customization | **Agent Node Studio** (nodes + skill/tool tags) |
| Chat | Shared thread + direct ask + roundtable |
| Realtime | SSE streams for chat/events/usage/logs |
| Ops safety | Token auth + RBAC + API keys + secret scan |
| Runtime data | Jobs, events, usage and chat persisted |

---

## 🏗️ Architecture (current reality)

```mermaid
flowchart TB
  U[Operator] --> D[Dashboard Next.js]
  D -->|/api/gateway/* + SSE| G[Gateway FastAPI]
  G -->|dispatch| S[Execution services 7401..7410]
  G --> DB[(SQLite runtime)]
  G --> R[(Redis)]
  G --> C[(ChromaDB)]
  S --> O[(Ollama)]
  EDGE[Caddy :80/:443] --> D
  EDGE --> G
```

```mermaid
flowchart LR
  IN[Operator message] --> GW[Gateway]
  GW --> REG[Agent registry]
  REG --> MAP[target_service]
  MAP --> EXEC[Service action]
  EXEC --> STORE[Events + chat + jobs + usage]
  STORE --> UI[Realtime dashboard]
```

---

## 🧩 API highlights

- `POST /gateway/chat/ask`
- `POST /gateway/chat/roundtable`
- `GET /gateway/chat/stream`
- `GET /gateway/usage/summary`
- `POST /gateway/connectors/webhook/{channel}`

Full reference: [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md)

---

## 📚 Documentation

- [`docs/README.md`](./docs/README.md)
- [`docs/INSTALLATION.md`](./docs/INSTALLATION.md)
- [`docs/CLI_REFERENCE.md`](./docs/CLI_REFERENCE.md)
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- [`docs/OPERATIONS_RUNBOOK.md`](./docs/OPERATIONS_RUNBOOK.md)

---

## 🔄 Project ritual

```bash
bash ops/ritual-sync.sh
```

---

## 📄 License

MIT
