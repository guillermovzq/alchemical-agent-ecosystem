#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   GITHUB_TOKEN=xxx scripts/skills-push-all.sh
#   scripts/skills-push-all.sh   (if remotes already authenticated)

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"

while read -r _ path _; do
  [ -z "$path" ] && continue
  repo_name="$(basename "$path")"
  echo "== $repo_name =="

  if git -C "$path" diff --quiet && git -C "$path" diff --cached --quiet; then
    echo "No local changes."
    continue
  fi

  git -C "$path" add .
  if ! git -C "$path" diff --cached --quiet; then
    git -C "$path" commit -m "chore: update skill from alchemical workspace" || true
  fi

  branch="$(git -C "$path" rev-parse --abbrev-ref HEAD)"
  if [ -n "$TOKEN" ]; then
    remote="https://x-access-token:${TOKEN}@github.com/smouj/${repo_name}.git"
    git -C "$path" push "$remote" "$branch"
  else
    git -C "$path" push origin "$branch"
  fi

  echo "Pushed $repo_name ($branch)"
done < <(git submodule status --recursive)

echo "[OK] All changed skills pushed."
