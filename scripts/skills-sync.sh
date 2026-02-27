#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

git submodule sync --recursive
git submodule update --init --remote --recursive

echo "[OK] Skills synced to latest remote refs."
