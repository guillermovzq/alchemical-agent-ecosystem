#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

PATTERN='(github_pat_[A-Za-z0-9_]+|ghp_[A-Za-z0-9]+|AKIA[0-9A-Z]{16}|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|xox[baprs]-[A-Za-z0-9-]+|AIza[0-9A-Za-z\-_]{35})'

TARGETS=$(git ls-files)

if [[ -z "$TARGETS" ]]; then
  echo "No tracked files to scan."
  exit 0
fi

set +e
MATCHES=$(echo "$TARGETS" | xargs -r rg -n -S -e "$PATTERN" 2>/dev/null)
STATUS=$?
set -e

if [[ $STATUS -eq 0 && -n "$MATCHES" ]]; then
  echo "❌ Potential secret(s) detected in tracked files:"
  echo "$MATCHES"
  echo
  echo "Action: remove/rotate secret and rewrite history if already committed."
  exit 1
fi

echo "✅ Secret scan passed (tracked files)."
