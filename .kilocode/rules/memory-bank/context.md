# Active Context: Alchemical Agent Ecosystem Dashboard

## Current State

**Project Status**: ✅ Alchemical Ecosystem v3 — Arquitectura Simplificada

El proyecto ha sido transformado de un template básico de Next.js a un **Dashboard de Orquestación Multi-Agente** épico con tema alquímico oscuro premium. **Infraestructura simplificada radicalmente**: de 15 a 5 servicios.

### 🌐 Estado de Despliegue (2026-03-01)
- **VPS Hostinger**: Ubuntu 24.04, IP `76.13.37.123`
- **Dashboard**: ✅ Operativo en http://76.13.37.123:8080 (Next.js 16)
- **Gateway API**: ✅ Operativo en http://76.13.37.123:7411 (FastAPI + SQLite)
- **Servicios de Infraestructura**:
  - Redis: ✅ Healthy (puerto 6379)
  - ChromaDB: ✅ Healthy (puerto 8000)
- **Docker Compose**: 5 servicios activos (v3 simplificado)

### 🏛️ Arquitectura v3 (Marzo 2026)

**Simplificación radical**: Eliminados 10 microservicios stubs de agentes.

```
┌─────────────────┐
│  Caddy Proxy    │ ← Única entrada HTTP (:80/:443)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐  ┌──▼────────┐
│Gateway│  │ Dashboard │
│:7411  │  │ :3000     │
└───┬───┘  └───────────┘
    │
    ├──── Redis (:6379)
    └──── ChromaDB (:8000)
```

**Servicios activos (5)**:
| Servicio | Puerto | Función |
|----------|--------|---------|
| `caddy` | 80/443 | Reverse proxy TLS |
| `redis` | 6379 | Cache, pub/sub, colas |
| `chromadb` | 8000 | Vector store embeddings |
| `alchemical-gateway` | 7411 | API principal + orquestador |
| `alchemical-dashboard` | 8080 | UI Next.js |

**Eliminados (10 stubs)**:
- velktharion, synapsara, kryonexus (no hacían nada útil)
- noctumbra-mail, temporaeth, vaeloryn-conclave
- ignivox, auralith, resonvyr, fluxenrath

**Motivo**: Eran stubs vacíos. Los agentes ahora se gestionan dinámicamente vía SQLite en el gateway (CRUD completo).

### ✅ Fixes Aplicados Hoy (2026-03-02)
- **fix(dashboard-gateway)**: Corrección de conexión Dashboard ↔ Gateway
  - Corregido GATEWAY_URL de `http://localhost/gateway` a `http://alchemical-gateway:7411`
  - Cambiado endpoint de `/agents` a `/api/v1/agents` en API routes
  - Actualizados archivos: `app/api/agents/route.ts`, `app/api/gateway/agents/route.ts`
- **feat(dashboard)**: Integración de CreateAgentWizard en vista de agentes
  - Agregado botón "Nuevo Agente" con toggle para mostrar/ocultar wizard
  - Importado componente CreateAgentWizard en page.tsx
- **deploy(vps)**: Deploy exitoso a VPS Hostinger
  - Commit `9f8d790` pushed a `main`
  - Reconstrucción de imágenes Docker en VPS
  - 4 servicios activos y saludables

## Recently Completed

### Alchemical Dashboard Implementation
- [x] Layout de 4 zonas colapsables (Grimorio, Studio, Panel Contextual, Consola)
- [x] Tema visual "Magnum Opus": negro profundo #0A0A0A + oro alquímico #FFD700 + fuego naranja #FF4D00
- [x] Agent Node Studio con React Flow (canvas gigante con zoom/pan perfecto)
- [x] Nodos alquímicos personalizados con glows según rol (Prima Materia, Catalizador, Refinador, etc.)
- [x] Animaciones de transmutación (Nigredo → Albedo → Citrinitas → Rubedo)
- [x] Circle Builder modal con plantillas predefinidas
- [x] Grimorio Sidebar con Círculos, Agentes y Skills
- [x] Panel derecho con tabs: Inspector, Config, Memoria, Telemetría
- [x] Consola de Transmutación con logs en tiempo real
- [x] Zustand store para estado global
- [x] Modo Focus (pantalla completa)
- [x] Onboarding místico con animaciones
- [x] Framer Motion para micro-interacciones

### Maintenance & Fixes
- [x] Sincronización de dependencias: Next.js ^16.1.3, React ^19.2.3, Tailwind ^4.1.17
- [x] Corrección warning ESLint en ChatWorkbench.tsx (línea 88)
- [x] **Mejora de contraste (WCAG AA)**: Corrección de colores en selects, inputs y form elements para legibilidad
  - Fondos oscuros (`#0a0e1a`) con texto claro (`#e8eefb`) en selects/options
  - Estilos globales para form elements en `globals.css`
  - Correcciones en: AgentsTable, ChatWorkbench, LogsMonitor, SettingsPanel

### Fixes Recientes (2026-03-02)
- [x] **Corrección de conexión Dashboard ↔ Gateway**
  - Cambio de `localhost` a `alchemical-gateway:7411` para comunicación inter-contenedor
  - Actualización de endpoints a `/api/v1/agents`
  - Eliminación de 10 stubs de servicios innecesarios (migrados a `services-deprecated/`)
- [x] **Integración de CreateAgentWizard**
  - Panel funcional para crear agentes desde la interfaz del dashboard
  - Toggle con botón "Nuevo Agente" en vista de agentes
- [x] **Deploy en VPS**
  - Git pull y reconstrucción exitosa en `/opt/alchemical`
  - Todos los servicios healthy y operativos

## Current Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout con fonts Cinzel + Inter + JetBrains Mono
│   ├── page.tsx            # Redirect a /dashboard
│   ├── globals.css         # Design System Alquímico completo
│   └── dashboard/
│       └── page.tsx        # Main dashboard con 4 zonas
├── components/
│   ├── layout/
│   │   └── TopBar.tsx      # Top navigation con system status
│   ├── sidebar/
│   │   └── GrimoireSidebar.tsx  # Left panel (Círculos, Agentes, Skills)
│   ├── panels/
│   │   ├── RightPanel.tsx       # Right panel con tabs
│   │   └── AgentInspector.tsx   # Agent detail view
│   ├── studio/
│   │   ├── AgentNodeStudio.tsx  # React Flow canvas principal
│   │   ├── CircleBuilder.tsx    # Modal forjar Círculos
│   │   └── CustomNode.tsx       # Nodos alquímicos personalizados
│   └── console/
│       └── TransmutationConsole.tsx  # Logs en tiempo real
└── lib/
    └── store/
        └── dashboard.ts    # Zustand store completo
```

## Agentes Predefinidos (7)

| Agente | Rol | Codename | Modelo |
|--------|-----|----------|--------|
| Velktharion | Prima Materia | El Arquitecto | llama3.2 |
| Synapsara | Tejedor | La Tejedora | mistral |
| Kryonexus | Centinela | El Guardián | phi3 |
| Pyraxis | Catalizador | El Catalizador | codellama |
| Lumivex | Refinador | El Refinador | gemma2 |
| Archivex | Escriba | El Escriba | llama3.2 |
| Oraclyx | Oráculo | El Oráculo | deepseek-r1 |

## Dependencies Added

- @xyflow/react (React Flow)
- framer-motion (Animaciones)
- zustand (State management)
- lucide-react (Iconos)
- @radix-ui/* (Componentes primitivos)
- clsx, tailwind-merge, class-variance-authority

## Key Features

### 🎨 Design System Alquímico
- Paleta: Void (#0A0A0A), Gold (#FFD700), Fire (#FF4D00), Mystic (#8B5CF6)
- Tipografía: Cinzel (headers), Inter (body), JetBrains Mono (code)
- Sombras: glow-gold, glow-fire, glow-mystic
- Animaciones: transmutation-pulse, energy-flow, forge-ignite

### 🧙 Flujo de Usuario
1. Bienvenida mística con símbolo alquímico animado
2. Grimorio sidebar para gestionar Círculos y Agentes
3. Canvas central para diseñar flujos con drag & drop
4. Panel derecho para inspeccionar y configurar
5. Consola inferior para logs en tiempo real

### ⚗️ Forja de Círculos
- Plantillas: Investigación, Forja de Código, Creación, Oracular
- Selección de roles dinámica
- Animación de transmutación en 4 fases
- Auto-sugerencias de IA

## Session History

| Date | Changes |
|------|---------|
| 2026-03-02 | **fix(dashboard)**: Corrección conexión Dashboard ↔ Gateway + Deploy VPS - GATEWAY_URL corregido, endpoints actualizados a /api/v1/agents, CreateAgentWizard integrado, deploy exitoso en VPS |
| 2026-03-01 | **infra(simplificación)**: Arquitectura v3 - Eliminados 10 microservicios stubs, reducción de 15 a 5 contenedores, docker-compose.yml simplificado, Caddyfile actualizado, services/ → services-deprecated/ |
| 2026-03-01 | **feat(gateway)**: OpenClaw/KiloCode integrations + AI providers system - CRUD agents, 6 AI providers, SQLite persistence, documented endpoints |
| 2026-03-01 | **fix(ui)**: Mejora de contraste WCAG AA en form elements - selects, inputs, options con fondos oscuros y texto legible |
| 2026-03-01 | **chore(deps)**: sincronizar versiones entre raíz y dashboard + fix eslint |
| 2026-02-28 | **BUILD FIX**: Corrección completa de errores TypeScript y build del Dashboard - Tipos React Flow v12, Tailwind v4 CSS, dependencia minimatch, ESLint warnings |
| 2026-02-28 | **BUGFIX**: Corregido error de compilación en `src/app/login/page.tsx` - eliminada importación no utilizada `cookies` de `next/headers` en Client Component |
| 2026-02-27 | Alchemical Dashboard COMPLETED - All components, animations, theming |
| Initial | Template created with base setup |

## Quick Commands

```bash
bun typecheck  # Check TypeScript
bun lint       # Check ESLint
bun dev        # Start dev server (localhost:3000)
```

## Keyboard Shortcuts

- `Ctrl/Cmd + B`: Toggle Grimorio sidebar
- `Ctrl/Cmd + J`: Toggle Consola
- `F11`: Modo Focus
- `Escape`: Cerrar modales
