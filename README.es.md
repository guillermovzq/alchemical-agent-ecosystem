<h1 align="center">⚗️ Alchemical Agent Ecosystem</h1>

<p align="center">
  <img src="./assets/branding/variants/logo-horizontal.svg" alt="Logo de Alchemical Agent Ecosystem" width="760" />
</p>

<p align="center"><em>Plataforma multiagente local-first · auto-hospedada · modular · orientada a operación real</em></p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/smouj/alchemical-agent-ecosystem" alt="Licencia" /></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/commits/main"><img src="https://img.shields.io/github/last-commit/smouj/alchemical-agent-ecosystem" alt="Último commit" /></a>
  <img src="https://img.shields.io/badge/runtime-Docker%20Compose-2496ED" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/realtime-SSE-06b6d4" alt="SSE" />
  <img src="https://img.shields.io/badge/perfiles-2G%2F4G%2F8G%2F16G%2F32G-7c3aed" alt="Perfiles RAM" />
</p>

<p align="center">
  <a href="./README.md"><img src="https://img.shields.io/badge/README-English-1f6feb?style=for-the-badge" alt="English" /></a>
  <a href="./README.es.md"><img src="https://img.shields.io/badge/README-Espa%C3%B1ol-c92a2a?style=for-the-badge" alt="Español" /></a>
</p>

---

## ✨ Resumen

**Alchemical Agent Ecosystem** es un sistema de orquestación local-first para agentes IA.
Combina:

- 🧠 **Agentes lógicos** (dinámicos y definidos por el usuario)
- ⚙️ **Backends de ejecución** (servicios FastAPI)
- 🌐 **Gateway** (orquestación, registros, cola y eventos)
- 🖥️ **Dashboard** (control plane + streams SSE)
- 🧱 **Stack de infraestructura** (Caddy, Redis, ChromaDB, Ollama)

---

## 🧭 Índice

- [✨ Resumen](#-resumen)
- [🏗️ Arquitectura](#️-arquitectura)
- [🧪 Agentes lógicos (seed por defecto)](#-agentes-lógicos-seed-por-defecto)
- [🗺️ Mapa de servicios runtime](#️-mapa-de-servicios-runtime)
- [🖥️ Capacidades del dashboard](#️-capacidades-del-dashboard)
- [🔌 Superficie API](#-superficie-api)
- [🚀 Instalación](#-instalación)
- [🛠️ Comandos CLI](#️-comandos-cli)
- [📦 Perfiles RAM](#-perfiles-ram)
- [🔒 Modelo de seguridad](#-modelo-de-seguridad)
- [📚 Mapa de documentación](#-mapa-de-documentación)
- [🔄 Update y rollback](#-update-y-rollback)
- [📁 Estructura del proyecto](#-estructura-del-proyecto)
- [📌 Limitaciones actuales](#-limitaciones-actuales)
- [📜 Licencia](#-licencia)

---

## 🏗️ Arquitectura

### Mapa simple del ecosistema (claro + moderno)

```text
Usuario / Operador
   │
   ▼
Dashboard (Next.js)
   │   - panel de control
   │   - chat + logs (SSE)
   │   - configuración de agentes/conectores
   ▼
Gateway (FastAPI)
   │   - auth + controles por rol
   │   - registro de agentes
   │   - routing skills/tools
   │   - cola/jobs + eventos + persistencia de hilo
   ▼
Servicios de ejecución (FastAPI, puertos 7401..7410)
   │   - endpoints reales de ejecución
   ▼
Capa de datos y modelos
   - SQLite (estado runtime)
   - Redis (estado/cache rápido)
   - ChromaDB (memoria vectorial)
   - Ollama (modelos locales)
```

### Cómo trabajan juntos agentes, skills y tools

| Capa | Qué representa | Comportamiento actual |
|---|---|---|
| **Agentes lógicos** | Roles de equipo (orquestador, investigador, ingeniero...) | Dinámicos y definidos en el registry del gateway |
| **Skills** | Capacidades de razonamiento usadas por agentes | Asignadas por agente como listas de capacidades |
| **Tools** | Interfaces de acción (search, shell, memory, docker, canvas...) | Asignadas por agente y usadas en planificación/ejecución |
| **Servicios de ejecución** | Workers backend concretos (7401-7410) | Agentes resuelven `target_service` para dispatch real |

### Flujo runtime (ruta real)

1. El operador envía instrucción desde Dashboard.
2. El Gateway valida token/rol y lee la config del agente.
3. El Gateway selecciona `target_service` y hace dispatch.
4. El servicio ejecuta y devuelve resultado.
5. El Gateway persiste eventos/chat y los expone por SSE.
6. El Dashboard actualiza en vivo (chat, logs, estado, métricas).

### Por qué este diseño

- **Flexible**: agentes desacoplados de nombres fijos de servicio.
- **Local-first**: todos los componentes core son auto-hospedados.
- **Operable**: cola/eventos/health para operación real.
- **Extensible**: fácil añadir agentes, skills, conectores y nuevos backends.

---

## 🧪 Agentes lógicos (seed por defecto)

El gateway inicializa 5 agentes lógicos editables:

| Agente | Misión |
|---|---|
| 👑 Alquimista Mayor | Orquestación global, routing y quality gate |
| 🔎 Investigador/Analista | Research, verificación y comparación de fuentes |
| 🔥 Ingeniero/Constructor | Código, integración, debugging y entrega |
| 🎨 Creador Visual | UI/UX, branding y outputs visuales |
| ✍️ Redactor/Narrador | Copywriting, storytelling y contenido SEO |

> Skills/tools son capacidades adjuntas a agentes (no identidades fijas).

### Mapa agente → servicio objetivo (por defecto)

| Agente lógico | Servicio objetivo |
|---|---|
| Alquimista Mayor | `velktharion` |
| Investigador/Analista | `synapsara` |
| Ingeniero/Constructor | `ignivox` |
| Creador Visual | `auralith` |
| Redactor/Narrador | `resonvyr` |

---

## 🗺️ Mapa de servicios runtime

### Backends de agentes

| Servicio | Puerto | Endpoint |
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

### Infraestructura core

| Componente | Propósito |
|---|---|
| [Caddy](https://caddyserver.com/) | Reverse proxy + ingress |
| `alchemical-gateway` | API de orquestación y control |
| [Redis](https://redis.io/) | Capa runtime key-value |
| [ChromaDB](https://www.trychroma.com/) | Capa de almacenamiento vectorial |
| [Ollama](https://ollama.com/) | Serving de modelos locales |

---

## 🖥️ Capacidades del dashboard

Ruta: `apps/alchemical-dashboard`

Implementado actualmente:

- ✅ Vista live de salud (servicios + agentes)
- ✅ Controles Start/Stop/Restart
- ✅ Logs reales + stream SSE de logs
- ✅ Hilo de chat compartido + stream SSE de chat
- ✅ Gateway workbench (agentes/conectores/planificación)
- ✅ Canvas Lab para workflows web/visual
- ✅ Controles Connect / Reconnect / Disconnect del stream

---

## 🔌 Superficie API

### Gateway core

| Endpoint | Método | Propósito |
|---|---|---|
| `/gateway/health` | GET | Liveness |
| `/gateway/ready` | GET | Readiness + contadores |
| `/gateway/stats` | GET | Estadísticas runtime |
| `/gateway/events` | GET | Feed de eventos |
| `/gateway/events/stream` | GET (SSE) | Stream realtime de eventos |
| `/gateway/capabilities` | GET | Catálogo de skills/tools/conectores |
| `/gateway/agents` | GET/POST | Listado/upsert de agentes lógicos |
| `/gateway/agents/{name}` | GET | Detalle de agente |
| `/gateway/connectors` | GET/POST | Listado/upsert de conectores |
| `/gateway/connectors/send` | POST | Encolar mensaje saliente de conector |
| `/gateway/connectors/webhook/{channel}` | POST | Ingesta de webhook entrante |
| `/gateway/auth/keys` | GET/POST | Listar/crear API keys (admin) |
| `/gateway/auth/keys/{id}/disable` | POST | Desactivar API key (admin) |
| `/gateway/jobs` | GET | Estado de cola/jobs |
| `/gateway/usage/summary` | GET | Resumen de uso/coste + muestras |
| `/gateway/usage/stream` | GET (SSE) | Stream en tiempo real de uso/coste |
| `/gateway/chat/thread` | GET/POST | Hilo compartido |
| `/gateway/chat/stream` | GET (SSE) | Stream realtime de hilo |
| `/gateway/chat/actions/plan` | POST | Planificación de objetivo |
| `/gateway/dispatch/{agent}/{action}` | POST | Dispatch a servicio objetivo |

### Rutas API del dashboard

| Endpoint | Método | Propósito |
|---|---|---|
| `/api/agents` | GET | Inventario + estado de agentes |
| `/api/system` | GET | Salud core |
| `/api/control` | POST | Acciones de servicios |
| `/api/logs` | GET | Snapshot de logs |
| `/api/logs/stream` | GET (SSE) | Logs realtime |
| `/api/metrics` | GET | Métricas CPU/RAM |
| `/api/config` | GET/PUT | Config del dashboard |
| `/api/gateway/*` | GET/POST | Proxies a endpoints del gateway |

---

## 🚀 Instalación

### Bootstrap remoto (un comando)

```bash
bash scripts/install-remote.sh
```

### Instalador one-command (recomendado)

```bash
cd /mnt/d/alchemical-agent-ecosystem
./install.sh --wizard
```

### Instalación no interactiva

```bash
./install.sh --domain localhost --profile 4g --model phi3:mini
```

### Modo de instalación rápida (optimizado)

```bash
# omite build local y pull de modelo por defecto
./install.sh --fast --profile 2g

# vía CLI rápida
./scripts/alchemical install-fast --profile 2g
./scripts/alchemical up-fast
```

---

## 🛠️ Comandos CLI

```bash
./scripts/alchemical doctor
./scripts/alchemical setup-hooks
./scripts/alchemical scan-secrets
./scripts/alchemical up
./scripts/alchemical up-2g
./scripts/alchemical up-4g
./scripts/alchemical up-8g
./scripts/alchemical status
./scripts/alchemical logs velktharion
./scripts/alchemical dashboard
./scripts/alchemical update
./scripts/alchemical update-safe
./scripts/alchemical rollback

# mantenimiento project/repo
bash ops/project-maintenance.sh

# sincronizar items del project con issues del repo
bash ops/sync-project-with-repo.sh
```

---

## 📦 Perfiles RAM

El wizard detecta RAM del host y sugiere perfil.

| Perfil | RAM host | Huella |
|---|---:|---|
| `2g` | ~2 GB | Core + gateway + servicios mínimos |
| `4g` | ~4 GB | Setup balanceado |
| `8g` | ~8 GB | Runtime extendido |
| `16g` | ~16 GB | Stack completo |
| `32g` | ~32 GB | Stack completo + más margen para modelos |

---

## 🔒 Modelo de seguridad

| Control | Implementación |
|---|---|
| 🔐 Auth por token | Header `x-alchemy-token` + `ALCHEMICAL_GATEWAY_TOKEN` |
| 👤 Roles de acceso | Checks `viewer` / `operator` / `admin` |
| 🔑 API keys | Gestión vía endpoints `/gateway/auth/keys` |
| 🧹 Escaneo de secretos | `./scripts/alchemical scan-secrets` |
| 🪝 Guard pre-commit | `./scripts/alchemical setup-hooks` |
| 🧾 Política de secretos en conectores | Solo `token_ref` (sin token raw) |

---

## 📚 Mapa de documentación

- [`docs/README.md`](./docs/README.md) — índice y política de documentación
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — arquitectura técnica
- [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md) — APIs de gateway + dashboard
- [`docs/OPERATIONS_RUNBOOK.md`](./docs/OPERATIONS_RUNBOOK.md) — runbook operativo (update/rollback)
- [`docs/ALCHEMICAL_ECOSYSTEM_ROADMAP.md`](./docs/ALCHEMICAL_ECOSYSTEM_ROADMAP.md) — roadmap
- [`docs/INTEGRATION_WORKPLAN.md`](./docs/INTEGRATION_WORKPLAN.md) — plan de integración
- [`docs/RELEASE_PLAN.md`](./docs/RELEASE_PLAN.md) — estrategia de releases y versionado
- [`docs/BRANDING.md`](./docs/BRANDING.md) — guía de uso/exportación del logo
- [`docs/PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md) — snapshot autogenerado del estado del repositorio
- [`docs/GO_BETA_CHECKLIST.md`](./docs/GO_BETA_CHECKLIST.md) — checklist final antes de declarar beta pública

---

## 🔄 Update y rollback

### Update rápido

```bash
./scripts/alchemical update
```

### Update seguro (recomendado)

```bash
./scripts/alchemical update-safe
```

Incluye lock, backup, checks, deploy y smoke-tests.

### Rollback

```bash
./scripts/alchemical rollback

# mantenimiento project/repo
bash ops/project-maintenance.sh

# sincronizar items del project con issues del repo
bash ops/sync-project-with-repo.sh
```

---

## 📁 Estructura del proyecto

| Ruta | Propósito |
|---|---|
| `.github/` | Workflows y templates de GitHub |
| `apps/alchemical-dashboard/` | Control plane en Next.js |
| `assets/` | Branding y recursos visuales |
| `docs/` | Documentación técnica y operativa |
| `gateway/` | Gateway de orquestación (FastAPI + SQLite queue) |
| `infra/caddy/` | Configuración de reverse proxy |
| `infra/scripts/` | Scripts de instalación/bootstrap |
| `ops/` | Scripts de update-safe y rollback |
| `scripts/` | CLI y utilidades de automatización |
| `services/` | Backends de ejecución (FastAPI) |
| `shared/` | Contratos/schemas compartidos |
| `workspace/skills/` | Repositorio de skills del ecosistema |

---

## 📌 Limitaciones actuales

- Métrica GPU básica salvo integración dedicada de runtime GPU.
- Transporte de conectores está preparado con cola/retry; algunos adapters específicos requieren más hardening.
- Para escala multi-nodo de alto volumen, conviene migrar SQLite runtime a DB/event bus dedicados.

---

## 📜 Licencia

📄 License MIT

---

<p align="center"><strong>Hecho con ❤️ por smouj — modelos locales, flujos abiertos y automatización real.</strong></p>

---
