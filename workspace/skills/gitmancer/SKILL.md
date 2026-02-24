---
name: gitmancer
description: Create, structure, document, and maintain top-tier GitHub repositories with 2026 best practices. Use when a user asks for repo naming, folder architecture, README creation, governance files, CI workflows, release checklist, or long-term maintainer guidance.
---

# gitmancer

When invoked, produce a complete repository package with:
1. Repository naming and topic recommendations.
2. Modern folder tree aligned to project type.
3. Complete README.md with badges, architecture, setup, usage, roadmap.
4. Governance files:
   - LICENSE
   - CONTRIBUTING.md
   - CODE_OF_CONDUCT.md
   - SECURITY.md
   - issue templates + PR template
5. CI recommendations and baseline workflows.
6. Launch + maintenance checklist.
7. Practical “gold tips” for discoverability and maintainability.

## Output contract
- Always return copy-paste-ready markdown/code blocks.
- Keep claims realistic to project state.
- Separate implemented vs planned items clearly.
- Prefer concise, maintainable defaults over over-engineering.

## Reference files
- `docs/PLAYBOOK.md`
- `templates/README.template.md`
- `templates/GOVERNANCE_CHECKLIST.md`
