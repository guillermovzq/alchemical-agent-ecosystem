# Installation & Startup (Current Reality)

This is the canonical install/start guide focused on **fast and predictable local bootstrap**.

## 1) Recommended path (most users)

```bash
cd /mnt/d/alchemical-agent-ecosystem
./install.sh --wizard
./scripts/alchemical up-fast
```

Then validate:

```bash
curl -fsS http://localhost/gateway/health
curl -fsS http://localhost/gateway/ready
```

## 2) Non-interactive install

```bash
./install.sh --domain localhost --profile 4g --model phi3:mini
```

## 3) Fast install profile (speed-first)

```bash
./install.sh --fast --profile 2g
./scripts/alchemical up-fast
```

## 4) Performance tips (WSL/local)

1. Enable Docker BuildKit for faster builds:
   ```bash
   export DOCKER_BUILDKIT=1
   export COMPOSE_DOCKER_CLI_BUILD=1
   ```
2. Pre-pull images before first run:
   ```bash
   docker compose pull --include-deps
   ```
3. Keep heavyweight tooling out of first boot path (`up-fast` first, then full profile).
4. If using WSL + `/mnt/*`, expect slower IO than Linux filesystem paths.

## 5) Port conflicts (very common)

If `http://localhost/gateway/health` returns `502` and Caddy is not starting, check who owns port 80:

```bash
sudo ss -tulpn | grep ':80'
docker ps --format 'table {{.Names}}\t{{.Ports}}' | grep '0.0.0.0:80->'
```

Stop the conflicting container, then restart Alchemical caddy:

```bash
docker stop <container-using-80>
docker compose up -d caddy
```

## 6) Verify dashboard

- Caddy path: `http://localhost`
- Next dev dashboard (if running `./scripts/alchemical dashboard`): `http://localhost:3000`

## 7) Desktop shortcut (Linux/WSL GUI)

Create a launcher icon on your desktop:

```bash
chmod +x ops/create-desktop-shortcut.sh
bash ops/create-desktop-shortcut.sh
```

This launcher starts fast runtime + dashboard in one click.

## 8) Canonical docs after install

- `API_REFERENCE.md` for endpoint details
- `OPERATIONS_RUNBOOK.md` for update/rollback and maintenance
- `ARCHITECTURE.md` for system mapping and invariants
