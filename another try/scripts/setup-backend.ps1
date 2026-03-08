# QUASAR — Backend setup (PowerShell)
# Run from repository root: .\scripts\setup-backend.ps1

$ErrorActionPreference = "Stop"
$backendDir = Join-Path $PSScriptRoot ".." "backend"

Write-Host "Setting up backend in $backendDir" -ForegroundColor Cyan
Set-Location $backendDir

if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

Write-Host "Activating virtual environment and installing dependencies..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

Write-Host "Backend setup complete." -ForegroundColor Green
Write-Host "Next: Create backend\.env (see docs or README), then run: python app.py" -ForegroundColor Gray
