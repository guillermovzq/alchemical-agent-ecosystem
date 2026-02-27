# Go-Beta Checklist (Alchemical Agent Ecosystem)

Use this checklist before declaring a public beta.

## 1) Repository hygiene
- [ ] `main` protected (no direct push)
- [ ] Required status checks enabled (CI backend/frontend)
- [ ] Signed commits recommended for maintainers
- [ ] CODEOWNERS configured

## 2) Documentation quality
- [ ] README.md and README.es.md synchronized (structure + key content)
- [ ] API reference updated (`docs/API_REFERENCE.md`)
- [ ] Operations runbook updated (`docs/OPERATIONS_RUNBOOK.md`)
- [ ] Branding usage documented (`docs/BRANDING.md`)

## 3) Security baseline
- [ ] Gateway token configured (`ALCHEMICAL_GATEWAY_TOKEN`)
- [ ] API keys managed and reviewed (`/gateway/auth/keys`)
- [ ] Secrets scan passing (`./scripts/alchemical scan-secrets`)
- [ ] Pre-commit hooks enabled (`./scripts/alchemical setup-hooks`)

## 4) Runtime reliability
- [ ] `update-safe` tested end-to-end
- [ ] `rollback` tested end-to-end
- [ ] Smoke checks passing (`/gateway/health`, key services health)
- [ ] Queue retry behavior validated (`/gateway/jobs`)

## 5) Product behavior
- [ ] Dashboard loads without errors
- [ ] SSE chat stream stable
- [ ] SSE logs stream stable
- [ ] Dispatch path validated with at least 3 logical agents

## 6) Observability
- [ ] Events feed checked (`/gateway/events`)
- [ ] Realtime events stream checked (`/gateway/events/stream`)
- [ ] Metrics endpoint behavior documented

## 7) Project governance
- [ ] GitHub Project populated with active issues
- [ ] Priorities (P0-P3) assigned
- [ ] Areas assigned (Gateway/Dashboard/DevOps/Docs/Security/Connectors)
- [ ] Target release set for each active issue

## 8) Release readiness
- [ ] CI green on main
- [ ] release workflow validated on tag
- [ ] version bump + release notes drafted

---

## Command bundle (quick verification)

```bash
./scripts/alchemical doctor
./scripts/alchemical scan-secrets
python3 -m py_compile gateway/app.py
cd apps/alchemical-dashboard && npm run build && cd -
curl -fsS http://localhost/gateway/health
curl -fsS http://localhost/gateway/ready
curl -fsS http://localhost/velktharion/health
```
