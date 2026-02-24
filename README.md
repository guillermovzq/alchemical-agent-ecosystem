# Alchemical Agent Ecosystem

<p align="center">
  <img src="./assets/branding/logo.svg" alt="Alchemical Robot Logo" width="180" />
</p>

![License](https://img.shields.io/github/license/smouj/alchemical-agent-ecosystem)
![Last Commit](https://img.shields.io/github/last-commit/smouj/alchemical-agent-ecosystem)
![Docker](https://img.shields.io/badge/runtime-Docker%20Compose-2496ED)
![Local AI](https://img.shields.io/badge/LLM-Local%20Only-success)

Unified, self-hosted multi-agent platform focused on **local-first execution**, **no paid APIs**, and **low-cost operation**.

## Features
- 10 specialized agent services (7401-7410)
- Reverse proxy with Caddy (Docker service discovery, no hardcoded IPs)
- Local stack: Redis + ChromaDB + Ollama
- One-command installer flow (`install.sh`)
- Self-hosted architecture suitable for low-cost VPS and local machines

## Project Structure
- `services/*` → agent APIs
- `infra/caddy` → reverse proxy config
- `infra/scripts/install.sh` → deployment bootstrap
- `docs/*` → architecture and operations

## Quick Start (local)
```bash
cd /mnt/d/alchemical-agent-ecosystem
./scripts/alchemical wizard
```

### CLI (one-command ops)
```bash
./scripts/alchemical doctor
./scripts/alchemical setup-hooks
./scripts/alchemical scan-secrets
./scripts/alchemical install --domain localhost --model phi3:mini
./scripts/alchemical up
./scripts/alchemical status
./scripts/alchemical logs velktharion
./scripts/alchemical dashboard
```

## Planned Remote Install Command
```bash
curl -fsSL https://smouj.ai/install.sh | bash -s -- --domain your-domain.com
```

## Alchemical Control Panel (Dashboard)
Nuevo frontend premium (dark-only, glassmorphism + neumorphism sutil) para operar el ecosistema multi-agente local.

**Ruta:** `apps/alchemical-dashboard`

### Ejecutar (local)
```bash
cd /mnt/d/alchemical-agent-ecosystem/apps/alchemical-dashboard
npm install
npm run dev
```

### Mapa rápido
- `app/layout.tsx` → shell principal (sidebar fija + header sticky)
- `app/page.tsx` → home del dashboard
- `app/globals.css` → tokens visuales 2026 + efectos glass/grain
- `components/Sidebar.tsx` → navegación y estados Ollama/Redis/ChromaDB
- `components/AgentCard.tsx` → tarjeta de agente
- `components/CreateAgentWizard.tsx` → wizard 4 pasos + CTA "Transmutar Agente"
- `components/AgentsTable.tsx` → tabla de gestión de agentes
- `components/LogsMonitor.tsx` → panel terminal-like
- `lib/mock-data.ts` → datos de ejemplo

## License
MIT
