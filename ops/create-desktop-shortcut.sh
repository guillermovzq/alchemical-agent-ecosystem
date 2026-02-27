#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DESKTOP_DIR="${HOME}/Desktop"
FILE="${DESKTOP_DIR}/Alchemical-Gateway.desktop"
ICON="${APP_DIR}/assets/branding/variants/logo-horizontal.svg"

mkdir -p "$DESKTOP_DIR"
cat > "$FILE" <<EOF
[Desktop Entry]
Name=Alchemical Gateway
Comment=Launch Alchemical dashboard and gateway locally
Exec=bash -lc 'cd "${APP_DIR}" && ./scripts/alchemical up-fast && ./scripts/alchemical dashboard'
Terminal=true
Type=Application
Icon=${ICON}
Categories=Development;
EOF
chmod +x "$FILE"

echo "Desktop shortcut created: $FILE"
