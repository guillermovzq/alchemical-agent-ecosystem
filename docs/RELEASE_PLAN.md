# Release Plan (2026)

## Versioning
- Use Semantic Versioning: `vMAJOR.MINOR.PATCH`.
- Tag releases on main after CI green.

## Release pipeline
1. Merge to main (CI required checks).
2. Tag version (`git tag v0.x.y`).
3. Push tags.
4. Publish release notes.

## Checklist
- [ ] README EN/ES updated
- [ ] API reference updated
- [ ] Runbook updated
- [ ] CI green
- [ ] Changelog/release notes ready
