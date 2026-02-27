#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [[ ! -f infra/scripts/install.sh ]]; then
  echo "[error] infra/scripts/install.sh not found"
  exit 1
fi

echo "✨ Alchemical one-command installer"
exec bash infra/scripts/install.sh "$@"
