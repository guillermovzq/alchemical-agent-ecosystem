#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/smouj/alchemical-agent-ecosystem.git"
TARGET_DIR="${1:-alchemical-agent-ecosystem}"

if [[ -d "$TARGET_DIR/.git" ]]; then
  echo "[info] Existing repo found: $TARGET_DIR"
  cd "$TARGET_DIR"
  git pull --rebase origin main
else
  git clone "$REPO_URL" "$TARGET_DIR"
  cd "$TARGET_DIR"
fi

chmod +x install.sh
./install.sh --wizard
