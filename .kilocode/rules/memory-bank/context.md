# Context

Última actualización: 2026-10-05 (ingesta inicial del repo).

## Estado
Último cambio de código: filtrado de mensajes de conectores por contacto/self-chat y lista de pendientes (#2). Antes: estabilización v2.0, simplificación 15→5 servicios, persistencia SQLite, script de despliegue VPS.

## Desajustes conocidos
1. README habla de 10 servicios, Postgres y `install.sh --wizard`; la realidad son 5 servicios y SQLite. `.env.example` no coincide con el README.
2. No hay `.github/workflows/ci.yml` en la raíz (los badges lo asumen).
3. `app.py` y `agents_router.py` duplican helpers y rutas `/agents`.
4. Artefactos versionados: zip en `app/api/logs/`, `tsconfig.tsbuildinfo`.
5. `package.json` raíz se llama `nextjs-template`.
6. Defaults débiles: `REDIS_PASSWORD=alchemical`, `GATEWAY_SECRET` vacío.
7. `AGENTS.md` cita `.kilocode/recipes/add-database.md`, que no existe.
