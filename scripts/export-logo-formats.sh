#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/assets/branding"

# Try local tools first
if command -v rsvg-convert >/dev/null 2>&1; then
  rsvg-convert -w 1024 -h 1024 variants/logo-master.svg -o logo-1024.png
  rsvg-convert -w 512 -h 512 variants/logo-mark.svg -o logo-512.png
  rsvg-convert -w 256 -h 256 variants/logo-mark.svg -o logo-256.png
  rsvg-convert -w 128 -h 128 variants/logo-mark.svg -o logo-128.png
  rsvg-convert -w 1600 -h 520 variants/logo-horizontal.svg -o logo-horizontal.png
else
  echo "[warn] rsvg-convert not found. Skipping PNG generation."
fi

if command -v cwebp >/dev/null 2>&1; then
  [[ -f logo-1024.png ]] && cwebp -q 95 logo-1024.png -o logo-1024.webp >/dev/null
  [[ -f logo-horizontal.png ]] && cwebp -q 95 logo-horizontal.png -o logo-horizontal.webp >/dev/null
else
  echo "[warn] cwebp not found. Skipping WEBP generation."
fi

if command -v convert >/dev/null 2>&1; then
  [[ -f logo-256.png ]] && [[ -f logo-128.png ]] && convert logo-256.png logo-128.png favicon.ico
else
  echo "[warn] ImageMagick convert not found. Skipping ICO generation."
fi

echo "Done. Available files:"
ls -1 .
