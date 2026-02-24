#!/usr/bin/env bash
set -euo pipefail

OWNER="@me"
PROJECT_NUMBER="5"
REPO="smouj/alchemical-agent-ecosystem"
TITLE="Alchemical Agent Ecosystem — Roadmap & Delivery"
README_TEXT="Project oficial de ejecución de smouj/alchemical-agent-ecosystem: roadmap, backlog priorizado, delivery, revisión CI y releases."

echo "[1/6] Rename + readme"
gh project edit "$PROJECT_NUMBER" --owner "$OWNER" --title "$TITLE"
gh project edit "$PROJECT_NUMBER" --owner "$OWNER" --readme "$README_TEXT"

echo "[2/6] Ensure labels"
for L in "priority:P0" "priority:P1" "priority:P2" "priority:P3" \
         "area:gateway" "area:dashboard" "area:devops" "area:docs" "area:security" "area:connectors" \
         "type:feature" "type:bug" "type:chore"; do
  gh label create "$L" --repo "$REPO" --color BFD4F2 --description "$L" 2>/dev/null || true
done

echo "[3/6] Create project fields"
# Single-select fields
for field in "Priority" "Area" "Type" "Effort" "Target Release"; do
  gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" --name "$field" --data-type SINGLE_SELECT 2>/dev/null || true
done

# Options (safe add; ignore if exists)
add_option(){
  local field="$1"; shift
  local option="$1"; shift
  gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json \
    | jq -r ".fields[] | select(.name==\"$field\") | .id" \
    | while read -r fid; do
        [[ -z "$fid" ]] && continue
        gh project field-option-create "$PROJECT_NUMBER" --owner "$OWNER" --field-id "$fid" --name "$option" 2>/dev/null || true
      done
}

for o in P0 P1 P2 P3; do add_option "Priority" "$o"; done
for o in Gateway Dashboard DevOps Docs Security Connectors; do add_option "Area" "$o"; done
for o in Feature Bug Chore; do add_option "Type" "$o"; done
for o XS S M L XL; do add_option "Effort" "$o"; done
for o v0.3 v0.4 v1.0; do add_option "Target Release" "$o"; done

echo "[4/6] Seed issues"
mk(){
  gh issue create --repo "$REPO" --title "$1" --body "$2" --label "$3" \
    | tail -n1
}

ISSUES=()
ISSUES+=("$(mk "[P0] Connector adapters reales (Telegram/Discord) con webhook bidireccional" "Implementar conectores E2E reales con retry y observabilidad." "priority:P0,area:connectors,type:feature")")
ISSUES+=("$(mk "[P0] Dashboard integration para auth API keys + roles" "UI completa de claves API y roles sobre gateway." "priority:P0,area:dashboard,area:security,type:feature")")
ISSUES+=("$(mk "[P1] Panel realtime de jobs/events en dashboard" "Vista jobs + events con stream SSE y filtros." "priority:P1,area:dashboard,area:gateway,type:feature")")
ISSUES+=("$(mk "[P1] Hardening gateway: rate limit, payload limits y CORS configurable" "Validar endurecimiento y documentar vars de entorno." "priority:P1,area:security,area:gateway,type:chore")")
ISSUES+=("$(mk "[P1] CI anti-regresión completo (imports, tests gateway, build dashboard)" "Blindar Actions y checks obligatorios." "priority:P1,area:devops,area:gateway,area:dashboard,type:chore")")
ISSUES+=("$(mk "[P2] update-safe con notificación estructurada (success/fail)" "Enviar webhook con commit, duración y estado." "priority:P2,area:devops,type:feature")")
ISSUES+=("$(mk "[P2] Documentación 1:1 EN/ES con validación automática" "Check de paridad en CI para docs principales." "priority:P2,area:docs,type:chore")")
ISSUES+=("$(mk "[P2] Observabilidad extendida: /metrics Prometheus + panel" "Exponer métricas y panelizarlas." "priority:P2,area:gateway,area:dashboard,type:feature")")
ISSUES+=("$(mk "[P3] Pipeline de branding y social preview automatizado" "Generación de assets branding/social en pipeline." "priority:P3,area:docs,type:chore")")
ISSUES+=("$(mk "[P3] Release automation con changelog semántico" "Workflow release + changelog semver." "priority:P3,area:devops,type:feature")")

echo "[5/6] Add issues to project"
for u in "${ISSUES[@]}"; do
  [[ -z "$u" ]] && continue
  gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$u" >/dev/null || true
  echo "  + $u"
done

echo "[6/6] Done"
echo "Project configured: $TITLE"
