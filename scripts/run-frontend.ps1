# QUASAR — Run frontend (PowerShell)
# Run from repository root: .\scripts\run-frontend.ps1

$frontendDir = Join-Path $PSScriptRoot ".." "frontend"
Set-Location $frontendDir
npm run dev
