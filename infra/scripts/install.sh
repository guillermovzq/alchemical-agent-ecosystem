#!/usr/bin/env bash
set -euo pipefail

DOMAIN="localhost"
PROFILE="4g"
OLLAMA_MODEL="phi3:mini"
NO_PULL=0
WIZARD=0

log(){ printf "\033[1;36m[alchemical]\033[0m %s\n" "$*"; }
warn(){ printf "\033[1;33m[warn]\033[0m %s\n" "$*"; }
err(){ printf "\033[1;31m[error]\033[0m %s\n" "$*"; }

profile_services() {
  case "$1" in
    2g)  echo "caddy redis chromadb ollama alchemical-gateway velktharion synapsara" ;;
    4g)  echo "caddy redis chromadb ollama alchemical-gateway velktharion synapsara kryonexus ignivox" ;;
    8g)  echo "caddy redis chromadb ollama alchemical-gateway velktharion synapsara kryonexus ignivox auralith resonvyr" ;;
    16g|32g) echo "all" ;;
    *) return 1 ;;
  esac
}

default_model_for_profile() {
  case "$1" in
    2g) echo "tinyllama:1.1b" ;;
    4g) echo "phi3:mini" ;;
    8g) echo "qwen2.5:3b" ;;
    16g|32g) echo "phi3:mini" ;;
    *) echo "phi3:mini" ;;
  esac
}

validate_profile() {
  case "$1" in
    2g|4g|8g|16g|32g) return 0 ;;
    *) return 1 ;;
  esac
}

usage(){
  cat <<USAGE
Usage: bash infra/scripts/install.sh [options]
  --domain <domain>          Domain for reverse proxy (default: localhost)
  --profile <2g|4g|8g|16g|32g>
                             RAM profile (default: 4g)
  --model <ollama-model>     Ollama model to pull (default: profile-based)
  --no-pull                  Skip Ollama model pull
  --wizard                   Interactive wizard mode
  -h, --help                 Show this help
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) DOMAIN="${2:-}"; shift 2 ;;
    --profile) PROFILE="${2:-4g}"; shift 2 ;;
    --model) OLLAMA_MODEL="${2:-}"; shift 2 ;;
    --no-pull) NO_PULL=1; shift ;;
    --wizard) WIZARD=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) err "Unknown arg: $1"; usage; exit 1 ;;
  esac
done

if ! validate_profile "$PROFILE"; then
  err "Invalid profile: $PROFILE (valid: 2g, 4g, 8g, 16g, 32g)"
  exit 1
fi

if [[ -z "$OLLAMA_MODEL" ]]; then
  OLLAMA_MODEL="$(default_model_for_profile "$PROFILE")"
fi

if [[ $WIZARD -eq 1 ]]; then
  echo
  echo "🜁 Alchemical Install Wizard"
  echo "----------------------------"
  read -r -p "Dominio [localhost]: " input_domain || true
  DOMAIN="${input_domain:-$DOMAIN}"
  read -r -p "Perfil RAM (2g|4g|8g|16g|32g) [${PROFILE}]: " input_profile || true
  PROFILE="${input_profile:-$PROFILE}"

  if ! validate_profile "$PROFILE"; then
    warn "Perfil inválido, se mantiene: $PROFILE"
    PROFILE="4g"
  fi

  if [[ "$OLLAMA_MODEL" == "phi3:mini" || -z "$OLLAMA_MODEL" ]]; then
    OLLAMA_MODEL="$(default_model_for_profile "$PROFILE")"
  fi

  read -r -p "Modelo Ollama [${OLLAMA_MODEL}]: " input_model || true
  OLLAMA_MODEL="${input_model:-$OLLAMA_MODEL}"
  read -r -p "¿Pull del modelo ahora? (Y/n): " input_pull || true
  if [[ "${input_pull:-Y}" =~ ^[Nn]$ ]]; then NO_PULL=1; fi
  echo
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

log "[1/6] Preflight"
command -v docker >/dev/null || { err "Docker missing"; exit 1; }
docker compose version >/dev/null || { err "Docker Compose missing"; exit 1; }

log "[2/6] Preparing runtime directories"
mkdir -p "$ROOT/.runtime" || true

log "[3/6] Generating .env"
cat > .env <<ENV
ALCHEMICAL_DOMAIN=${DOMAIN}
ALCHEMICAL_PROFILE=${PROFILE}
ALCHEMICAL_MODEL=${OLLAMA_MODEL}
ENV

log "[4/6] Building and starting platform"
SERVICES="$(profile_services "$PROFILE")"
if [[ "$SERVICES" == "all" ]]; then
  log "Profile ${PROFILE}: full stack"
  docker compose up -d --build
else
  log "Profile ${PROFILE}: ${SERVICES}"
  docker compose up -d --build ${SERVICES}
fi

log "[5/6] Health check"
docker compose ps

log "[6/6] Pull local model (${OLLAMA_MODEL})"
if [[ $NO_PULL -eq 0 ]]; then
  if docker compose ps ollama >/dev/null 2>&1; then
    docker compose exec -T ollama ollama pull "$OLLAMA_MODEL" || warn "Model pull failed, continuing"
  else
    warn "Ollama service not detected"
  fi
else
  warn "Skipping model pull (--no-pull)"
fi

echo
echo "✅ Alchemical ecosystem ready"
echo "Domain: ${DOMAIN}"
echo "Profile: ${PROFILE}"
echo "Model: ${OLLAMA_MODEL}"
echo "Health checks:"
echo "  curl http://localhost/velktharion/health"
echo "  curl http://localhost/synapsara/health"
echo "  docker compose ps"
