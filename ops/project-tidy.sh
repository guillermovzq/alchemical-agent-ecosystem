#!/usr/bin/env bash
set -euo pipefail

OWNER="@me"
PROJECT="5"
REPO="smouj/alchemical-agent-ecosystem"

echo "[1/5] Close duplicate seeded issues (keep oldest exact title)"
TMP=$(mktemp)
gh issue list --repo "$REPO" --state open --limit 500 --json number,title,createdAt,url > "$TMP"
python3 - <<'PY' "$TMP" > /tmp/dupes_close.txt
import json,sys
with open(sys.argv[1]) as f: items=json.load(f)
rows=[i for i in items if i['title'].startswith('[P')]
by={}
for i in sorted(rows,key=lambda x:x['createdAt']):
    by.setdefault(i['title'],[]).append(i)
for arr in by.values():
    if len(arr)>1:
        for x in arr[1:]:
            print(x['number'])
PY
if [[ -s /tmp/dupes_close.txt ]]; then
  while read -r n; do
    gh issue close "$n" --repo "$REPO" --reason "not planned" --comment "Cleanup: duplicate roadmap seed issue." >/dev/null || true
    echo "closed #$n"
  done < /tmp/dupes_close.txt
else
  echo "no duplicate seeded issues"
fi
rm -f /tmp/dupes_close.txt "$TMP"

echo "[2/5] Build open issue url set"
OPEN_URLS=$(gh issue list --repo "$REPO" --state open --limit 500 --json url --jq '.[].url')

echo "[3/5] Remove project items that are closed/non-repo"
gh project item-list "$PROJECT" --owner "$OWNER" --limit 500 --format json > /tmp/project_items.json
python3 - <<'PY'
import json,subprocess,sys
with open('/tmp/project_items.json') as f: data=json.load(f)
items=data.get('items',[])
open_urls=set()
proc=subprocess.run(['gh','issue','list','--repo','smouj/alchemical-agent-ecosystem','--state','open','--limit','500','--json','url','--jq','.[].url'],capture_output=True,text=True)
open_urls=set([x.strip() for x in proc.stdout.splitlines() if x.strip()])
for it in items:
    content=it.get('content') or {}
    url=content.get('url','')
    typ=content.get('type','')
    iid=it.get('id')
    if typ=='Issue':
        if (not url.startswith('https://github.com/smouj/alchemical-agent-ecosystem/issues/')) or (url not in open_urls):
            subprocess.run(['gh','project','item-delete','5','--owner','@me','--id',iid],check=False)
            print(f'deleted item {iid} ({url})')
PY

echo "[4/5] Re-link open issues idempotently"
bash ops/sync-project-with-repo.sh link-only

echo "[5/5] Final summary"
gh project view "$PROJECT" --owner "$OWNER" --format json --jq '{title:.title,itemCount:.items.totalCount}'
