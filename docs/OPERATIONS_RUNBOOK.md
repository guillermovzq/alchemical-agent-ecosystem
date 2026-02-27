# Operations Runbook

Canonical day-2 operations for local/prod-like environments.

---

## 1) Daily health ritual

```bash
./scripts/alchemical doctor
./scripts/alchemical status
curl -fsS http://localhost/gateway/health
curl -fsS http://localhost/gateway/ready
```

Optional deeper checks:

```bash
curl -fsS http://localhost/gateway/events | jq '.count'
curl -fsS http://localhost/gateway/usage/summary | jq '.summary'
```

---

## 2) Safe update (recommended)

```bash
./scripts/alchemical update-safe
```

`update-safe` covers:
1. lock (avoid concurrent updates)
2. fetch/rebase
3. secret scan + checks
4. deploy (`docker compose up -d --build`)
5. smoke tests

---

## 3) Fast update

```bash
./scripts/alchemical update
```

Use only when you explicitly accept lower safety guardrails.

---

## 4) Rollback

```bash
./scripts/alchemical rollback
```

After rollback, rerun health checks and validate chat/dispatch paths.

---

## 5) Logs and incident triage

```bash
./scripts/alchemical logs alchemical-gateway
./scripts/alchemical logs velktharion
./scripts/alchemical logs synapsara
```

Incident workflow:
1. confirm failing endpoint,
2. inspect gateway + target service logs,
3. verify auth/token/role context,
4. apply minimal fix,
5. revalidate health and dispatch.

---

## 6) Security controls

```bash
./scripts/alchemical scan-secrets
```

Security notes:
- Gateway token from `.env` (`ALCHEMICAL_GATEWAY_TOKEN`)
- Optional inbound webhook secrets:
  - `ALCHEMICAL_TELEGRAM_WEBHOOK_SECRET`
  - `ALCHEMICAL_DISCORD_WEBHOOK_SECRET`
- Never store raw connector secrets; use `token_ref` metadata.

---

## 7) GitHub project/issues synchronization

```bash
# full maintenance cycle
bash ops/project-maintenance.sh

# safe sync only (default, no auto-seed)
bash ops/sync-project-with-repo.sh

# explicit seed only when requested
bash ops/sync-project-with-repo.sh seed

# cleanup duplicate/closed noise + relink open issues
bash ops/project-tidy.sh

# one-command hygiene ritual
bash ops/ritual-sync.sh
```

If `gh project` returns 401:

```bash
unset GITHUB_TOKEN GH_TOKEN || true
gh auth switch -u smouj
gh auth refresh -s project
```

---

## 8) Production-ready preflight checklist

Before deploying critical changes:
- [ ] `git status` clean
- [ ] secret scan passed
- [ ] dashboard build passed
- [ ] gateway syntax checks passed
- [ ] rollback path verified
- [ ] post-deploy health checks scripted

After deployment:
- [ ] `/gateway/health` OK
- [ ] `/gateway/ready` OK
- [ ] agent list loads real logical agents
- [ ] chat ask/roundtable functional
- [ ] project snapshot synced
