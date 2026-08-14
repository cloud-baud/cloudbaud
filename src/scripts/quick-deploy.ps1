# Quick Deploy - Competency Platform
# Run this, then paste into Supabase SQL editor

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  📋 STEP 1: Deploy Schema" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

# Copy schema to clipboard
Get-Content supabase_competencies_schema.sql -Raw | Set-Clipboard
Write-Host "✅ Schema SQL copied to clipboard!" -ForegroundColor Green
Write-Host "`n📌 NOW DO THIS:" -ForegroundColor Yellow
Write-Host "   1. Go to the Supabase tab that just opened" -ForegroundColor Cyan
Write-Host "   2. Press Ctrl+A to select all" -ForegroundColor Cyan
Write-Host "   3. Press Ctrl+V to paste the schema SQL" -ForegroundColor Cyan
Write-Host "   4. Click the RUN button (bottom right)" -ForegroundColor Cyan
Write-Host "   5. Wait for success message`n" -ForegroundColor Cyan

Read-Host "Press ENTER when schema deployment is complete"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  📋 STEP 2: Deploy Seed Data" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

# Copy seed data to clipboard
Get-Content supabase_competencies_seed.sql -Raw | Set-Clipboard
Write-Host "✅ Seed data SQL copied to clipboard!" -ForegroundColor Green
Write-Host "`n📌 NOW DO THIS:" -ForegroundColor Yellow
Write-Host "   1. In the same Supabase SQL editor" -ForegroundColor Cyan
Write-Host "   2. Press Ctrl+A to select all" -ForegroundColor Cyan
Write-Host "   3. Press Ctrl+V to paste the seed data SQL" -ForegroundColor Cyan
Write-Host "   4. Click the RUN button again" -ForegroundColor Cyan
Write-Host "   5. Wait for success message
`n" -ForegroundColor Cyan

Read-Host "Press ENTER when seed data deployment is complete"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "📊 Verify in Supabase:" -ForegroundColor Yellow
Write-Host "   • Go to Table Editor" -ForegroundColor Cyan
Write-Host "   • Find 'competencies' table" -ForegroundColor Cyan
Write-Host "   • Should see 8 rows`n" -ForegroundColor Cyan

Write-Host "🧪 Test the pages:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173/competencies/unity-catalog" -ForegroundColor Cyan
Write-Host "   http://localhost:5173/competencies/delta-lake-time-travel" -ForegroundColor Cyan
Write-Host "   http://localhost:5173/competencies/terraform-iac`n" -ForegroundColor Cyan

# Open verification URL
$verify = Read-Host "Open Supabase Table Editor to verify? (Y/N)"
if ($verify -eq 'Y') {
    Start-Process "https://app.supabase.com/project/mvyavzjzdinelcufpzek/editor"
}

Write-Host "`n🎉 All done! Time to test the interactive demos!`n" -ForegroundColor Green
