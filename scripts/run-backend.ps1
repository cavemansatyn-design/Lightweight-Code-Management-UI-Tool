# QUASAR — Run backend (PowerShell)
# Run from repository root: .\scripts\run-backend.ps1

$backendDir = Join-Path $PSScriptRoot ".." "backend"
Set-Location $backendDir

if (Test-Path ".venv\Scripts\Activate.ps1") {
    & .\.venv\Scripts\Activate.ps1
}
python app.py
