# Tech

- Backend: Python 3.11+, FastAPI, Pydantic, httpx, SQLite. Tests: `tests/test_gateway_api.py` (pytest, ~35 casos).
- Frontend: Next.js 15, React 19, Tailwind 4, Radix UI, framer-motion 12, zustand 5, @xyflow/react. Scripts: `dev`, `build`, `lint`, `typecheck`.
- Infra: Docker Compose, Caddy, Redis 7, ChromaDB.
- LLM: KiloCode AI Gateway (`KILO_API_KEY`, `KILO_DEFAULT_MODEL`, `KILO_BASE_URL`); opcional OpenAI/Anthropic/Google/Ollama/OpenClaw.
- Env clave: `ALCHEMICAL_GATEWAY_TOKEN`, `REDIS_PASSWORD`, `GATEWAY_SECRET`, `GATEWAY_DB_PATH`.
