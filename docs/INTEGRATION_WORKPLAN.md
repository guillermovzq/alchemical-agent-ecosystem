# Integration Workplan (Real Skill Logic)

## Done now
- Cloned 10 skill repositories into `workspace/skills/*`
- Added shared schema/contracts space
- Added `alchemical-gateway` dispatch service for cross-skill orchestration
- Wired gateway in Caddy at `/gateway/*`

## Next implementation slices
1. Replace placeholder handlers in each skill service with repo-backed modules.
2. Add Redis-backed shared task memory and execution trace IDs.
3. Implement one end-to-end flow:
   - Resonvyr (voice intent) -> Fluxenrath (workflow) -> Vaeloryn-Conclave (routing) -> target skill.
4. Add integration tests for cross-skill dispatch.

## Skill repo update workflow
Use these helper scripts from the alchemical root:

```bash
# Sync all skills from their upstream repos
scripts/skills-sync.sh

# Inspect status of each skill repo
scripts/skills-status.sh

# Commit+push changes in any modified skill repo
# (requires GITHUB_TOKEN or authenticated remotes)
GITHUB_TOKEN=*** scripts/skills-push-all.sh
```
