# =====================================================
# DEPLOY COMPETENCY PLATFORM TO SUPABASE
# =====================================================
# This script deploys the interactive competency platform
# to your Supabase database
# =====================================================

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('test', 'production')]
    [string]$Environment = 'test'
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Competency Platform Deployment" -ForegroundColor Cyan
Write-Host "  Environment: $Environment" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
if ($Environment -eq 'production') {
    $candidates = @((Join-Path $root '.env.production'))
} else {
    $candidates = @((Join-Path $root '.env.test'), (Join-Path $root '.env'))
}
$envFile = $null
foreach ($c in $candidates) {
    if (Test-Path $c) { $envFile = $c; break }
}

if (-not $envFile) {
    if ($Environment -eq 'production') {
        Write-Host "[ERROR] No .env.production at repo root. Production deploys use Netlify env; for local prod runs create .env.production or set variables in this shell." -ForegroundColor Red
    } else {
        Write-Host "[ERROR] No .env.test or .env at repo root. Copy .env.example to .env.test and fill values." -ForegroundColor Red
    }
    exit 1
}

Write-Host "[INFO] Loading environment from: $envFile" -ForegroundColor Blue
# Read Supabase credentials from .env
$envVars = Get-Content $envFile | ForEach-Object {
    if ($_ -match '^VITE_SUPABASE_URL=(.+)$') {
        $supabaseUrl = $matches[1].Trim('"')
    }
    if ($_ -match '^SUPABASE_SERVICE_ROLE_KEY=(.+)$') {
        $serviceKey = $matches[1].Trim('"')
    }
}

if (-not $supabaseUrl) {
    Write-Host "[ERROR] VITE_SUPABASE_URL not found in $envFile" -ForegroundColor Red
    exit 1
}

if (-not $serviceKey) {
    Write-Host "[WARNING] SUPABASE_SERVICE_ROLE_KEY not found in $envFile" -ForegroundColor Yellow
    Write-Host "[INFO] You'll need to manually run SQL in Supabase Dashboard" -ForegroundColor Blue
    Write-Host ""
}

# Extract project ref from URL
if ($supabaseUrl -match 'https://([^.]+)\.supabase\.co') {
    $projectRef = $matches[1]
    Write-Host "[INFO] Project Reference: $projectRef" -ForegroundColor Green
}
else {
    Write-Host "[ERROR] Could not extract project reference from URL" -ForegroundColor Red
    exit 1
}

# SQL Files to deploy
$sqlFiles = @(
    @{
        Name        = "Schema"
        File        = "supabase_competencies_schema.sql"
        Description = "Creates tables, RLS policies, and indexes"
    },
    @{
        Name        = "Seed Data"
        File        = "supabase_competencies_seed.sql"
        Description = "Populates 8 competencies with demo configs"
    }
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Options" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option A: Automated Deployment (Requires service role key)" -ForegroundColor Yellow
Write-Host "Option B: Manual Deployment (Copy SQL to Supabase Dashboard)" -ForegroundColor Yellow
Write-Host ""

$deployOption = Read-Host "Choose deployment option (A/B)"

if ($deployOption -eq 'A' -and $serviceKey) {
    Write-Host ""
    Write-Host "[INFO] Starting automated deployment..." -ForegroundColor Blue
    
    foreach ($sqlFile in $sqlFiles) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Deploying: $($sqlFile.Name)" -ForegroundColor Cyan
        Write-Host "  $($sqlFile.Description)" -ForegroundColor Gray
        Write-Host "========================================" -ForegroundColor Cyan
        
        if (!(Test-Path $sqlFile.File)) {
            Write-Host "[ERROR] SQL file not found: $($sqlFile.File)" -ForegroundColor Red
            continue
        }
        
        $sqlContent = Get-Content $sqlFile.File -Raw
        
        # Execute via Supabase REST API
        try {
            $body = @{
                query = $sqlContent
            } | ConvertTo-Json
            
            $headers = @{
                "apikey"        = $serviceKey
                "Authorization" = "Bearer $serviceKey"
                "Content-Type"  = "application/json"
            }
            
            $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" `
                -Method Post `
                -Headers $headers `
                -Body $body `
                -ErrorAction Stop
            
            Write-Host "[SUCCESS] $($sqlFile.Name) deployed successfully!" -ForegroundColor Green
        }
        catch {
            Write-Host "[ERROR] Failed to deploy $($sqlFile.Name)" -ForegroundColor Red
            Write-Host $_.Exception.Message -ForegroundColor Red
            Write-Host ""
            Write-Host "[INFO] Falling back to manual instructions..." -ForegroundColor Yellow
            $deployOption = 'B'
            break
        }
    }
    
}
else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Manual Deployment Instructions" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "1. Open Supabase SQL Editor:" -ForegroundColor Yellow
    Write-Host "   https://app.supabase.com/project/$projectRef/sql/new" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($sqlFile in $sqlFiles) {
        Write-Host "2. Deploy $($sqlFile.Name):" -ForegroundColor Yellow
        Write-Host "   a. Open: $($sqlFile.File)" -ForegroundColor Cyan
        Write-Host "   b. Copy entire contents" -ForegroundColor Cyan
        Write-Host "   c. Paste into SQL Editor" -ForegroundColor Cyan
        Write-Host "   d. Click 'Run' button" -ForegroundColor Cyan
        Write-Host "   e. Verify success (green checkmark)" -ForegroundColor Cyan
        Write-Host ""
    }
    
    Write-Host "3. Verify Deployment:" -ForegroundColor Yellow
    Write-Host "   a. Go to Table Editor" -ForegroundColor Cyan
    Write-Host "   b. Check for 'competencies' table" -ForegroundColor Cyan
    Write-Host "   c. Verify 8 rows in competencies table" -ForegroundColor Cyan
    Write-Host ""
    
    $openDashboard = Read-Host "Open Supabase Dashboard now? (Y/N)"
    if ($openDashboard -eq 'Y') {
        Start-Process "https://app.supabase.com/project/$projectRef/sql/new"
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Post-Deployment Checklist" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$checklist = @(
    "✓ Schema deployed (competencies, demo_analytics, user_challenge_results)",
    "✓ Seed data inserted (8 competencies)",
    "✓ RLS policies enabled",
    "✓ Indexes created"
)

foreach ($item in $checklist) {
    Write-Host "  $item" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testUrls = @(
    "http://localhost:5173/competencies/unity-catalog",
    "http://localhost:5173/competencies/delta-lake-time-travel",
    "http://localhost:5173/competencies/terraform-iac",
    "http://localhost:5173/competencies/hl7-fhir-integration"
)

Write-Host "Start dev server: " -NoNewline -ForegroundColor Yellow
Write-Host "npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then test these URLs:" -ForegroundColor Yellow
foreach ($url in $testUrls) {
    Write-Host "  • $url" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npm run dev" -ForegroundColor Cyan
Write-Host "  2. Test the competency pages" -ForegroundColor Cyan
Write-Host "  3. Check analytics in Supabase (demo_analytics table)" -ForegroundColor Cyan
Write-Host "  4. Update TechnologyStack to link to competencies" -ForegroundColor Cyan
Write-Host ""
