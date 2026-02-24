<h1 align="center">Alchemical Agent Ecosystem</h1>

<p align="center">
  <img src="./assets/branding/logo.svg" alt="Logo de Alchemical Agent Ecosystem" width="180" />
</p>

<p align="center">
  <strong>Plataforma multiagente IA auto-hospedada, local-first</strong><br/>
  Docker-native · Sin APIs de pago obligatorias · Operación orientada a producción
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/smouj/alchemical-agent-ecosystem" alt="Licencia"></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/commits/main"><img src="https://img.shields.io/github/last-commit/smouj/alchemical-agent-ecosystem" alt="Último Commit"></a>
  <img src="https://img.shields.io/badge/runtime-Docker%20Compose-2496ED" alt="Docker Compose">
  <img src="https://img.shields.io/badge/IA-Local%20Only-success" alt="IA Local">
  <img src="https://img.shields.io/badge/perfiles-2G%2F4G%2F8G%2F16G%2F32G-blueviolet" alt="Perfiles RAM">
</p>

<p align="center">
  <a href="./README.es.md">🇪🇸 Español</a> · <a href="./README.md">🇬🇧 English</a>
</p>

---

## Índice

- [Resumen](#resumen)
- [Características principales](#características-principales)
- [Arquitectura](#arquitectura)
- [Mapa de servicios](#mapa-de-servicios)
- [Dashboard (Alchemical Control Panel)](#dashboard-alchemical-control-panel)
- [Instalación y operación](#instalación-y-operación)
- [Perfiles RAM (2G / 4G / 8G / 16G / 32G)](#perfiles-ram-2g--4g--8g--16g--32g)
- [Guardrails de seguridad](#guardrails-de-seguridad)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Notas operativas](#notas-operativas)
- [Licencia](#licencia)

---

## Resumen

**Alchemical Agent Ecosystem** es una plataforma unificada para ejecutar agentes IA especializados en entorno local/autohospedado.

Está diseñada para:
- infraestructura de bajo coste,
- operación reproducible con Docker,
- ejecución de modelos locales con Ollama,
- flujos seguros y auditables.

---

## Características principales

| Capacidad | Descripción |
|---|---|
| Runtime multiagente | 10 servicios especializados (puertos `7401`–`7410`) |
| Stack IA local-first | Ollama + Redis + ChromaDB |
| Reverse proxy | Caddy con descubrimiento de servicios (sin IPs hardcodeadas) |
| Operación one-command | CLI `./scripts/alchemical` para instalar, ejecutar, logs y diagnóstico |
| Dashboard premium | Panel en tiempo real con salud, logs, acciones y configuración |
| Seguridad base | Escaneo de secretos + hook pre-commit |
| Perfiles RAM | Perfiles ajustados para hosts de 2G, 4G, 8G, 16G y 32G |

---

## Arquitectura

```text
                     ┌───────────────────────────────┐
                     │      Alchemical Dashboard     │
                     │ (Next.js + capa API runtime)  │
                     └───────────────┬───────────────┘
                                     │
                               HTTP / API
                                     │
┌────────────────────────────────────┴────────────────────────────────────┐
│                                CADDY :80                               │
└───────┬───────────────────────────────────────────────────────────┬──────┘
        │                                                           │
        │ /gateway/*                                                │ /<agente>/*
        │                                                           │
┌───────▼────────────────────┐                         ┌────────────▼────────────┐
│      alchemical-gateway    │                         │   Servicios de agentes   │
│ dispatch + orquestación    │                         │ 7401..7410 (FastAPI)     │
└───────┬────────────────────┘                         └────────────┬────────────┘
        │                                                           │
        └───────────────┬───────────────────────────────────────────┘
                        │
      ┌─────────────────▼──────────────┐
      │        Stack local compartido  │
      │ Ollama · Redis · ChromaDB      │
      └────────────────────────────────┘
```

---

## Mapa de servicios

### Servicios de agentes

| Servicio | Puerto | Endpoint principal |
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
| Caddy | Entrada principal y reverse proxy |
| alchemical-gateway | API de dispatch y orquestación |
| Redis | Capa rápida de datos/cache |
| ChromaDB | Capa de memoria vectorial |
| Ollama | Hosting de modelos locales |

---

## Dashboard (Alchemical Control Panel)

Ruta: `apps/alchemical-dashboard`

### Qué está conectado en tiempo real (sin mocks)
- Estado de agentes desde `docker compose ps` + `/health`
- Acciones start/stop/restart reales sobre servicios
- Logs reales desde `docker compose logs`
- Salud de servicios core (Caddy, Redis, ChromaDB, Ollama, Gateway)
- Métricas CPU/RAM desde `docker stats`
- Ajustes persistentes del dashboard vía API de configuración

### Endpoints runtime del dashboard

| Endpoint | Método | Propósito |
|---|---|---|
| `/api/agents` | GET | Inventario real de agentes + estado |
| `/api/system` | GET | Salud de servicios core |
| `/api/control` | POST | Start/stop/restart en agentes permitidos |
| `/api/logs` | GET | Tail de logs por servicio |
| `/api/metrics` | GET | Uso CPU/RAM desde Docker stats |
| `/api/config` | GET/PUT | Configuración persistente del panel |
| `/api/agent/[name]/dispatch` | POST | Dispatch real al agente |

---

## Instalación y operación

### Arranque rápido

```bash
cd /mnt/d/alchemical-agent-ecosystem
./scripts/alchemical wizard
```

### Comandos CLI

```bash
./scripts/alchemical doctor
./scripts/alchemical setup-hooks
./scripts/alchemical scan-secrets
./scripts/alchemical install --domain localhost --profile 4g --model phi3:mini
./scripts/alchemical up
./scripts/alchemical up-2g
./scripts/alchemical up-4g
./scripts/alchemical up-8g
./scripts/alchemical status
./scripts/alchemical logs velktharion
./scripts/alchemical dashboard
```

---

## Perfiles RAM (2G / 4G / 8G / 16G / 32G)

Elige huella de runtime según memoria del host:

| Perfil | RAM recomendada | Servicios |
|---|---:|---|
| `2g` | 2 GB | core + gateway + `velktharion`, `synapsara` |
| `4g` | 4 GB | `2g` + `kryonexus`, `ignivox` |
| `8g` | 8 GB | `4g` + `auralith`, `resonvyr` |
| `16g` | 16 GB | stack completo |
| `32g` | 32 GB | stack completo (margen para modelos locales mayores) |

```bash
./scripts/alchemical install --profile 2g --domain localhost
./scripts/alchemical install --profile 4g --domain localhost
./scripts/alchemical install --profile 8g --domain localhost
./scripts/alchemical install --profile 16g --domain localhost
./scripts/alchemical install --profile 32g --domain localhost
```

Atajos de arranque rápido:

```bash
./scripts/alchemical up-2g
./scripts/alchemical up-4g
./scripts/alchemical up-8g
```

Sugerencia de modelo por perfil:
- `2g` → `tinyllama:1.1b`
- `4g` → `phi3:mini`
- `8g` → `qwen2.5:3b`
- `16g`/`32g` → `phi3:mini` (puedes sobrescribir con `--model`)

---

## Guardrails de seguridad

| Control | Estado |
|---|---|
| `.gitignore` reforzado para secretos/certs/keys | ✅ |
| `scripts/security/check-secrets.sh` | ✅ |
| hook pre-commit (`.githooks/pre-commit`) | ✅ |
| comando CLI de escaneo | ✅ (`./scripts/alchemical scan-secrets`) |

Recomendado antes de cada push:

```bash
./scripts/alchemical doctor
./scripts/alchemical scan-secrets
```

---

## Estructura del proyecto

```text
assets/                     # Recursos de branding
apps/alchemical-dashboard/  # Panel de control Next.js
docs/                       # Documentación de arquitectura y operación
gateway/                    # Servicio gateway de orquestación
infra/caddy/                # Configuración reverse proxy
infra/scripts/              # Instalador y bootstrap
scripts/                    # CLI operativa y automatizaciones
services/                   # Servicios de agentes (FastAPI)
shared/                     # Schemas y contratos compartidos
workspace/skills/           # Workspace de skills
```

---

## Notas operativas

- Repositorio optimizado para Linux/WSL con Docker.
- Mantén secretos fuera de Git (`.env`, certificados, llaves, tokens).
- Si necesitas métricas GPU reales, integra runtime NVIDIA/DCGM.

---

## Licencia

MIT
