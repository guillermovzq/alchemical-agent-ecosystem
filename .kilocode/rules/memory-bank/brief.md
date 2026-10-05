# Project Brief

**Alchemical Agent Ecosystem v2.0 "Magnum Opus"** — plataforma multi-agente local-first con identidad alquímica.
Inferencia vía KiloCode AI Gateway (`api.kilo.ai`, tier gratuito); los datos permanecen en infraestructura propia.

## Objetivos
- Gateway FastAPI que autentica, enruta, recuerda y orquesta agentes.
- Dashboard Next.js (chat, Agent Node Studio, logs, uso, admin).
- Agentes gestionados dinámicamente (filas en SQLite), sin microservicios por agente.
- Conectores de mensajería (Telegram, Discord, etc.) con cola de jobs.
