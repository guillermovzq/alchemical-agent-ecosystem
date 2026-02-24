<h1 align="center">⚗️ Alchemical Agent Ecosystem</h1>

<p align="center">
  <img src="./assets/branding/variants/logo-horizontal.svg" alt="Alchemical Agent Ecosystem" width="760" />
</p>

<p align="center"><em>Cockpit multiagente local-first para orquestación real, control en tiempo real y operación segura.</em></p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=16&pause=1200&center=true&vCenter=true&width=980&lines=Orquestaci%C3%B3n+runtime+local-first;Gateway+con+RBAC+%2B+jobs+%2B+eventos;Agent+Node+Studio+para+personalizar+agentes;Chat+directo+%2B+roundtable+multi-agente;Perfiles+Docker+2g%2F4g%2F8g%2F16g%2F32g" alt="ticker funcionalidades" />
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/smouj/alchemical-agent-ecosystem" alt="Licencia"></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/commits/main"><img src="https://img.shields.io/github/last-commit/smouj/alchemical-agent-ecosystem" alt="Último commit"></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/actions/workflows/ci.yml"><img src="https://github.com/smouj/alchemical-agent-ecosystem/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/actions/workflows/release.yml"><img src="https://github.com/smouj/alchemical-agent-ecosystem/actions/workflows/release.yml/badge.svg" alt="Release"></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/actions/workflows/sync-project-status.yml"><img src="https://github.com/smouj/alchemical-agent-ecosystem/actions/workflows/sync-project-status.yml/badge.svg" alt="Sync project"></a>
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

## 🚀 Instalación primero (recomendado)

```bash
cd /mnt/d/alchemical-agent-ecosystem
./install.sh --wizard
./scripts/alchemical up-fast
curl -fsS http://localhost/gateway/health
```

URLs runtime:
- `http://localhost` → runtime vía Docker + Caddy
- `http://localhost:3000` → dashboard en modo dev (`cd apps/alchemical-dashboard && npm run dev`)

---

## ✨ Para qué sirve este proyecto

Usa Alchemical cuando necesitas un **cockpit operativo local** para flujos multiagente:
- orquestar agentes lógicos sobre servicios reales,
- gestionar conectores/jobs/eventos/chat desde una sola UI,
- ejecutar discusiones multiagente y dispatch de acciones,
- mantener runtime observable, auditable y seguro.

---

## 🧠 Capacidades clave (implementadas)

| Área | Capacidad actual |
|---|---|
| Control de agentes | Start/stop/restart + chequeo dispatch |
| Personalización de agentes | **Agent Node Studio** (nodos + etiquetas skills/tools) |
| Chat | Hilo compartido + ask directo + roundtable |
| Realtime | Streams SSE de chat/eventos/usage/logs |
| Seguridad operativa | Token auth + RBAC + API keys + secret scan |
| Datos runtime | Jobs, eventos, usage y chat persistidos |

---

## 🏗️ Arquitectura (realidad actual)

```mermaid
flowchart TB
  U[Operador] --> D[Dashboard Next.js]
  D -->|/api/gateway/* + SSE| G[Gateway FastAPI]
  G -->|dispatch| S[Servicios 7401..7410]
  G --> DB[(SQLite runtime)]
  G --> R[(Redis)]
  G --> C[(ChromaDB)]
  S --> O[(Ollama)]
  EDGE[Caddy :80/:443] --> D
  EDGE --> G
```

```mermaid
flowchart LR
  IN[Mensaje operador] --> GW[Gateway]
  GW --> REG[Registry de agentes]
  REG --> MAP[target_service]
  MAP --> EXEC[Acción del servicio]
  EXEC --> STORE[Eventos + chat + jobs + usage]
  STORE --> UI[Dashboard realtime]
```

---

## 🧩 API destacada

- `POST /gateway/chat/ask`
- `POST /gateway/chat/roundtable`
- `GET /gateway/chat/stream`
- `GET /gateway/usage/summary`
- `POST /gateway/connectors/webhook/{channel}`

Referencia completa: [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md)

---

## 📚 Documentación

- [`docs/README.md`](./docs/README.md)
- [`docs/INSTALLATION.md`](./docs/INSTALLATION.md)
- [`docs/CLI_REFERENCE.md`](./docs/CLI_REFERENCE.md)
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- [`docs/OPERATIONS_RUNBOOK.md`](./docs/OPERATIONS_RUNBOOK.md)

---

## 🔄 Ritual del proyecto

```bash
bash ops/ritual-sync.sh
```

---

## 📄 Licencia

MIT
