#!/usr/bin/env bash
set -euo pipefail

OWNER="@me"
PROJECT_NUMBER="5"
REPO="smouj/alchemical-agent-ecosystem"

echo "[1/4] Sync project with open issues"
bash ops/sync-project-with-repo.sh

echo "[2/4] Print quick project summary"
gh project view "$PROJECT_NUMBER" --owner "$OWNER"

echo "[3/4] Print top open issues"
gh issue list --repo "$REPO" --state open --limit 20

echo "[4/4] Done"
