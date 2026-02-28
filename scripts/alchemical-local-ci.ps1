# 🔮 Alchemical Local CI (Windows PowerShell)
# Validación local completa del proyecto sin depender de GitHub Actions
# Uso: .\scripts\alchemical-local-ci.ps1

$ErrorActionPreference = "Stop"

# Contadores
$script:ERRORS = 0
$script:WARNINGS = 0

# Función para imprimir headers
function Print-Header($text) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host "  $text" -ForegroundColor Blue
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Blue
}

# Función para imprimir éxito
function Print-Success($text) {
    Write-Host "✅ $text" -ForegroundColor Green
}

# Función para imprimir error
function Print-Error($text) {
    Write-Host "❌ $text" -ForegroundColor Red
    $script:ERRORS++
}

# Función para imprimir warning
function Print-Warning($text) {
    Write-Host "⚠️  $text" -ForegroundColor Yellow
    $script:WARNINGS++
}

# ============================================
# 🔒 SECURITY CHECKS
# ============================================
Print-Header "🔒 SECURITY CHECKS"

# Check for private keys
$privateKeyPattern = "BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY"
$foundKeys = Get-ChildItem -Recurse -File -Include *.py,*.js,*.ts,*.json,*.md | 
    Select-String -Pattern $privateKeyPattern | 
    Where-Object { $_.Path -notlike "*\.git*" -and $_.Path -notlike "*node_modules*" }

if ($foundKeys) {
    Print-Error "Found private keys in repository!"
    $foundKeys | ForEach-Object { Write-Host $_.Path }
} else {
    Print-Success "No private keys found"
}

# Check for .env files
$envFiles = Get-ChildItem -Recurse -File -Filter ".env" | Where-Object { $_.Name -ne ".env.example" }
if ($envFiles) {
    Print-Warning ".env files found (should be in .gitignore)"
    $envFiles | ForEach-Object { Write-Host $_.FullName }
} else {
    Print-Success "No .env files in repository"
}

# Check for potential secrets patterns
$secretPattern = "AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|sk-[0-9a-zA-Z]{48}"
$foundSecrets = Get-ChildItem -Recurse -File -Include *.py,*.js,*.ts | 
    Select-String -Pattern $secretPattern | 
    Where-Object { $_.Path -notlike "*\.git*" -and $_.Path -notlike "*node_modules*" }

if ($foundSecrets) {
    Print-Error "Potential secrets found!"
    $foundSecrets | ForEach-Object { Write-Host $_.Path }
} else {
    Print-Success "No obvious secrets detected"
}

# ============================================
# 🐍 PYTHON VALIDATION
# ============================================
Print-Header "🐍 PYTHON VALIDATION"

# Check if Python is available
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Print-Error "Python not found"
    exit 1
}

$pythonVersion = & python --version 2>&1
Print-Success "Python version: $pythonVersion"

# Syntax check - Gateway
Print-Header "⚙️  Gateway Syntax Check"
try {
    & python -m py_compile gateway/app.py 2>&1 | Out-Null
    Print-Success "gateway/app.py compiles successfully"
} catch {
    Print-Error "gateway/app.py has syntax errors"
}

# Syntax check - Services
Print-Header "⚙️  Services Syntax Check"
$services = @(
    "services/temporaeth/app.py",
    "services/resonvyr/app.py",
    "services/kryonexus/app.py",
    "services/fluxenrath/app.py",
    "services/auralith/app.py",
    "services/synapsara/app.py",
    "services/noctumbra-mail/app.py"
)

foreach ($service in $services) {
    if (Test-Path $service) {
        try {
            & python -m py_compile $service 2>&1 | Out-Null
            Print-Success "$service compiles successfully"
        } catch {
            Print-Error "$service has syntax errors"
        }
    }
}

# Ruff linting (if available)
$ruff = Get-Command ruff -ErrorAction SilentlyContinue
if ($ruff) {
    Print-Header "🧹 Python Linting (Ruff)"
    try {
        & ruff check gateway/ shared/ --select E,W,F --ignore E501 2>&1 | Out-Null
        Print-Success "Ruff linting passed"
    } catch {
        Print-Warning "Ruff found issues (non-critical)"
    }
} else {
    Print-Warning "Ruff not installed, skipping Python linting"
    Write-Host "Install with: pip install ruff"
}

# MyPy type checking (if available)
$mypy = Get-Command mypy -ErrorAction SilentlyContinue
if ($mypy) {
    Print-Header "📘 Python Type Checking (MyPy)"
    try {
        & mypy gateway/app.py --ignore-missing-imports --no-strict-optional 2>&1 | Out-Null
        Print-Success "MyPy type checking passed"
    } catch {
        Print-Warning "MyPy found type issues (non-critical)"
    }
} else {
    Print-Warning "MyPy not installed, skipping type checking"
    Write-Host "Install with: pip install mypy"
}

# ============================================
# 🎨 FRONTEND VALIDATION
# ============================================
Print-Header "🎨 FRONTEND VALIDATION"

Push-Location apps/alchemical-dashboard

# Check if Node.js is available
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Print-Error "Node.js not found"
    exit 1
}

$nodeVersion = & node --version
Print-Success "Node.js version: $nodeVersion"

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Print-Header "📦 Installing dependencies..."
    & npm ci
}

# ESLint check
Print-Header "🧹 ESLint Check"
try {
    $eslintOutput = & npm run lint 2>&1
    if ($eslintOutput -match "error") {
        Print-Error "ESLint found errors"
    } else {
        Print-Success "ESLint check passed"
    }
} catch {
    Print-Warning "ESLint check had issues"
}

# TypeScript strict check
Print-Header "📘 TypeScript Strict Check"
try {
    $tscOutput = & npx tsc --noEmit 2>&1
    if ($tscOutput -match "error") {
        Print-Error "TypeScript strict check failed"
    } else {
        Print-Success "TypeScript strict check passed"
    }
} catch {
    Print-Error "TypeScript strict check failed"
}

# Build check
Print-Header "🏗️  Frontend Build Check"
try {
    $buildOutput = & npm run build 2>&1
    if ($buildOutput -match "error|Error") {
        Print-Error "Frontend build failed"
    } else {
        Print-Success "Frontend build successful"
    }
} catch {
    Print-Error "Frontend build failed"
}

Pop-Location

# ============================================
# 🐳 DOCKER VALIDATION
# ============================================
Print-Header "🐳 DOCKER VALIDATION"

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
    try {
        & docker compose config > $null 2>&1
        Print-Success "Docker Compose validation passed"
    } catch {
        Print-Error "Docker Compose validation failed"
    }
} else {
    Print-Warning "Docker not found, skipping Docker validation"
}

# ============================================
# 📊 SUMMARY
# ============================================
Print-Header "📊 VALIDATION SUMMARY"

Write-Host "Total Errors: $script:ERRORS"
Write-Host "Total Warnings: $script:WARNINGS"

if ($script:ERRORS -eq 0) {
    Write-Host ""
    Write-Host "🎉 All checks passed! Ready to commit." -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "❌ Some checks failed. Please fix errors before committing." -ForegroundColor Red
    exit 1
}
