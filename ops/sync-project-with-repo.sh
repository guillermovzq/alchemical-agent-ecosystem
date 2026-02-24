#!/usr/bin/env bash
set -euo pipefail

OWNER="@me"
PROJECT_NUMBER="5"
REPO="smouj/alchemical-agent-ecosystem"
MODE="${1:-link-only}"   # link-only | seed

echo "[1/4] Ensure labels"
for L in "priority:P0" "priority:P1" "priority:P2" "priority:P3" \
         "area:gateway" "area:dashboard" "area:devops" "area:docs" "area:security" "area:connectors" \
         "type:feature" "type:bug" "type:chore"; do
  gh label create "$L" --repo "$REPO" --color BFD4F2 --description "$L" 2>/dev/null || true
done

if [[ "$MODE" == "seed" ]]; then
  echo "[2/4] Seed core roadmap issues (idempotent)"
  mk(){
    local title="$1"; local body="$2"; local labels="$3"
    if gh issue list --repo "$REPO" --search "in:title \"$title\"" --json title --jq '.[0].title' 2>/dev/null | grep -qx "$title"; then
      echo "skip existing: $title"
      return
    fi
    gh issue create --repo "$REPO" --title "$title" --body "$body" --label "$labels" >/dev/null
    echo "created: $title"
  }

  mk "[P0] Connector adapters reales (Telegram/Discord) con webhook bidireccional" "Implementar conectores E2E reales con envío/recepción, validación y reintentos." "priority:P0,area:connectors,type:feature"
  mk "[P0] Dashboard integration para auth API keys + roles" "UI completa de claves API y roles sobre gateway." "priority:P0,area:dashboard,area:security,type:feature"
  mk "[P1] Panel realtime de jobs/events en dashboard" "Vista jobs + events con stream SSE y filtros." "priority:P1,area:dashboard,area:gateway,type:feature"
  mk "[P1] Hardening gateway: rate limit, payload limits y CORS configurable" "Validar endurecimiento y documentar vars de entorno." "priority:P1,area:security,area:gateway,type:chore"
  mk "[P1] CI anti-regresión completo (imports, tests gateway, build dashboard)" "Blindar Actions y checks obligatorios." "priority:P1,area:devops,area:gateway,area:dashboard,type:chore"
  mk "[P2] update-safe con notificación estructurada (success/fail)" "Notificación webhook con commit, duración y health." "priority:P2,area:devops,type:feature"
  mk "[P2] Documentación 1:1 EN/ES con validación automática" "Check de paridad estructural en CI." "priority:P2,area:docs,type:chore"
  mk "[P2] Observabilidad extendida: /metrics Prometheus + panel" "Exponer métricas y visualización en dashboard." "priority:P2,area:gateway,area:dashboard,type:feature"
  mk "[P3] Pipeline de branding y social preview automatizado" "Generación de assets branding/social en pipeline." "priority:P3,area:docs,type:chore"
  mk "[P3] Release automation con changelog semántico" "Workflow release + changelog semver." "priority:P3,area:devops,type:feature"
else
  echo "[2/4] Seed disabled (mode: $MODE)"
fi

echo "[3/4] Link all open repo issues to project"
while IFS= read -r url; do
  [[ -z "$url" ]] && continue
  gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$url" >/dev/null 2>&1 || true
done < <(gh issue list --repo "$REPO" --state open --limit 500 --json url --jq '.[].url')

echo "[4/4] Summary"
COUNT=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json --jq '.items.totalCount' 2>/dev/null || echo "unknown")
echo "Project items: $COUNT"
