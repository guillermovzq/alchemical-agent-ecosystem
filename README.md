<h1 align="center">⚗️ Alchemical Agent Ecosystem</h1>

<p align="center">
  <img src="./assets/branding/variants/logo-horizontal-v2.svg" width="820" alt="Alchemical Agent Ecosystem — Magnum Opus" />
</p>

<p align="center"><em>Where Intelligence is Forged, Not Fetched.</em></p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=18&duration=3200&pause=900&color=FFD700&center=true&vCenter=true&multiline=false&width=700&lines=The+Magnum+Opus+of+local-first+AI+orchestration;Visual+workflow+builder+%C2%B7+Alchemical+Circles+%C2%B7+LangGraph+engine;Hierarchical+memory+%C2%B7+Plugin+marketplace+%C2%B7+Multi-modal;100%25+local+%C2%B7+100%25+yours+%C2%B7+0+paid+APIs;Forged+in+obsidian+%C2%B7+Powered+by+emerald+fire" alt="Typing SVG" />
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/smouj/alchemical-agent-ecosystem?style=for-the-badge&color=4B0082&labelColor=1a1a2e" alt="License"/></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/commits/main"><img src="https://img.shields.io/github/last-commit/smouj/alchemical-agent-ecosystem?style=for-the-badge&color=FFD700&labelColor=1a1a2e" alt="Last Commit"/></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/actions"><img src="https://img.shields.io/github/actions/workflow/status/smouj/alchemical-agent-ecosystem/ci.yml?style=for-the-badge&label=CI&color=00FFAA&labelColor=1a1a2e" alt="CI"/></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/releases"><img src="https://img.shields.io/github/v/release/smouj/alchemical-agent-ecosystem?style=for-the-badge&color=4B0082&labelColor=1a1a2e" alt="Release"/></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/v2.0%20Magnum%20Opus-⚗️-4B0082?style=for-the-badge&labelColor=1a1a2e" alt="v2.0 Magnum Opus"/>
  <img src="https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/LangGraph-1e6fff?style=for-the-badge&logoColor=white" alt="LangGraph"/>
  <img src="https://img.shields.io/badge/Ollama-FF6B35?style=for-the-badge&logoColor=white" alt="Ollama"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PostgreSQL+pgvector-0d2040?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL+pgvector"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/ChromaDB-00C853?style=for-the-badge&logoColor=white" alt="ChromaDB"/>
  <img src="https://img.shields.io/badge/OpenTelemetry-f5a623?style=for-the-badge&logo=opentelemetry&logoColor=white" alt="OpenTelemetry"/>
  <img src="https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SSE%20Realtime-00BCD4?style=for-the-badge&logoColor=white" alt="SSE Realtime"/>
  <img src="https://img.shields.io/badge/RBAC%20+%20API%20Keys-2E7D32?style=for-the-badge&logoColor=white" alt="RBAC + API Keys"/>
</p>

<p align="center">
  <a href="./README.md"><img src="https://img.shields.io/badge/🇬🇧%20English-active-4B0082?style=flat-square" alt="English"/></a>
  <a href="./README.es.md"><img src="https://img.shields.io/badge/🇪🇸%20Español-available-FFD700?style=flat-square" alt="Español"/></a>
</p>

---

## ✦ The Grand Transmutation

In the ancient art of alchemy, the *Magnum Opus* — the Great Work — was not merely the pursuit of gold, but the systematic transformation of base matter into something of profound and enduring value through the application of knowledge, discipline, and will. The **Alchemical Agent Ecosystem** applies this same principle to intelligence itself: raw data enters as *prima materia*, passes through a sovereign network of specialized AI agents bound together in dynamically self-forming **Alchemical Circles**, and emerges as coherent action, durable memory, and traceable decision — all orchestrated entirely on your own hardware, across seven named execution services, with zero dependency on paid APIs or external clouds. At the center stands the **Alchemical Gateway**, a FastAPI-powered philosopher's stone that mediates between intent and execution through a LangGraph-style stateful orchestration engine, backed by a three-tier hierarchical memory system spanning Redis, ChromaDB, and LLM-generated summaries. The **Agent Node Studio** makes the Great Work visible in real time — a Next.js 15 visual workflow builder where you watch intelligence transmute, step by step, token by token, streamed over SSE to a dashboard that feels less like a dev tool and more like a command room for a new kind of operation. This is local sovereignty in the age of dependent intelligence: a production-grade operating system for autonomous thought, version 2.0, **Magnum Opus**.

---

## 🚀 Quickstart — The 5-Minute Ritual

> **Prerequisites:** Docker 24+, Docker Compose v2, Git, `jq` (optional but recommended), 16 GB RAM minimum, 20 GB disk.

```bash
# Clone the grimoire
git clone https://github.com/smouj/alchemical-agent-ecosystem.git
cd alchemical-agent-ecosystem

# Perform the installation ritual
# (pulls models, generates .env, validates stack — interactive wizard)
./install.sh --wizard

# Awaken the ecosystem
./scripts/alchemical up-fast

# Verify the transmutation
curl -fsS http://localhost/gateway/health | jq .
```

Expected response from the health oracle:

```json
{
  "status": "transmuting",
  "version": "2.0.0-magnum-opus",
  "services": 7,
  "llm_engine": "ollama:ready",
  "memory": { "redis": "ok", "chroma": "ok", "postgres": "ok" },
  "circles_active": 0
}
```

### Runtime Endpoints

| Endpoint | Purpose |
|---|---|
| `http://localhost:3000` | Agent Node Studio (Dashboard) |
| `http://localhost/gateway` | Alchemical Gateway API |
| `http://localhost/gateway/health` | System health oracle |
| `http://localhost/gateway/docs` | Interactive OpenAPI grimoire |
| `http://localhost:11434` | Ollama LLM Engine |
| `http://localhost:6006` | OpenTelemetry Dashboard (Jaeger) |
| `http://localhost:9090` | Prometheus metrics forge |

---

## 🌌 Architecture — The Seven Circles

The ecosystem is structured as concentric layers of responsibility, each feeding the next in a closed loop of perception, reasoning, and action.

```mermaid
graph TB
    subgraph EDGE["🌐 Edge Layer"]
        CADDY["Caddy Reverse Proxy\n(TLS termination · routing · rate limits)"]
    end

    subgraph CTRL["🖥️ Control Plane"]
        OP["Human Operator"]
        DASH["Agent Node Studio\n(Next.js 15 · React 19 · App Router)"]
        OP -->|"visual workflow"| DASH
    end

    subgraph ORCH["⚙️ Orchestration Core"]
        GW["Alchemical Gateway\n(FastAPI)"]
        LG["LangGraph Engine\n(stateful orchestration)"]
        PR["Plugin Registry\n(hot-reload skills)"]
        PG["PostgreSQL + pgvector\n(agent registry · embeddings)"]
        GW --> LG
        GW --> PR
        GW <--> PG
    end

    subgraph MEM["💾 Memory Nexus"]
        REDIS["Redis\n(short-term · session)"]
        CHROMA["ChromaDB\n(long-term · semantic)"]
        SUMM["Summary Agents\n(Ollama compression)"]
        REDIS -->|"flush to long-term"| CHROMA
        CHROMA -->|"request summary"| SUMM
    end

    subgraph EXEC["🔮 Execution Circle — The Seven"]
        T["temporaeth:7401\n(temporal reasoning)"]
        R["resonvyr:7402\n(language · rhetoric)"]
        K["kryonexus:7403\n(data · analysis)"]
        N["noctumbra-mail:7404\n(comms · notifications)"]
        F["fluxenrath:7405\n(web · retrieval)"]
        AU["auralith:7406\n(audio · speech)"]
        SY["synapsara:7407\n(meta-reasoning · coordination)"]
    end

    subgraph LLM["🤖 LLM Layer"]
        OLLAMA["Ollama Engine"]
        LLAVA["LLaVA\n(vision)"]
        WHISPER["Whisper\n(speech)"]
        BASE["Base models\n(Mistral · Llama · Phi)"]
        OLLAMA --> LLAVA & WHISPER & BASE
    end

    subgraph TELEM["📊 Telemetry"]
        OTEL["OpenTelemetry Collector"]
        JAEGER["Jaeger\n(distributed traces)"]
        PROM["Prometheus\n(metrics)"]
        OTEL --> JAEGER & PROM
    end

    subgraph CONN["📡 Connectors"]
        TG["Telegram Bot"]
        DC["Discord Bot"]
        WH["REST Webhooks"]
    end

    CADDY --> DASH & GW
    DASH <-->|"REST · SSE"| GW
    LG -->|"dispatch"| EXEC
    EXEC <-->|"inference"| OLLAMA
    EXEC <-->|"read/write"| MEM
    GW -->|"traces · spans"| OTEL
    CONN --> GW
```

### Workflow Execution Flow

```mermaid
sequenceDiagram
    actor U as User / Connector
    participant GW as Gateway
    participant AUTH as Auth + Policy
    participant REG as Agent Registry
    participant ORCH as LangGraph Orchestrator
    participant CIRC as Alchemical Circle
    participant MEM as Memory Nexus
    participant SSE as SSE Stream

    U->>GW: POST /v1/invoke {task, context}
    GW->>AUTH: Validate API key + RBAC policy
    AUTH-->>GW: authorized: true, roles: [...]
    GW->>REG: Lookup capable agents (pgvector similarity)
    REG-->>GW: agent_candidates[]
    GW->>ORCH: Initialize stateful graph
    ORCH->>CIRC: Form circle (Prima Materia · Catalyst · Refiner · Scribe)
    CIRC-->>ORCH: circle_id, agents_bound
    ORCH->>CIRC: Parallel dispatch tasks
    CIRC-->>MEM: Read episodic context (ChromaDB)
    CIRC-->>ORCH: Intermediate results (streaming)
    ORCH-->>SSE: Emit step events
    SSE-->>U: real-time tokens + trace spans
    ORCH->>MEM: Persist session state (Redis → ChromaDB)
    ORCH-->>GW: Final response
    GW-->>U: 200 OK {result, circle_id, trace_id}
```

---

## ✨ Capabilities Matrix

| Feature | Status | Description |
|---|:---:|---|
| Visual Workflow Builder (Agent Node Studio) | ✅ | Drag-and-drop node canvas built on React Flow; build, test, and deploy agent pipelines visually |
| Alchemical Circles (Auto-forming agent teams) | ✅ | Orchestrator dynamically selects and binds agents into named circles for complex multi-step tasks |
| LangGraph Stateful Orchestration | ✅ | Full LangGraph-style directed graph execution with checkpointing, branching, and resumable workflows |
| Hierarchical Memory (Redis + Chroma + Summary) | ✅ | Three-tier memory: session-hot in Redis, semantic long-term in ChromaDB, compressed summaries via LLM |
| Plugin Marketplace (Skills hot-reload) | ✅ | Python packages as skills; install, enable, or swap tools without restarting any service |
| Multi-modal Vision (LLaVA) | ✅ | Image understanding and analysis via locally-run LLaVA — zero image data leaves your machine |
| Speech Recognition (Whisper local) | ✅ | Audio transcription and command intake via local Whisper model, fully offline |
| Real-time SSE Observability | ✅ | Every token, every step, every trace pushed over Server-Sent Events to dashboard and API consumers |
| RBAC + API Key Security | ✅ | Role-based access control with fine-grained policy enforcement and rotating API key management |
| Telegram / Discord Connectors | ✅ | Production-ready bots that pipe conversations directly into the agent orchestration pipeline |
| OpenTelemetry + Distributed Tracing | ✅ | Full W3C trace propagation across all seven execution services, collected into Jaeger + Prometheus |
| PostgreSQL + pgvector | ✅ | Agent registry, workflow persistence, and high-dimensional vector similarity search in one engine |
| Auto-evolving Agent Prompts | 🧪 | Experimental: agents that refine their own system prompts based on observed success metrics |
| Grimoire Export / Import | 🧪 | Serialize entire workflows, agent configs, and memory snapshots to portable JSON grimoires |
| CrewAI / LangGraph Compatibility Layer | 🧪 | Import existing CrewAI or LangGraph agent definitions with minimal adaptation |
| MkDocs Alchemical Documentation | ✅ | Full documentation site built with MkDocs Material; dark theme, full-text search, versioned |
| PWA + Mobile-first Dashboard | ✅ | Agent Node Studio installable as a Progressive Web App; fully responsive on tablet and phone |
| Onboarding Wizard | ✅ | Interactive `./install.sh --wizard` guides first-time setup: model selection, env generation, smoke tests |

---

## 🧠 The Agent Model

Every entity in the ecosystem exists at two distinct layers: a **logical agent** (registered in the Gateway's PostgreSQL registry and resolved via pgvector capability matching) and an **execution context** (materialized on one of the seven named execution services at invocation time). This separation allows the registry to be the immutable source of truth for identity, capability declarations, and memory configuration, while execution services remain stateless and independently scalable.

### Logical Agent Schema

```json
{
  "id": "agt_7f3a9c2e",
  "name": "AuralScribe",
  "role": "Transcription Specialist",
  "model": "whisper:large-v3",
  "target_service": "auralith",
  "target_port": 7406,
  "skills": [
    "whisper_transcription",
    "audio_chunker",
    "language_detector"
  ],
  "tools": [
    "file_reader",
    "http_fetch",
    "chroma_search"
  ],
  "circle_membership": [
    "media-analysis-circle",
    "accessibility-circle"
  ],
  "memory_config": {
    "short_term_ttl": 3600,
    "long_term_collection": "aural_scribe_episodes",
    "summary_trigger_tokens": 4096,
    "summary_model": "mistral:7b"
  },
  "created_at": "2025-11-14T00:00:00Z",
  "version": "2.0.0"
}
```

Agents are created, versioned, and introspected entirely through the Gateway API or the Agent Node Studio GUI. The `circle_membership` field declares which circles the agent is eligible to join; actual membership is determined dynamically by the orchestrator at task time based on capability vectors stored in pgvector. The `memory_config` block gives each agent a fully independent memory profile — different TTLs, different collections, different summarization thresholds.

---

## 🔮 Alchemical Circles

A **Circle** is the fundamental unit of collaborative intelligence in this ecosystem. When a task arrives that exceeds the capability of any single agent, the LangGraph orchestrator performs a **circle formation ritual**: it queries the agent registry using semantic similarity (pgvector), selects the best-fit agents for each required specialization, and binds them into a named, stateful working group for the lifetime of that task.

Every circle follows the classical four-role structure:

| Role | Function |
|---|---|
| **Prima Materia** | Receives the raw task; performs initial decomposition and framing |
| **Catalyst** | Injects external knowledge (web retrieval, memory search, tool calls) |
| **Refiner** | Synthesizes intermediate outputs, resolves conflicts, maintains coherence |
| **Scribe** | Records the process, writes the final output, updates all memory layers |

### Example: Market Research Circle

**Task:** `"Produce a competitive analysis of open-source vector databases as of Q4 2025"`

```
Circle ID:  circle_mkt_research_a3f8
Formed:     2025-11-14T09:12:03Z

● Prima Materia  →  temporaeth:7401  (task decomposition, sub-question extraction)
● Catalyst       →  fluxenrath:7405  (web retrieval, document ingestion)
● Refiner        →  resonvyr:7402    (synthesis, comparative framing, language polish)
● Scribe         →  kryonexus:7403   (data structuring, table generation, memory write)

Workflow steps:
  1. temporaeth   decomposes task → 6 sub-queries
  2. fluxenrath   fetches 14 sources in parallel
  3. kryonexus    structures raw data into comparison schema
  4. resonvyr     synthesizes narrative + rankings
  5. kryonexus    persists findings to ChromaDB episode store
  6. resonvyr     delivers final markdown report via Scribe output

Duration: 47s  |  Tokens: 22,840  |  Memory writes: 6  |  Trace: otel_span_9f2a
```

Circles are ephemeral by default but can be **persisted** as named templates for reuse — these become reusable **transmutation recipes** in the Agent Node Studio workflow library.

---

## 💾 Memory Architecture

Intelligence without memory is a candle that resets to dark after every conversation. The Alchemical Memory Architecture ensures that every interaction, insight, and decision accumulates into a growing substrate of knowledge — layered, searchable, and self-compressing — without a single byte crossing a network boundary you do not own.

| Layer | Store | TTL | Purpose |
|---|---|---|---|
| **Short-term** | Redis | Session (default: 1h, configurable) | Active context window, in-flight state, tool call buffers, hot circle state |
| **Episodic (Long-term)** | ChromaDB | Forever (configurable eviction policy) | Semantic vector search over all past interactions, documents, and agent outputs |
| **Summary** | Ollama (LLM) | On-demand (token threshold trigger) | When session tokens exceed threshold, a summary agent compresses episodic chunks into dense recall nodes |

Memory reads during a workflow are **hierarchical and non-blocking**: the orchestrator first checks Redis for live context (microseconds), then issues a cosine similarity query to ChromaDB for relevant episodes (milliseconds), and optionally triggers a summary agent to synthesize across a long interaction history before passing consolidated context to the active circle.

Memory writes follow a **dual-path pattern**: execution services post to Redis synchronously on the hot path, while a background flush worker asynchronously promotes matured session memories to ChromaDB with embeddings generated locally via Ollama's embedding endpoint. No memory ever leaves the machine. No embedding API is ever called.

---

## 🧩 Plugin System

Skills are the vocabulary of your agents — and in the Alchemical Ecosystem, they are **hot-reloadable Python packages** that can be installed, activated, or swapped at runtime without restarting any service. Each skill declares its own dependency set, its exposed tools, and its required permissions, and is loaded into an isolated virtual environment by the Plugin Registry.

### Plugin Directory Structure

```
skills/
├── whisper_transcription/
│   ├── __init__.py          # SkillManifest + entrypoint
│   ├── skill.py             # Core skill implementation
│   ├── requirements.txt     # Isolated dependency set
│   └── manifest.json        # Metadata: name, version, tools[], permissions[]
├── web_surfer/
│   ├── __init__.py
│   ├── skill.py
│   └── manifest.json
└── code_executor/
    ├── __init__.py
    ├── skill.py
    ├── sandbox.py           # Isolated execution environment
    └── manifest.json
```

### Installing a Skill

```bash
# From the official registry
./scripts/alchemical skill install web_surfer

# From a local directory
./scripts/alchemical skill install ./my_custom_skill/

# From a Git repository
./scripts/alchemical skill install git+https://github.com/org/alchemical-skill-example.git

# List all active skills and their status
./scripts/alchemical skill list

# Hot-reload all skills without restarting services
./scripts/alchemical skill reload
```

Skills are sandboxed using isolated Python virtual environments per package, with explicit `permissions[]` declarations in the manifest (e.g., `["filesystem:read", "http:outbound"]`). The Plugin Registry enforces these permissions at the Gateway level — an agent cannot invoke a tool beyond its declared permission scope, and violations are traced and logged.

The **in-dashboard marketplace** (Agent Node Studio → Plugins tab) provides a searchable catalog of community-contributed skills with one-click install, semantic version pinning, changelog display, and full audit logs.

---

## 📡 Connectors

External worlds reach the ecosystem through typed **Connectors** — each one a fully authenticated ingress that maps external message formats into the Gateway's canonical task schema. Every connector normalizes its payload to the standard `InvokeRequest` before it reaches the orchestrator, meaning agents have no awareness of which channel triggered them — enabling seamless cross-connector workflows and unified observability.

| Connector | Status | Notes |
|---|:---:|---|
| **Telegram Bot** | ✅ | Full message + file + voice ingestion; inline agent responses; group and DM support |
| **Discord Bot** | ✅ | Slash commands + message listeners; thread-aware context; role-based permissions |
| **REST Webhooks** | ✅ | Generic inbound POST endpoint; configurable topic routing; HMAC signature verification |
| **Email (noctumbra-mail)** | ✅ | IMAP/SMTP bridge via the `noctumbra-mail:7404` execution service |
| **Slack** | 🔜 | Planned for v2.1 — community PRs welcome |
| **Matrix / Element** | 🔜 | E2E-encrypted channel integration — planned for v2.2 |
| **WhatsApp (Business API)** | 🔜 | In specification — community PRs welcome |

---

## 📊 Comparison

Not all agent frameworks are created equal. Here is an honest, feature-by-feature assessment of the Alchemical Ecosystem v2.0 against the most commonly cited alternatives in the local-AI space.

| Criteria | **Alchemical v2.0** | LangChain (demos) | AutoGen | CrewAI |
|---|:---:|:---:|:---:|:---:|
| **Local-first (no external API required)** | ✅ | ❌ (OpenAI default) | ⚠️ (configurable) | ⚠️ (configurable) |
| **Visual Workflow Builder** | ✅ | ❌ | ❌ | ❌ |
| **Auto-forming Agent Teams** | ✅ | ❌ | ⚠️ (manual) | ✅ |
| **Stateful LangGraph Orchestration** | ✅ | ⚠️ (LCEL only) | ❌ | ❌ |
| **Hot-reloadable Plugin System** | ✅ | ❌ | ❌ | ❌ |
| **Real-time SSE Observability** | ✅ | ❌ | ❌ | ❌ |
| **Hierarchical Memory (3 tiers)** | ✅ | ⚠️ (1-tier) | ⚠️ (1-tier) | ⚠️ (1-tier) |
| **Zero Cost (0 paid APIs)** | ✅ | ❌ | ❌ | ❌ |
| **Production-ready (RBAC, TLS, health checks)** | ✅ | ❌ | ❌ | ⚠️ |
| **Multi-modal (Vision + Audio)** | ✅ | ⚠️ (API-dependent) | ⚠️ | ❌ |
| **OpenTelemetry Distributed Tracing** | ✅ | ❌ | ❌ | ❌ |
| **Single-command full-stack deploy** | ✅ | ❌ | ❌ | ❌ |

> ✅ Fully supported · ⚠️ Partial / requires configuration · ❌ Not supported

---

## 📁 Repository Structure

```
alchemical-agent-ecosystem/
│
├── apps/
│   └── alchemical-dashboard/   # Agent Node Studio (Next.js 15 / React 19)
│       ├── app/                # App Router pages and layouts
│       ├── components/         # UI component library (Radix + Tailwind)
│       ├── hooks/              # Custom React hooks (SSE, agent state, etc.)
│       └── lib/                # API client, type definitions, utils
│
├── gateway/                    # Alchemical Gateway (FastAPI)
│   ├── api/                    # Route handlers (v1 endpoints)
│   ├── core/                   # LangGraph engine, circle formation, auth
│   ├── memory/                 # Redis, ChromaDB, summary agent adapters
│   ├── models/                 # Pydantic schemas and DB models
│   └── plugins/                # Plugin registry and loader
│
├── services/                   # The Seven Execution Services
│   ├── temporaeth/             # Port 7401 — temporal reasoning
│   ├── resonvyr/               # Port 7402 — language and rhetoric
│   ├── kryonexus/              # Port 7403 — data and analysis
│   ├── noctumbra-mail/         # Port 7404 — comms and notifications
│   ├── fluxenrath/             # Port 7405 — web and retrieval
│   ├── auralith/               # Port 7406 — audio and speech
│   └── synapsara/              # Port 7407 — meta-reasoning and coordination
│
├── skills/                     # Hot-reloadable skill packages
│   ├── web_surfer/
│   ├── whisper_transcription/
│   ├── code_executor/
│   └── [community skills...]
│
├── connectors/                 # External ingress adapters
│   ├── telegram/
│   ├── discord/
│   └── webhooks/
│
├── infra/                      # Infrastructure as code
│   ├── docker/                 # Per-service Dockerfiles
│   ├── compose/                # docker-compose files (dev, prod, test)
│   ├── caddy/                  # Caddyfile (reverse proxy + TLS)
│   └── otel/                   # OpenTelemetry Collector config
│
├── docs/                       # MkDocs Material documentation source
│   ├── getting-started/
│   ├── architecture/
│   ├── api-reference/
│   └── grimoire/               # Workflow recipes and tutorials
│
├── ops/                        # Safe operations + project hygiene scripts
│
├── scripts/
│   └── alchemical              # Main CLI (up, down, backup, restore, skill, etc.)
│
├── shared/                     # Shared types, utilities, constants
│
├── tests/                      # Test suites (unit, integration, e2e)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── assets/                     # Branding and static assets
│   └── branding/
│       └── variants/
│           └── logo-horizontal-v2.svg
│
├── workspace/                  # Runtime workspace (grimoires, exports)
├── .env.example                # Annotated environment template
├── install.sh                  # Interactive setup wizard
├── docker-compose.yml          # Production compose entrypoint
└── mkdocs.yml                  # Documentation site config
```

---

## 📚 The Grimoire — Documentation

Full documentation is available at the **Alchemical Documentation Portal**, built with MkDocs Material (dark theme, full-text search, versioned, mobile-ready).

```bash
# Serve the docs locally
./scripts/alchemical docs serve
# → http://localhost:8000
```

| Document | Description |
|---|---|
| [Getting Started](./docs/getting-started/installation.md) | Installation wizard walkthrough, prerequisites, first run |
| [Architecture Deep Dive](./docs/architecture/overview.md) | Complete system architecture, data flows, design decisions |
| [Agent Model Reference](./docs/architecture/agents.md) | Full agent schema reference, lifecycle, versioning |
| [Alchemical Circles](./docs/architecture/circles.md) | Circle formation algorithm, role assignment, lifecycle management |
| [Memory Architecture](./docs/architecture/memory.md) | Three-tier memory system internals, eviction policies, tuning |
| [Plugin Development Guide](./docs/plugins/development.md) | How to build, test, and publish skills to the marketplace |
| [Gateway API Reference](./docs/api-reference/gateway.md) | Complete OpenAPI reference for all v1 endpoints |
| [Execution Services](./docs/api-reference/services.md) | Per-service API contracts for all seven services (7401–7407) |
| [Connectors Guide](./docs/connectors/) | Setup guides for Telegram, Discord, and webhook connectors |
| [Security Model](./docs/security/rbac.md) | RBAC roles, API key management, audit logging |
| [Observability Guide](./docs/observability/otel.md) | OpenTelemetry setup, Jaeger traces, Prometheus dashboards |
| [Grimoire Recipes](./docs/grimoire/) | Ready-to-deploy workflow templates for common use cases |
| [Upgrade Guide](./docs/operations/upgrading.md) | Zero-downtime upgrade procedures and migration scripts |
| [CLI Reference](./docs/operations/cli.md) | Full reference for the `alchemical` CLI |
| [Contributing](./CONTRIBUTING.md) | Development setup, PR conventions, code style guide |

---

## 🔄 The Daily Ritual — Operations

The `./scripts/alchemical` CLI is the primary interface to the running ecosystem. It wraps Docker Compose, Alembic, and operational utilities into a single coherent command surface.

### Lifecycle Management

```bash
# Start the full stack (production mode)
./scripts/alchemical up

# Start in fast mode (skip health wait — for development)
./scripts/alchemical up-fast

# Graceful shutdown (preserves in-flight workflows)
./scripts/alchemical down

# Full restart with zero-downtime rolling update
./scripts/alchemical restart --rolling

# Check status of all services
./scripts/alchemical status
```

### Safe Updates

```bash
# Pull latest changes and update safely (zero-downtime)
./scripts/alchemical update-safe

# What update-safe does internally:
#   1. git pull --ff-only
#   2. Back up PostgreSQL + ChromaDB state
#   3. Run Alembic migration scripts
#   4. Perform rolling service restart
#   5. Run smoke tests against health endpoints
#   6. Automatically roll back on any failure
```

### Backup & Restore

```bash
# Full system backup (PostgreSQL + ChromaDB + Redis snapshot + configs)
./scripts/alchemical backup --output ./backups/$(date +%F).tar.gz

# Restore from a backup archive
./scripts/alchemical restore --from ./backups/2025-11-14.tar.gz

# Backup only the agent registry (PostgreSQL)
./scripts/alchemical backup --component=postgres

# Backup only long-term memory (ChromaDB)
./scripts/alchemical backup --component=chroma
```

### Logs & Debugging

```bash
# Tail logs for all services
./scripts/alchemical logs --follow

# Tail logs for a specific execution service
./scripts/alchemical logs --service=resonvyr --follow

# Tail logs for the gateway only
./scripts/alchemical logs --service=gateway --follow

# Export full distributed trace for a specific circle run
./scripts/alchemical trace --circle-id=circle_mkt_research_a3f8
```

### Database Migrations

```bash
# Run pending Alembic migrations
./scripts/alchemical migrate up

# Rollback the last migration
./scripts/alchemical migrate down --steps=1

# Show full migration history
./scripts/alchemical migrate history
```

---

## 🏆 Why Magnum Opus?

### Local Sovereignty in the Age of Dependent Intelligence

The dominant narrative of AI in 2025 asks you to rent intelligence — to submit your data, your prompts, your workflows, and your users' trust to remote APIs whose terms of service can change overnight, whose costs scale without warning, and whose architectures are fundamentally opaque to inspection or audit. The Alchemical Ecosystem was built on a different premise: that intelligence, like any serious operational capability, must be *owned*. Every model weight, every vector embedding, every logged trace, and every generated token lives on your hardware, subject only to your policies, visible only to your eyes. This is not a philosophical position for its own sake — it is an engineering prerequisite for building systems that are auditable, reproducible, cost-predictable, GDPR-compliant, and genuinely reliable at any scale.

### Alchemy as a Genuine Design Principle

The alchemical metaphor is not decorative — it is the actual design principle of this system. In classical alchemy, the *Magnum Opus* proceeds through defined stages: *nigredo* (dissolution of the raw), *albedo* (purification), *citrinitas* (illumination), and *rubedo* (completion and integration into the world). In this ecosystem, every task follows the same arc: raw input is dissolved by the Prima Materia agent, purified through Catalyst retrieval and Refiner synthesis, illuminated by memory and accumulated context, and completed by the Scribe into durable output that feeds future cycles. The seven execution services are not named arbitrarily — each name encodes a character and a mode of engaging with information. **Temporaeth** thinks in time. **Resonvyr** thinks in language. **Kryonexus** thinks in structure. **Auralith** thinks in sound. **Fluxenrath** moves through the web. **Noctumbra** carries messages in the dark. **Synapsara** reflects on the whole. These are not microservices; they are *minds*, and the circles they form are the collaborative intelligence your tasks deserve.

### The Commitment to Open-Source Excellence

Version 2.0 — *Magnum Opus* — represents the culmination of a design philosophy that refuses to treat open-source as a demo tier for a paid product. Every feature in this system is complete, tested, documented, and deployable in production today. The visual workflow builder is not a prototype. The memory system is not a toy. The RBAC and security model is not an afterthought bolted on at the end. The bar is set against the best commercial AI orchestration platforms — not against what is convenient to ship, and not against what is merely novel enough to generate a GitHub star. If a feature is experimental, it is marked `🧪` and scoped clearly. If it is marked `✅`, it is ready. This is what it means to forge intelligence rather than fetch it.

---

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/smouj/alchemical-agent-ecosystem?style=for-the-badge&color=4B0082&labelColor=1a1a2e" alt="License"/></a>
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/contributions-welcome-00FFAA?style=for-the-badge&labelColor=1a1a2e" alt="Contributions Welcome"/></a>
</p>

<p align="center">
  <em>Forged with ⚗️ and 🖤 by the Alchemical community.</em>
</p>

<p align="center">
  <sub>
    The Magnum Opus of local-first AI orchestration.<br/>
    <strong>Where Intelligence is Forged, Not Fetched.</strong>
  </sub>
</p>
