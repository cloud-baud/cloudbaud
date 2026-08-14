# CloudBaud Development Environment Startup Script
# This script ensures a clean dev environment with proper port allocation

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CloudBaud Development Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill any existing Node processes on port 17117
Write-Host "[1/6] Clearing port 17117..." -ForegroundColor Yellow
try {
    # limit to windows
    if ($IsWindows) {
        # Try native taskkill first for speed if we can find the PID
        $tcp = Get-NetTCPConnection -LocalPort 17117 -ErrorAction SilentlyContinue
        if ($tcp) {
            $pidToKill = $tcp.OwningProcess
            if ($pidToKill -gt 0) {
                 Write-Host "  Found process $pidToKill on port 17117. Killing..." -ForegroundColor Yellow
                 Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
    }
    
    # Use kill-port as a backup/standard way
    cmd /c "npx --yes kill-port 17117" | Out-Null
    Write-Host "  ✓ Port 17117 cleared" -ForegroundColor Green
}
catch {
    Write-Host "  ⚠ Output from kill-port: $_" -ForegroundColor DarkGray
}

# Step 2: Clean up any orphaned node processes from this project
Write-Host ""
Write-Host "[2/6] Cleaning up orphaned Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*cloudbaud.com*" -or $_.CommandLine -like "*vite*"
}
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "  Stopping Node process $($_.Id)..." -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "  ✓ Cleaned up orphaned processes" -ForegroundColor Green
}
else {
    Write-Host "  ✓ No orphaned processes found" -ForegroundColor Green
}

# Step 3: Verify npm dependencies
Write-Host ""
Write-Host "[3/6] Verifying npm dependencies..." -ForegroundColor Yellow
if (-Not (Test-Path "node_modules")) {
    Write-Host "  node_modules not found. Running npm install..." -ForegroundColor Yellow
    npm install
    Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "  ✓ Dependencies verified" -ForegroundColor Green
}

# Step 4: Check System Dependencies
Write-Host ""
Write-Host "[4/6] Checking System Dependencies..." -ForegroundColor Yellow

# 4.1: Ollama
try {
    Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -ErrorAction Stop | Out-Null
    Write-Host "  ✓ Ollama is running and ready" -ForegroundColor Green
}
catch {
    Write-Host "  ⚠ Ollama is not running (AI features will be limited)" -ForegroundColor DarkYellow
    Write-Host "    To start Ollama: Run 'ollama serve' in a separate terminal" -ForegroundColor DarkGray
}

# 4.2: Supabase
$supaUrl = "https://knhrygguhgfpimaogfkw.supabase.co"
try {
    Invoke-WebRequest -Uri $supaUrl -Method HEAD -ErrorAction Stop | Out-Null
    Write-Host "  ✓ Supabase (TEST) is reachable" -ForegroundColor Green
}
catch {
    Write-Host "  ⚠ Supabase (TEST) is unreachable" -ForegroundColor Red
}

# 4.3: PDF Worker
$pdfUrl = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
try {
    Invoke-WebRequest -Uri $pdfUrl -Method HEAD -ErrorAction Stop | Out-Null
    Write-Host "  ✓ PDF.js Worker is reachable" -ForegroundColor Green
}
catch {
    Write-Host "  ⚠ PDF.js Worker is unreachable (Check Internet)" -ForegroundColor Red
}

# Step 5: Tax DB Status
Write-Host ""
Write-Host "[5/6] Checking Tax Database Status..." -ForegroundColor Yellow
if (Test-Path "scripts/deploy-tax-db.ps1") {
    Write-Host "  ℹ To seed/reset Tax DB: Run '.\scripts\deploy-tax-db.ps1'" -ForegroundColor Gray
}

# Step 6: Display environment info
Write-Host ""
Write-Host "[6/6] Environment Information:" -ForegroundColor Yellow
Write-Host "  Project: CloudBaud.com" -ForegroundColor White
Write-Host "  Dev Server Port: 17117" -ForegroundColor White
Write-Host "  URL: http://localhost:17117" -ForegroundColor White
Write-Host "  HMR: Auto-assigned (WebSocket)" -ForegroundColor White
Write-Host ""

# Step 6: Start the dev server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Vite Dev Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor DarkGray
Write-Host ""

# Start the dev server
npm run dev
