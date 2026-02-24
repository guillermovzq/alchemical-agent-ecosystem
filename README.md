<h1 align="center">Alchemical Agent Ecosystem</h1>

<p align="center">
  <img src="./assets/branding/logo.svg" alt="Alchemical Agent Ecosystem Logo" width="180" />
</p>

<p align="center">
  <strong>Local-first, self-hosted multi-agent platform</strong><br/>
  Docker-native · Real-time control plane · No paid APIs required
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/smouj/alchemical-agent-ecosystem" alt="License"></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/commits/main"><img src="https://img.shields.io/github/last-commit/smouj/alchemical-agent-ecosystem" alt="Last Commit"></a>
  <img src="https://img.shields.io/badge/runtime-Docker%20Compose-2496ED" alt="Docker Compose">
  <img src="https://img.shields.io/badge/realtime-SSE-06b6d4" alt="SSE">
  <img src="https://img.shields.io/badge/profiles-2G%2F4G%2F8G%2F16G%2F32G-blueviolet" alt="RAM profiles">
</p>

<p align="center">
  <a href="./README.es.md">🇪🇸 Español</a> · <a href="./README.md">🇬🇧 English</a>
</p>

---

## Contents

- [1) What this project is](#1-what-this-project-is)
- [2) Current architecture (real implementation)](#2-current-architecture-real-implementation)
- [3) Logical agents model](#3-logical-agents-model)
- [4) Runtime services map](#4-runtime-services-map)
- [5) Dashboard capabilities](#5-dashboard-capabilities)
- [6) API surface (dashboard + gateway)](#6-api-surface-dashboard--gateway)
- [7) Installation and operations](#7-installation-and-operations)
- [8) RAM profiles (2G/4G/8G/16G/32G)](#8-ram-profiles-2g4g8g16g32g)
- [9) Security model](#9-security-model)
- [10) Update workflow](#10-update-workflow)
- [11) Project structure](#11-project-structure)
- [12) Known limitations (honest status)](#12-known-limitations-honest-status)
- [License](#license)

---

## 1) What this project is

**Alchemical Agent Ecosystem** is a self-hosted orchestration platform to run and manage AI agents locally.

It combines:
- a **gateway** for routing, orchestration, registries, and real-time threads,
- a **dashboard** for operations and control,
- a **service mesh** of FastAPI agent backends,
- a local AI stack: **Ollama + Redis + ChromaDB**.

Design goals:
- local-first execution,
- reproducible Docker operations,
- realistic controls for production-like environments,
- extensible logical agent model (not fixed to service count).

---

## 2) Current architecture (real implementation)

```text
                        ┌────────────────────────────────┐
                        │  Alchemical Dashboard (Next.js)│
                        │  - Control UI                 │
                        │  - SSE chat/logs              │
                        │  - Gateway proxies            │
                        └───────────────┬────────────────┘
                                        │
                                        │ HTTP + SSE
                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                                CADDY :80                                │
└───────────────┬──────────────────────────────────────────────────────────┘
                │
                ├── /gateway/*  → alchemical-gateway
                └── /<service>/* → agent services (7401..7410)

┌────────────────────────────────┐      ┌───────────────────────────────────┐
│       alchemical-gateway       │      │        Agent services (10)        │
│ - capabilities/agents/connectors│     │ FastAPI containers (7401..7410)   │
│ - dispatch + thread persistence │     │ target_service execution backends   │
│ - tokenized API endpoints       │     └───────────────────────────────────┘
└────────────────────────────────┘

      Shared local stack: Redis · ChromaDB · Ollama
```

---

## 3) Logical agents model

The platform separates:
1. **logical agents** (business roles), and
2. **runtime services** (execution backends).

By default, gateway seeds 5 editable logical agents:

| Logical Agent | Role |
|---|---|
| Alquimista Mayor | Global orchestrator, routing, quality gate |
| Investigador/Analista | Research, verification, source comparison |
| Ingeniero/Constructor | Code, integration, debugging, delivery |
| Creador Visual | UI/UX, branding, visual outputs |
| Redactor/Narrador | Copywriting, storytelling, SEO content |

> Important: skills/tools are **capabilities attached to agents**, not fixed agents themselves.

---

## 4) Runtime services map

### Agent backend services

| Service | Port | Endpoint |
|---|---:|---|
| velktharion | 7401 | `/navigate` |
| synapsara | 7402 | `/query` |
| kryonexus | 7403 | `/search` |
| noctumbra-mail | 7404 | `/send` |
| temporaeth | 7405 | `/plan` |
| vaeloryn-conclave | 7406 | `/deliberate` |
| ignivox | 7407 | `/transform` |
| auralith | 7408 | `/live` |
| resonvyr | 7409 | `/voice` |
| fluxenrath | 7410 | `/` |

### Core infrastructure

| Component | Purpose |
|---|---|
| Caddy | Reverse proxy / entrypoint |
| alchemical-gateway | Orchestration and registries API |
| Redis | Fast key-value runtime layer |
| ChromaDB | Vector storage layer |
| Ollama | Local model serving |

---

## 5) Dashboard capabilities

Path: `apps/alchemical-dashboard`

Current implemented features:
- real-time service health from Docker + `/health`,
- start/stop/restart controls,
- real logs viewer,
- real chat thread with agent/operator messages,
- SSE stream for chat + logs,
- connector and logical agent registration UI,
- persisted dashboard settings,
- Canvas Lab for web visualization + snapshot dispatch trigger,
- connect/reconnect/disconnect controls for SSE chat stream.

---

## 6) API surface (dashboard + gateway)

### Dashboard runtime APIs

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/agents` | GET | Agent inventory + runtime status |
| `/api/system` | GET | Core health |
| `/api/control` | POST | Start/stop/restart services |
| `/api/logs` | GET | Log tail snapshot |
| `/api/logs/stream` | GET (SSE) | Real-time logs stream |
| `/api/metrics` | GET | CPU/RAM from docker stats |
| `/api/config` | GET/PUT | Persisted dashboard config |
| `/api/agent/[name]/dispatch` | POST | Dispatch action to target |

### Gateway-proxy APIs exposed by dashboard

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/gateway/capabilities` | GET | Skills/tools/connectors catalog |
| `/api/gateway/agents` | GET/POST | Logical agent registry |
| `/api/gateway/connectors` | GET/POST | Channel connectors registry |
| `/api/gateway/chat-plan` | POST | Chat planning action |
| `/api/gateway/chat-thread` | GET/POST | Shared thread |
| `/api/gateway/chat-stream` | GET (SSE) | Real-time thread stream |

### Gateway auth

Gateway protected endpoints require `x-alchemy-token` when `ALCHEMICAL_GATEWAY_TOKEN` is set.
Dashboard proxies inject this header from env automatically.

---

## 7) Installation and operations

### Quick start

```bash
cd /mnt/d/alchemical-agent-ecosystem
./scripts/alchemical wizard
```

### Main operations

```bash
./scripts/alchemical doctor
./scripts/alchemical setup-hooks
./scripts/alchemical scan-secrets
./scripts/alchemical install --domain localhost --profile 4g --model phi3:mini
./scripts/alchemical up
./scripts/alchemical status
./scripts/alchemical logs velktharion
./scripts/alchemical dashboard
./scripts/alchemical update
```

---

## 8) RAM profiles (2G/4G/8G/16G/32G)

Wizard auto-detects host RAM and suggests profile.

| Profile | Host RAM | Runtime footprint |
|---|---:|---|
| `2g` | ~2 GB | Core + gateway + 2 services |
| `4g` | ~4 GB | `2g` + extra execution services |
| `8g` | ~8 GB | `4g` + additional execution capacity |
| `16g` | ~16 GB | Full stack |
| `32g` | ~32 GB | Full stack + headroom for bigger local models |

Examples:

```bash
./scripts/alchemical install --profile 2g --domain localhost
./scripts/alchemical install --profile 4g --domain localhost
./scripts/alchemical install --profile 8g --domain localhost
./scripts/alchemical install --profile 16g --domain localhost
./scripts/alchemical install --profile 32g --domain localhost
```

---

## 9) Security model

| Control | Status |
|---|---|
| `.gitignore` hardened for secrets/certs/keys | ✅ |
| secret scanner (`scripts/security/check-secrets.sh`) | ✅ |
| pre-commit guard (`.githooks/pre-commit`) | ✅ |
| gateway token auth (`x-alchemy-token`) | ✅ |
| connector config with `token_ref` (no raw token intended) | ✅ |

Recommended before push:

```bash
./scripts/alchemical doctor
./scripts/alchemical scan-secrets
```

---

## 10) Update workflow

To sync with official GitHub repository and rebuild runtime:

```bash
./scripts/alchemical update
```

Current behavior:
1. `git fetch origin main`
2. `git pull --rebase origin main`
3. `docker compose up -d --build`

---

## 11) Project structure

```text
assets/                      # Branding resources
apps/alchemical-dashboard/   # Next.js control plane UI
docs/                        # Architecture and operational docs
gateway/                     # Alchemical gateway service (FastAPI)
infra/caddy/                 # Reverse proxy config
infra/scripts/               # Installer/bootstrap scripts
scripts/                     # Operational CLI + helpers
services/                    # Runtime execution services (FastAPI)
shared/                      # Shared schemas/contracts
workspace/skills/            # Skill workspace artifacts
```

---

## 12) Known limitations (honest status)

- GPU metric in dashboard is currently basic placeholder unless GPU runtime integration is enabled.
- Connector registry stores metadata/reference (`token_ref`) but does not yet execute full external messaging pipelines by itself.
- Thread persistence is file-based runtime JSON; for high-scale/multi-node production, migrate to durable DB/event bus.

---

## License

MIT
