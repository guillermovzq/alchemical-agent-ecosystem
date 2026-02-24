# Operations Runbook

## Daily checks

```bash
./scripts/alchemical doctor
./scripts/alchemical status
curl -fsS http://localhost/gateway/health
curl -fsS http://localhost/velktharion/health
```

## Safe update (recommended)

```bash
./scripts/alchemical update-safe
```

`update-safe` performs:
1. lock (avoid concurrent updates)
2. fetch/rebase
3. secret scan + syntax/build checks
4. deploy (`docker compose up -d --build`)
5. smoke tests

## Fast update

```bash
./scripts/alchemical update
```

## Rollback

```bash
./scripts/alchemical rollback
```

## Log triage

```bash
./scripts/alchemical logs alchemical-gateway
./scripts/alchemical logs velktharion
```

## Security checks

```bash
./scripts/alchemical scan-secrets
```

## Notes

- Gateway token is loaded from `.env` (`ALCHEMICAL_GATEWAY_TOKEN`).
- Optional inbound webhook secrets:
  - `ALCHEMICAL_TELEGRAM_WEBHOOK_SECRET`
  - `ALCHEMICAL_DISCORD_WEBHOOK_SECRET`
- Do not store raw secrets in connector records; use `token_ref` metadata.


## Project synchronization

```bash
bash ops/project-maintenance.sh
```

If `gh project` returns 401, refresh auth/scopes (`project`) and retry.
