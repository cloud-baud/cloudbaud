# dump-realwize.ps1 - UTF8 version
$Output = "realwize-pro-structure-$(Get-Date -Format 'yyyyMMdd').md"

"# realwize.pro Repo Dump" | Out-File $Output -Encoding utf8
"Generated: $(Get-Date)" | Add-Content $Output -Encoding utf8
"" | Add-Content $Output -Encoding utf8

"## Directory Tree" | Add-Content $Output -Encoding utf8
'```' | Add-Content $Output -Encoding utf8
Get-ChildItem -Recurse -Directory | Where-Object { $_.FullName -notmatch 'node_modules|\.next|dist|build|\.git|\.turbo|\.vercel|coverage' } | 
  ForEach-Object { $_.FullName.Replace((Get-Location).Path, '.') } | Add-Content $Output -Encoding utf8
'```' | Add-Content $Output -Encoding utf8
"" | Add-Content $Output -Encoding utf8

"## Key Files" | Add-Content $Output -Encoding utf8
$KeyFiles = @("package.json", "tsconfig.json", "next.config.js", "next.config.mjs", "tailwind.config.js", "middleware.ts")
foreach ($file in $KeyFiles) {
  if (Test-Path $file) {
    "### $file" | Add-Content $Output -Encoding utf8
    '```' | Add-Content $Output -Encoding utf8
    Get-Content $file | Add-Content $Output -Encoding utf8
    '```' | Add-Content $Output -Encoding utf8
    "" | Add-Content $Output -Encoding utf8
  }
}

"### App/Pages Routes" | Add-Content $Output -Encoding utf8
Get-ChildItem -Recurse -Include page.tsx,page.js,route.ts,index.tsx -ErrorAction SilentlyContinue | ForEach-Object {
  "#### $($_.FullName)" | Add-Content $Output -Encoding utf8
  '```tsx' | Add-Content $Output -Encoding utf8
  Get-Content $_.FullName -TotalCount 100 | Add-Content $Output -Encoding utf8
  '```' | Add-Content $Output -Encoding utf8
  "" | Add-Content $Output -Encoding utf8
}

"### Supabase / Lib Files" | Add-Content $Output -Encoding utf8
Get-ChildItem -Recurse -Path lib,utils,src -Include *supabase*,*db* -ErrorAction SilentlyContinue | ForEach-Object {
  "#### $($_.FullName)" | Add-Content $Output -Encoding utf8
  '```ts' | Add-Content $Output -Encoding utf8
  Get-Content $_.FullName | Add-Content $Output -Encoding utf8
  '```' | Add-Content $Output -Encoding utf8
  "" | Add-Content $Output -Encoding utf8
}

Write-Host "Done. Created $Output"