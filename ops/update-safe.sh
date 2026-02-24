#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
mkdir -p .runtime/backups
LOCKFILE=".runtime/update.lock"
LAST_GOOD_FILE=".runtime/last-good-commit"
TS="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR=".runtime/backups/$TS"

if [[ -f "$LOCKFILE" ]]; then
  echo "Update lock exists: $LOCKFILE"
  exit 1
fi
trap 'rm -f "$LOCKFILE"' EXIT

touch "$LOCKFILE"
CURRENT_COMMIT="$(git rev-parse HEAD)"
echo "$CURRENT_COMMIT" > "$LAST_GOOD_FILE"
mkdir -p "$BACKUP_DIR"
cp -a .runtime "$BACKUP_DIR/runtime" 2>/dev/null || true

echo "[1/8] Fetch/pull"
git fetch origin main
git pull --rebase origin main

echo "[2/8] Security scan"
./scripts/alchemical scan-secrets

echo "[3/8] Gateway syntax"
python3 -m py_compile gateway/app.py

echo "[4/8] Dashboard build"
if [[ -d apps/alchemical-dashboard ]]; then
  (cd apps/alchemical-dashboard && npm run build)
fi

echo "[5/8] Deploy"
docker compose up -d --build

echo "[6/8] Smoke checks"
curl -fsS http://localhost/gateway/health >/dev/null
curl -fsS http://localhost/velktharion/health >/dev/null

echo "[7/8] Status"
docker compose ps > "$BACKUP_DIR/compose-ps.txt"

echo "[8/8] Done"
echo "Update-safe completed at $TS"
