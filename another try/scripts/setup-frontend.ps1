# QUASAR — Frontend setup (PowerShell)
# Run from repository root: .\scripts\setup-frontend.ps1

$ErrorActionPreference = "Stop"
$frontendDir = Join-Path $PSScriptRoot ".." "frontend"

Write-Host "Setting up frontend in $frontendDir" -ForegroundColor Cyan
Set-Location $frontendDir

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Frontend setup complete." -ForegroundColor Green
Write-Host "Next: Run backend first, then: npm run dev" -ForegroundColor Gray
