#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== Submodule summary =="
git submodule status --recursive

echo
echo "== Per-skill git status =="
while read -r _ path _; do
  [ -z "$path" ] && continue
  echo "--- $path ---"
  git -C "$path" status --short || true
  git -C "$path" log --oneline -1 || true
done < <(git submodule status --recursive)
