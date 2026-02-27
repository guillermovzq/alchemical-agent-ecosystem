# Changelog

All notable changes to the **Alchemical Agent Ecosystem** are documented in this file.

This project adheres to [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased – v2.0.0 "Magnum Opus"] — target: 2026-Q1

### ✦ The Grand Transmutation

Every opus has a moment where iteration gives way to transformation — where refinement becomes reinvention. v2.0 is that moment for the Alchemical Agent Ecosystem.

v1.x proved the thesis: that local-first AI orchestration was not only possible but powerful. We forged a working engine, established the patterns, and listened to every practitioner who invoked it. What we heard, consistently, was that the foundation was sound but the edifice needed to match the ambition of the work being done within it.

Magnum Opus is not a patch. It is not a feature release. It is the complete realization of what this project set out to become — from the visual identity that now reflects the gravity of local AI sovereignty, to the stateful orchestration engine that enables agents to form purposeful coalitions, to the hierarchical memory system that gives those agents genuine continuity across sessions. Every layer has been reimagined. Every surface has been reforged.

The name is deliberate. In alchemical tradition, the *Magnum Opus* — the Great Work — was the ultimate pursuit: the transmutation of base matter into something of enduring, transcendent value. We do not use the name lightly. We use it because we believe this release represents a threshold. What comes after v2.0 will be refinement. What came before was preparation. This is the Work itself.

We extend deep gratitude to every contributor, practitioner, and curious soul who tested, questioned, opened issues, and submitted pull requests. The Opus is forged in community.

---

### Added

#### Brand & Visual Identity

- Complete brand identity redesign under the Magnum Opus visual system — new palette, typography, glow language, and animation principles (see `assets/branding/README.md`)
- New logo suite: master logo (`logo-v2.svg`, 1024×1024), horizontal variant (`logo-horizontal-v2.svg`, 1200×280), and standalone mark (`logo-mark-v2.svg`, 512×512) — all featuring premium alchemical aesthetics with the Philosopher's Engine mascot concept
- Comprehensive CSS design token system (`assets/branding/alchemical-palette.css`) — all brand colors, type scales, glow values, and animation durations as CSS custom properties; zero selectors, safe for any cascade context
- Tailwind CSS theme extension (`assets/branding/tailwind-alchemical.js`) — maps all design tokens to Tailwind utility classes (`bg-obsidian`, `text-mist`, `glow-gold-md`, `font-cinzel`, etc.)

#### Dashboard (v2)

- Complete dashboard rewrite on **Next.js 15** + **React 19** + **Framer Motion** + **shadcn/ui** + **Tailwind CSS** — a ground-up rebuild, not an incremental port
- Alchemical theme system: full dark mystical UI with layered obsidian surfaces, glow effects on interactive elements, and particle drift background for hero and canvas sections
- **Agent Node Studio v2**: rebuilt on **React Flow v12** with runic node designs — visual workflow builder with drag-and-drop composition, edge routing, and real-time execution state visualization
- **Aether Mode**: ultra-immersive full-dark experience toggled from the command palette — maximizes contrast, intensifies glow effects, and reduces all chrome to the essential
- Metrics dashboard with **Tremor** and **Recharts** integration — real-time charts for agent invocation counts, latency distributions, memory utilization, token throughput, and circle activity
- **Progressive Web App (PWA)** support — service worker, offline shell, installable on desktop and mobile, manifest with all required icon sizes
- Mobile-first responsive design throughout — all views are fully functional at 320px viewport width and above
- **Onboarding wizard** — first-run experience that guides new practitioners through model binding, first agent creation, and first workflow invocation; skippable, resumable

#### Orchestration Engine

- **LangGraph-inspired stateful orchestration engine** — replaces the previous linear pipeline model with a true directed graph execution model supporting cycles, conditional branching, and persistent state across node invocations
- **Alchemical Circles** — self-forming agent teams with automatic role assignment; a Circle is instantiated with a goal, recruits agents by capability profile, distributes sub-tasks, and dissolves gracefully on completion; roles: Architect (planner), Artificer (generator), Seeker (retriever), Arbiter (quality/judgment)
- Agent model extended with `memory_config` (per-agent memory tier configuration), `circle_membership` (current Circle affiliations and roles), and `evolution_config` (capability growth parameters)

#### Data & Memory

- **PostgreSQL + pgvector** migration from SQLite — full schema migration scripts provided; pgvector extension enables native vector similarity search without a separate vector database for standard deployments
- **Hierarchical memory system**: three-tier architecture — short-term working memory in **Redis** (in-context, ephemeral), mid-term episodic memory in **ChromaDB** (vector-indexed session history), long-term semantic memory via **LLM-generated summaries** (distilled narrative memory inscribed to PostgreSQL)
- Advanced **RAG pipeline** with cross-encoder reranking and agentic retrieval — agents can self-direct retrieval strategies, issue sub-queries, and synthesize multi-document responses

#### Multi-modal

- **LLaVA vision support** — fully local image understanding; agents can receive and reason about images via the standard message interface with no external API calls
- **Whisper audio transcription** — fully local speech-to-text via OpenAI Whisper (local); audio input supported in chat interface and as an agent input type

#### Plugin System

- **Plugin marketplace** integrated into the dashboard — skills are hot-reloadable packages installable without restarting the gateway; marketplace UI supports search, preview, install, update, and disable
- Plugin sandbox isolation — installed plugins run in restricted execution contexts with declared capability manifests

#### Portability

- **Grimoire export/import** — portable workflow bundle format (`.grimoire` archive): packages a complete workflow definition, its agent configurations, required skill declarations, and sample invocations into a single distributable file; importable into any compatible Alchemical Agent Ecosystem v2.0 instance

#### Observability

- **OpenTelemetry distributed tracing** — full span instrumentation across gateway, orchestration engine, agent invocations, and memory operations
- **Jaeger** integration for trace visualization — pre-configured Jaeger container in `docker-compose.yml`
- **Prometheus** metrics export — gateway exposes `/metrics` endpoint; pre-built Grafana dashboard definition included (`observability/grafana-dashboard.json`)
- **Full audit logging** — every agent invocation, Circle formation, memory read/write, plugin install, and configuration change is logged with timestamp, actor, and outcome to a structured audit log (PostgreSQL-backed)

#### Security

- **Secret management with age encryption** — all sensitive configuration values (API keys, database credentials, model endpoints) are stored encrypted at rest using the [age](https://age-encryption.org/) format; a local vault CLI (`aae-vault`) handles encryption/decryption workflows
- Vault integration with the dashboard — secrets are never exposed in plaintext in the UI; the gateway decrypts at startup from the local vault

#### Documentation

- **MkDocs Material** documentation site with custom alchemical theme — full practitioner guide, API reference, architecture overview, and plugin development guide; hosted under `docs/`
- All existing documentation migrated from ad-hoc markdown files to structured MkDocs source

#### Developer Experience

- **TypeScript strict mode** throughout the dashboard codebase — `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
- **Pydantic v2** throughout the gateway — all data models use Pydantic v2 with structured outputs for LLM response validation
- **Playwright E2E test suite** — covers critical user journeys: onboarding, agent creation, workflow execution, Circle formation, Grimoire export/import, Aether Mode toggle
- **pytest** comprehensive unit and integration test suite for the gateway — covers orchestration engine, memory tiers, RAG pipeline, plugin loading, and secret management
- **CI/CD improvements**: pre-commit hooks (ruff, mypy, eslint, prettier), type checking gates on all PRs, automated changelog validation

---

### Changed

- **Branding**: all color references across the codebase, documentation, and configuration migrated from v1.x palette to the Magnum Opus palette; old color variables removed from CSS and Tailwind config
- **Dashboard**: complete UI overhaul — this is not an incremental redesign. The v1.x dashboard is not preserved; v2.0 is a full replacement built on a new technology stack. Migration of custom dashboard configurations is not automatic; see Migration Guide below.
- **Gateway**: SQLite replaced by PostgreSQL as the primary data store; all schema definitions updated to PostgreSQL-native types; migration scripts in `gateway/migrations/`
- **Agent model**: `Agent` schema extended with three new top-level configuration blocks (`memory_config`, `circle_membership`, `evolution_config`); all v1.x agent definitions remain loadable with defaults injected for new fields
- **Documentation**: all documentation migrated from `docs/*.md` flat structure to MkDocs Material structured site under `docs/`; old `docs/*.md` files removed in favor of `docs/src/` source structure

---

### Migration Guide

> **From v1.x to v2.0 "Magnum Opus"**

v2.0 is a major release with breaking changes at the data layer and dashboard layer. Follow this guide in sequence.

#### 1. Prerequisites

Before beginning migration, ensure you have:

- PostgreSQL 15+ running and accessible
- The `pgvector` extension installed in your target database (`CREATE EXTENSION vector;`)
- Redis 7+ running (for the new memory tier)
- Node.js 20+ and Python 3.11+ on your system
- A backup of your v1.x SQLite database file (`gateway/data/aae.db` by default)

#### 2. Back Up v1.x Data

```bash
# Back up SQLite database
cp gateway/data/aae.db gateway/data/aae.db.v1-backup

# Export existing agent definitions to JSON (v1.x CLI)
aae export-agents --output ./v1-agents-backup.json

# Export existing workflows to JSON (v1.x CLI)
aae export-workflows --output ./v1-workflows-backup.json
```

#### 3. Install v2.0 Dependencies

```bash
# Backend gateway
cd gateway
pip install -r requirements.txt

# Dashboard
cd ../dashboard
npm install
```

#### 4. Configure Environment

Copy and edit the new environment template:

```bash
cp .env.example .env
```

Key new variables to configure in `.env`:

```bash
# PostgreSQL connection
DATABASE_URL=postgresql://user:password@localhost:5432/aae_v2

# Redis (memory tier)
REDIS_URL=redis://localhost:6379/0

# ChromaDB (episodic memory)
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Secret vault (age encryption key path)
AAE_VAULT_KEY_PATH=~/.config/aae/vault.key
```

#### 5. Run Database Migration

```bash
cd gateway

# Initialize PostgreSQL schema
python -m alembic upgrade head

# Migrate existing SQLite data to PostgreSQL
python scripts/migrate_sqlite_to_postgres.py \
  --sqlite-path ../gateway/data/aae.db.v1-backup \
  --postgres-url $DATABASE_URL
```

The migration script transmutes all v1.x agent definitions, workflow records, and invocation history into the v2.0 PostgreSQL schema. Agent records will have `memory_config`, `circle_membership`, and `evolution_config` fields populated with defaults.

#### 6. Initialize the Secret Vault

```bash
# Generate a new age encryption key
aae-vault init

# Re-register any API keys or secrets previously stored in plaintext .env
aae-vault set OPENAI_API_KEY "your-key-here"
aae-vault set ANTHROPIC_API_KEY "your-key-here"
# ... etc.
```

Remove plaintext secret values from `.env` after inscribing them to the vault.

#### 7. Build the Dashboard

```bash
cd dashboard
npm run build
```

> **Note:** The v2.0 dashboard is a complete rewrite. Any customizations made to the v1.x dashboard (custom components, modified pages, custom theme overrides) must be re-implemented in the v2.0 codebase. The v1.x dashboard source is not forward-compatible.

#### 8. Verify Migration

```bash
# Run the gateway and verify it starts cleanly
cd gateway
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# In another terminal, run the health check
curl http://localhost:8000/health

# Start the dashboard
cd dashboard
npm start
```

Navigate to the dashboard and verify that your agents and workflows are visible and correctly configured.

#### 9. Migrate Workflow Definitions (if customized)

If you have custom workflow definitions in `.yaml` or `.json` format from v1.x, run the workflow migration tool:

```bash
python scripts/migrate_workflows_v1_to_v2.py \
  --input ./v1-workflows-backup.json \
  --output ./v2-workflows-migrated.json

# Review the migrated file, then import
aae import-workflows --input ./v2-workflows-migrated.json
```

#### 10. Known Breaking Changes Summary

| Area | v1.x Behavior | v2.0 Behavior |
|---|---|---|
| Database | SQLite (`aae.db`) | PostgreSQL + pgvector (required) |
| Agent schema | No `memory_config` | `memory_config` required (defaults provided by migration) |
| Dashboard | React + Vite (v1.x stack) | Next.js 15 + React 19 (complete rewrite) |
| Secrets | Plaintext `.env` | age-encrypted vault (plaintext `.env` still supported but deprecated) |
| Memory | Single in-context window | Three-tier: Redis + ChromaDB + PostgreSQL summaries |
| Workflows | Linear pipeline model | LangGraph-style directed graph (backward-compatible definitions auto-converted) |
| Documentation | Flat `docs/*.md` | MkDocs Material under `docs/src/` |

---

## [v1.x – Previous Releases]

The complete history of v1.x releases is preserved in the git log. To review prior release notes:

```bash
# View all tagged releases
git tag --sort=-version:refname

# View the log for a specific release
git show v1.3.0

# View the full commit history prior to v2.0
git log v1.3.0..HEAD --oneline
```

Selected v1.x milestones, for historical reference:

| Tag | Codename | Notable |
|---|---|---|
| `v1.3.0` | — | Final v1.x release; SQLite stability improvements; plugin API v1 finalization |
| `v1.2.0` | — | Initial plugin/skills system; basic agent memory; multi-model routing |
| `v1.1.0` | — | Workflow YAML definition format; gateway REST API v1; first dashboard |
| `v1.0.0` | — | Initial public release; single-agent invocation; local Ollama integration |

*Full commit history, including all v1.x changes, is available via `git log`.*

---

*The Opus endures. For questions, contributions, or to report a disruption, see [CONTRIBUTING.md](./CONTRIBUTING.md).*
