#!/usr/bin/env bash
set -euo pipefail

REPO="smouj/alchemical-agent-ecosystem"
PROJECT="5"
OWNER="@me"

echo "[1/7] Access check"
gh project view "$PROJECT" --owner "$OWNER" >/dev/null

echo "[2/7] Ensure labels"
for L in "priority:P0" "priority:P1" "priority:P2" "priority:P3" \
         "area:gateway" "area:dashboard" "area:devops" "area:docs" "area:security" "area:connectors" \
         "type:feature" "type:bug" "type:chore"; do
  gh label create "$L" --repo "$REPO" --color BFD4F2 --description "$L" 2>/dev/null || true
done

echo "[3/7] Add/normalize project phases"
FIELD_JSON=$(gh project field-list "$PROJECT" --owner "$OWNER" --format json)
STATUS_ID=$(echo "$FIELD_JSON" | jq -r '.fields[] | select(.name=="Status") | .id')
if [[ -n "$STATUS_ID" && "$STATUS_ID" != "null" ]]; then
  for opt in "Backlog" "Ready" "In Progress" "Review/CI" "Blocked" "Done"; do
    gh project field-option-create "$PROJECT" --owner "$OWNER" --field-id "$STATUS_ID" --name "$opt" >/dev/null 2>&1 || true
  done
fi

echo "[4/7] Close duplicate seeded roadmap issues (keep oldest by exact title)"
TMP=$(mktemp)
gh issue list --repo "$REPO" --state open --limit 200 --json number,title,createdAt > "$TMP"
python3 - <<'PY' "$TMP" > /tmp/dupes_to_close.txt
import json,sys
with open(sys.argv[1]) as f: items=json.load(f)
road=[i for i in items if i['title'].startswith('[P')]
by={}
for i in sorted(road,key=lambda x:x['createdAt']):
    by.setdefault(i['title'],[]).append(i)
for t,arr in by.items():
    if len(arr)>1:
        for x in arr[1:]:
            print(x['number'])
PY
if [[ -s /tmp/dupes_to_close.txt ]]; then
  while read -r n; do
    gh issue close "$n" --repo "$REPO" --reason "not planned" --comment "Auto-cleanup: duplicate roadmap seed issue." >/dev/null || true
    echo "closed #$n"
  done < /tmp/dupes_to_close.txt
else
  echo "no duplicate seeded issues"
fi
rm -f "$TMP" /tmp/dupes_to_close.txt

echo "[5/7] Ensure open issues are linked to project"
while IFS= read -r url; do
  [[ -z "$url" ]] && continue
  gh project item-add "$PROJECT" --owner "$OWNER" --url "$url" >/dev/null 2>&1 || true
done < <(gh issue list --repo "$REPO" --state open --limit 200 --json url --jq '.[].url')

echo "[6/7] Repo sync"
cd /mnt/d/alchemical-agent-ecosystem
git fetch origin
git pull --rebase origin main
git push origin main

echo "[7/7] Summary"
gh project view "$PROJECT" --owner "$OWNER"
gh issue list --repo "$REPO" --state open --limit 20
