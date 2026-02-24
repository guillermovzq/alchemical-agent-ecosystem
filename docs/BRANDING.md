# Branding Guide

## Primary assets

- Main logo (default): `assets/branding/logo.svg`
- Horizontal lockup (README/repo header): `assets/branding/variants/logo-horizontal.svg`
- Icon mark (avatar/favicon base): `assets/branding/variants/logo-mark.svg`

## Recommended usage

- GitHub README header: use `logo-horizontal.svg` at width `680–820`.
- Social preview image (GitHub repo): export `1200x630` from horizontal lockup.
- App icon/favicons: use `logo-mark.svg` exported to `512/256/128`.

## Export formats

Use:

```bash
./scripts/export-logo-formats.sh
```

This attempts generation of PNG/WEBP/ICO when local tools are available.
