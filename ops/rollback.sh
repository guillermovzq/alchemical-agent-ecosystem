#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
LAST_GOOD_FILE=".runtime/last-good-commit"
if [[ ! -f "$LAST_GOOD_FILE" ]]; then
  echo "No last-good commit file found: $LAST_GOOD_FILE"
  exit 1
fi
TARGET="$(cat "$LAST_GOOD_FILE")"
if [[ -z "$TARGET" ]]; then
  echo "Invalid last-good commit"
  exit 1
fi

echo "Rolling back to $TARGET"
git fetch origin main || true
git reset --hard "$TARGET"
docker compose up -d --build
curl -fsS http://localhost/gateway/health >/dev/null
curl -fsS http://localhost/velktharion/health >/dev/null
echo "Rollback completed"
