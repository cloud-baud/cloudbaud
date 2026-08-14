# Deploy Tax Storage Setup to Supabase
# This script executes the tax storage SQL setup using Supabase REST API

$ErrorActionPreference = "Stop"

# Load environment variables (local only: prefer .env.test, then .env — never committed)
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$envFile = $null
foreach ($c in @((Join-Path $root '.env.test'), (Join-Path $root '.env'))) {
    if (Test-Path $c) { $envFile = $c; break }
}
if (-not $envFile) {
    Write-Error "Missing .env.test or .env at repo root. Copy .env.example to .env.test and fill values."
    exit 1
}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

# Get Supabase credentials for TEST environment
$supabaseUrl = $env:VITE_SUPABASE_URL_TEST
$serviceRoleKey = $env:VITE_SUPABASE_SERVICE_ROLE_KEY_TEST
$dbPassword = $env:VITE_SUPABASE_DB_PASSWORD_TEST

if (-not $supabaseUrl -or -not $serviceRoleKey) {
    Write-Error "Missing Supabase credentials in .env.test (or .env)"
    exit 1
}

Write-Host "Deploying tax storage setup to TEST database..." -ForegroundColor Cyan
Write-Host "Supabase URL: $supabaseUrl" -ForegroundColor Gray

# Read the SQL file
$sqlFile = Join-Path $PSScriptRoot ".." "supabase\sql\supabase_tax_storage_setup.sql"
$sqlContent = Get-Content $sqlFile -Raw

# Execute SQL using Supabase REST API
$headers = @{
    "apikey"        = $serviceRoleKey
    "Authorization" = "Bearer $serviceRoleKey"
    "Content-Type"  = "application/json"
}

$body = @{
    query = $sqlContent
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body
    Write-Host "✓ Tax storage setup completed successfully!" -ForegroundColor Green
    Write-Host $response
}
catch {
    # If the RPC doesn't exist, we need to use a different approach
    Write-Host "Direct SQL execution not available. Using alternative method..." -ForegroundColor Yellow
    
    # Split SQL into individual statements and execute via PostgREST
    Write-Host "Please run the SQL file manually in Supabase SQL Editor:" -ForegroundColor Yellow
    Write-Host "1. Go to: $supabaseUrl/project/sql/new" -ForegroundColor Cyan
    Write-Host "2. Copy contents from: $sqlFile" -ForegroundColor Cyan
    Write-Host "3. Paste and click 'Run'" -ForegroundColor Cyan
}
