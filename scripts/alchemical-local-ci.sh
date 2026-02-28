#!/bin/bash
# 🔮 Alchemical Local CI
# Validación local completa del proyecto sin depender de GitHub Actions
# Uso: ./scripts/alchemical-local-ci.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0

# Función para imprimir headers
 print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

# Función para imprimir éxito
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para imprimir error
print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

# Función para imprimir warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# ============================================
# 🔒 SECURITY CHECKS
# ============================================
print_header "🔒 SECURITY CHECKS"

# Check for private keys
if grep -r "BEGIN RSA PRIVATE KEY\|BEGIN OPENSSH PRIVATE KEY\|BEGIN EC PRIVATE KEY\|BEGIN DSA PRIVATE KEY" --include="*.py" --include="*.js" --include="*.ts" --include="*.json" --include="*.md" . 2>/dev/null | grep -v ".git" | grep -v "node_modules"; then
    print_error "Found private keys in repository!"
else
    print_success "No private keys found"
fi

# Check for .env files (should be in .gitignore)
if find . -name ".env" -not -path "./.env.example" 2>/dev/null | grep -q .; then
    print_warning ".env files found (should be in .gitignore)"
else
    print_success "No .env files in repository"
fi

# Check for potential secrets patterns
if grep -r "AKIA[0-9A-Z]{16}\|AIza[0-9A-Za-z_-]{35}\|sk-[0-9a-zA-Z]{48}" --include="*.py" --include="*.js" --include="*.ts" . 2>/dev/null | grep -v ".git" | grep -v "node_modules"; then
    print_error "Potential secrets found!"
else
    print_success "No obvious secrets detected"
fi

# ============================================
# 🐍 PYTHON VALIDATION
# ============================================
print_header "🐍 PYTHON VALIDATION"

# Check if Python is available
if ! command -v python &> /dev/null; then
    print_error "Python not found"
    exit 1
fi

print_success "Python version: $(python --version)"

# Syntax check - Gateway
print_header "⚙️  Gateway Syntax Check"
if python -m py_compile gateway/app.py 2>/dev/null; then
    print_success "gateway/app.py compiles successfully"
else
    print_error "gateway/app.py has syntax errors"
fi

# Syntax check - Services
print_header "⚙️  Services Syntax Check"
SERVICES="services/temporaeth/app.py services/resonvyr/app.py services/kryonexus/app.py services/fluxenrath/app.py services/auralith/app.py services/synapsara/app.py services/noctumbra-mail/app.py"
for service in $SERVICES; do
    if [ -f "$service" ]; then
        if python -m py_compile "$service" 2>/dev/null; then
            print_success "$service compiles successfully"
        else
            print_error "$service has syntax errors"
        fi
    fi
done

# Ruff linting (if available)
if command -v ruff &> /dev/null; then
    print_header "🧹 Python Linting (Ruff)"
    if ruff check gateway/ shared/ --select E,W,F --ignore E501 2>/dev/null; then
        print_success "Ruff linting passed"
    else
        print_warning "Ruff found issues (non-critical)"
    fi
else
    print_warning "Ruff not installed, skipping Python linting"
    echo "Install with: pip install ruff"
fi

# MyPy type checking (if available)
if command -v mypy &> /dev/null; then
    print_header "📘 Python Type Checking (MyPy)"
    if mypy gateway/app.py --ignore-missing-imports --no-strict-optional 2>/dev/null; then
        print_success "MyPy type checking passed"
    else
        print_warning "MyPy found type issues (non-critical)"
    fi
else
    print_warning "MyPy not installed, skipping type checking"
    echo "Install with: pip install mypy"
fi

# ============================================
# 🎨 FRONTEND VALIDATION
# ============================================
print_header "🎨 FRONTEND VALIDATION"

cd apps/alchemical-dashboard

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_error "Node.js not found"
    exit 1
fi

print_success "Node.js version: $(node --version)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_header "📦 Installing dependencies..."
    npm ci
fi

# ESLint check
print_header "🧹 ESLint Check"
if npm run lint 2>&1 | grep -q "error"; then
    print_error "ESLint found errors"
else
    print_success "ESLint check passed"
fi

# TypeScript strict check
print_header "📘 TypeScript Strict Check"
if npx tsc --noEmit 2>&1 | grep -q "error"; then
    print_error "TypeScript strict check failed"
else
    print_success "TypeScript strict check passed"
fi

# Build check
print_header "🏗️  Frontend Build Check"
if npm run build 2>&1 | grep -q "error"; then
    print_error "Frontend build failed"
else
    print_success "Frontend build successful"
fi

cd ../..

# ============================================
# 🐳 DOCKER VALIDATION
# ============================================
print_header "🐳 DOCKER VALIDATION"

if command -v docker &> /dev/null; then
    if docker compose config > /dev/null 2>&1; then
        print_success "Docker Compose validation passed"
    else
        print_error "Docker Compose validation failed"
    fi
else
    print_warning "Docker not found, skipping Docker validation"
fi

# ============================================
# 📊 SUMMARY
# ============================================
print_header "📊 VALIDATION SUMMARY"

echo -e "Total Errors: $ERRORS"
echo -e "Total Warnings: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All checks passed! Ready to commit.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some checks failed. Please fix errors before committing.${NC}"
    exit 1
fi
