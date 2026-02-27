# CLI Reference (Complete)

This document contains the full command catalog. README keeps only essential commands.

## Core lifecycle

```bash
./scripts/alchemical up
./scripts/alchemical up-fast
./scripts/alchemical up-2g
./scripts/alchemical up-4g
./scripts/alchemical up-8g
./scripts/alchemical status
./scripts/alchemical dashboard
./scripts/alchemical open-dashboard
./scripts/alchemical logs <service>
```

## Install & setup

```bash
./install.sh --wizard
./scripts/alchemical install-fast --profile 2g
./scripts/alchemical setup-hooks
./scripts/alchemical doctor
./scripts/alchemical scan-secrets
```

## Update & rollback

```bash
./scripts/alchemical update
./scripts/alchemical update-safe
./scripts/alchemical rollback
```

## Project/roadmap automation

```bash
bash ops/project-maintenance.sh
bash ops/sync-project-with-repo.sh           # safe default: link-only
bash ops/sync-project-with-repo.sh seed      # explicit seed only
bash ops/project-tidy.sh                     # dedupe/cleanup/relink
bash ops/ritual-sync.sh                      # end-to-end hygiene ritual
```

## Notes

- For GitHub project commands, if auth fails with 401:
  ```bash
  unset GITHUB_TOKEN GH_TOKEN || true
  gh auth switch -u smouj
  ```
- Do not put raw secrets in connector records (`token_ref` metadata only).
