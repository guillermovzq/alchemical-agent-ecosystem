#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-smouj/alchemical-agent-ecosystem}"
PROJECT_OWNER="${2:-@me}"
PROJECT_NUMBER="${3:-5}"

echo "[ritual] auth context"
unset GITHUB_TOKEN GH_TOKEN || true
gh auth switch -u smouj >/dev/null

echo "[ritual] project tidy + safe sync"
bash ops/project-tidy.sh

echo "[ritual] refresh docs status"
bash scripts/sync-project-state.sh

echo "[ritual] security scan"
./scripts/alchemical scan-secrets

echo "[ritual] commit status snapshot if changed"
git add docs/PROJECT_STATUS.md || true
if ! git diff --cached --quiet; then
  git commit -m "docs(status): ritual sync snapshot"
else
  echo "no docs status changes"
fi

echo "[ritual] rebase + push"
gh auth setup-git >/dev/null 2>&1 || true
git pull --rebase origin main
git push origin main

echo "[ritual] final"
git status -sb
gh project view "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json --jq '{title:.title,itemCount:.items.totalCount}'
gh issue list --repo "$REPO" --state open --limit 200 --json number,title --jq '{openCount:length}'
