#!/bin/bash
# 🚀 Alchemical Ecosystem - VPS Deployment Script
# Uso: ./scripts/deploy-vps.sh [environment]
# Environment: production (default) | staging

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
ENVIRONMENT="${1:-production}"
VPS_HOST="${VPS_HOST:-vps-hostinger}"
VPS_PATH="${VPS_PATH:-/opt/alchemical}"
LOCAL_PATH="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "${BLUE}🧪 Alchemical Ecosystem - VPS Deployment${NC}"
echo -e "   Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "   VPS: ${YELLOW}${VPS_HOST}${NC}"
echo -e "   Path: ${YELLOW}${VPS_PATH}${NC}"
echo ""

# 1. Pre-deploy checks
echo -e "${BLUE}📋 Pre-deployment checks...${NC}"

# Check if we can connect to VPS
if ! ssh -o ConnectTimeout=5 "${VPS_HOST}" "echo 'VPS reachable'" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Cannot connect to VPS (${VPS_HOST})${NC}"
    echo "   Make sure SSH config has Host ${VPS_HOST} configured"
    exit 1
fi
echo -e "${GREEN}✓ VPS reachable${NC}"

# Check uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    git status --short
    read -p "   Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Push to origin
echo -e "${BLUE}📤 Pushing to origin...${NC}"
git push origin main
echo -e "${GREEN}✓ Code pushed${NC}"

# 2. Deploy on VPS
echo -e "${BLUE}🚀 Deploying on VPS...${NC}"

ssh "${VPS_HOST}" << EOF
    set -e
    
    echo "→ Pulling latest code..."
    cd "${VPS_PATH}"
    git pull origin main
    
    echo "→ Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker not running"
        exit 1
    fi
    
    echo "→ Stopping services..."
    docker-compose down --remove-orphans
    
    echo "→ Pruning old images..."
    docker image prune -af --filter "until=24h"
    
    echo "→ Building and starting services..."
    docker-compose up -d --build
    
    echo "→ Waiting for services to be healthy..."
    sleep 10
    
    echo "→ Checking service health..."
    docker-compose ps
    
    echo ""
    echo "✓ Deployment complete!"
EOF

# 3. Post-deploy verification
echo -e "${BLUE}🔍 Post-deployment verification...${NC}"

sleep 5

# Check gateway health
if curl -fsS "http://${VPS_HOST}:7411/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Gateway healthy${NC}"
else
    echo -e "${RED}❌ Gateway not responding${NC}"
fi

# Check dashboard
if curl -fsS "http://${VPS_HOST}:8080/api/system" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Dashboard responding${NC}"
else
    echo -e "${YELLOW}⚠️  Dashboard not responding (may need more time)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment to ${ENVIRONMENT} complete!${NC}"
echo -e "   Dashboard: http://${VPS_HOST}:8080"
echo -e "   Gateway:   http://${VPS_HOST}:7411"
echo -e "   Caddy:     http://${VPS_HOST}:80"
