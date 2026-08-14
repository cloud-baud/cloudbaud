# Deploy Tax Database Schema to Supabase TEST DB (Multi-Schema Architecture)
$ErrorActionPreference = "Stop"

$dbUrl = "postgresql://postgres.knhrygguhgfpimaogfkw:TxfgDqdaG49DCvGd@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
$sqlFile = "src/data/tax_deploy_multi_schema.sql"
$secureFile = "secure_finance_api.sql"
$rpcFile = "src/data/tax_rpc_helpers.sql" 
$popUserFunc = "src/data/populate_coa_func.sql"
$seedFile = "src/data/seed_2017_data.sql"

Write-Host "📊 Deploying Complete Finance Stack to TEST DB..." -ForegroundColor Cyan
Write-Host "🔗 Target: knhrygguhgfpimaogfkw.supabase.co" -ForegroundColor Yellow

# Read SQL files
$sql = Get-Content $sqlFile -Raw
$secureSql = Get-Content $secureFile -Raw
$rpcSql = Get-Content $rpcFile -Raw
$popUserSql = Get-Content $popUserFunc -Raw
$seedSql = Get-Content $seedFile -Raw

$combinedSql = $sql + "`n`n-- SECURITY`n" + $secureSql + "`n`n-- POPULATE FUNC`n" + $popUserSql + "`n`n-- RPC`n" + $rpcSql + "`n`n-- SEED`n" + $seedSql

Write-Host "📄 Schema SQL loaded ($($sql.Length) bytes)" -ForegroundColor Green
Write-Host "📄 RPC Helpers loaded ($($rpcSql.Length) bytes)" -ForegroundColor Green
Write-Host "📄 2017 Seed Data loaded ($($seedSql.Length) bytes)" -ForegroundColor Green

# Try to use psql if available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if ($psqlPath) {
    Write-Host "✅ Using psql to execute..." -ForegroundColor Green
    $env:PGPASSWORD = "TxfgDqdaG49DCvGd"
    psql -h "aws-1-ap-south-1.pooler.supabase.com" -p 5432 -U "postgres.knhrygguhgfpimaogfkw" -d "postgres" -f $sqlFile
    psql -h "aws-1-ap-south-1.pooler.supabase.com" -p 5432 -U "postgres.knhrygguhgfpimaogfkw" -d "postgres" -f $secureFile
    psql -h "aws-1-ap-south-1.pooler.supabase.com" -p 5432 -U "postgres.knhrygguhgfpimaogfkw" -d "postgres" -f $popUserFunc
    psql -h "aws-1-ap-south-1.pooler.supabase.com" -p 5432 -U "postgres.knhrygguhgfpimaogfkw" -d "postgres" -f $rpcFile
    psql -h "aws-1-ap-south-1.pooler.supabase.com" -p 5432 -U "postgres.knhrygguhgfpimaogfkw" -d "postgres" -f $seedFile
    Write-Host "✅ Schema and data deployed successfully!" -ForegroundColor Green
}
else {
    Write-Host "⚠️  psql not found. Opening Supabase SQL Editor..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Combined SQL (Full Finance Stack) has been copied to clipboard!" -ForegroundColor Green
    Write-Host "👉 Paste it into the Supabase SQL Editor and click RUN" -ForegroundColor Cyan
    
    # Copy combined SQL to clipboard
    Set-Clipboard -Value $combinedSql
    
    # Open Supabase SQL Editor
    Start-Process "https://supabase.com/dashboard/project/knhrygguhgfpimaogfkw/sql/new"
}
