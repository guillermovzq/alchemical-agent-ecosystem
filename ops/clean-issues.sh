#!/usr/bin/env bash
set -euo pipefail

REPO="smouj/alchemical-agent-ecosystem"
MODE="${1:-dry-run}"   # dry-run | apply

need_labels=("priority:" "area:" "type:")

echo "Collecting open issues from $REPO ..."
issues_json="$(gh issue list --repo "$REPO" --state open --limit 200 --json number,title,labels,url,createdAt,updatedAt,author)"

# 1) Missing required label families
missing_report="$(echo "$issues_json" | jq -r '
  .[] | 
  . as $i |
  ([.labels[].name] // []) as $ls |
  {number, title, url, labels: ($ls|join(",")),
   hasPriority: ([ $ls[] | startswith("priority:") ] | any),
   hasArea: ([ $ls[] | startswith("area:") ] | any),
   hasType: ([ $ls[] | startswith("type:") ] | any)} |
  select((.hasPriority|not) or (.hasArea|not) or (.hasType|not)) |
  "#\(.number)\t\(.title)\t\(.url)\tlabels=[\(.labels)]"
')"

# 2) Potential duplicates by normalized title
# normalize: lowercase, remove punctuation and extra spaces
potential_dupes="$(echo "$issues_json" | jq -r '
  .[] | [.number, .title, .url] | @tsv
' | python3 - <<'PY'
import sys,re
rows=[]
for line in sys.stdin:
    n,t,u=line.rstrip('\n').split('\t')
    key=t.lower()
    key=re.sub(r'\[[^\]]*\]','',key)
    key=re.sub(r'[^a-z0-9 ]+',' ',key)
    key=re.sub(r'\s+',' ',key).strip()
    rows.append((n,t,u,key))
from collections import defaultdict
m=defaultdict(list)
for r in rows:
    m[r[3]].append(r)
for k,v in m.items():
    if len(v)>1:
        print('DUP_KEY:\t'+k)
        for n,t,u,_ in v:
            print(f'  #{n}\t{t}\t{u}')
PY
)"

echo
 echo "=== Missing label families (priority/area/type) ==="
if [[ -n "$missing_report" ]]; then
  echo "$missing_report"
else
  echo "None ✅"
fi

echo
 echo "=== Potential duplicate titles (manual review) ==="
if [[ -n "$potential_dupes" ]]; then
  echo "$potential_dupes"
else
  echo "None ✅"
fi

if [[ "$MODE" == "dry-run" ]]; then
  echo
  echo "Dry-run complete. No changes applied."
  echo "To auto-apply minimal labeling: bash ops/clean-issues.sh apply"
  exit 0
fi

# APPLY MODE: only minimal safe actions
# Add fallback labels when missing (safe, non-destructive)
echo
 echo "Applying minimal safe labels where missing..."
while IFS=$'\t' read -r num title url labels; do
  [[ -z "$num" ]] && continue
  issue_num="${num#\#}"
  current="$(gh issue view "$issue_num" --repo "$REPO" --json labels --jq '.labels[].name' | tr '\n' ' ')"
  add=()
  [[ "$current" != *"priority:"* ]] && add+=("priority:P2")
  [[ "$current" != *"area:"* ]] && add+=("area:docs")
  [[ "$current" != *"type:"* ]] && add+=("type:chore")
  if [[ ${#add[@]} -gt 0 ]]; then
    gh issue edit "$issue_num" --repo "$REPO" --add-label "$(IFS=,; echo "${add[*]}")" >/dev/null
    echo "Labeled #$issue_num -> ${add[*]}"
  fi
done < <(echo "$missing_report")

echo
 echo "Apply complete (non-destructive)."
 echo "Now manually review duplicate candidates and close/comment if needed."
