# Scripts

Helper scripts for QUASAR (run from repository root).

| Script | Description |
|--------|-------------|
| `setup-backend.ps1` | Create Python venv and install backend dependencies. |
| `setup-frontend.ps1` | Run `npm install` in `frontend/`. |
| `run-backend.ps1` | Activate venv and run `python app.py` (Flask on port 5000). |
| `run-frontend.ps1` | Run `npm run dev` (Vite on port 5173). |

**Windows (PowerShell):**
```powershell
.\scripts\setup-backend.ps1
.\scripts\setup-frontend.ps1
# Then in two terminals:
.\scripts\run-backend.ps1
.\scripts\run-frontend.ps1
```

**Linux/macOS:** Use equivalent bash commands (create venv, `pip install -r backend/requirements.txt`, `npm install` in frontend, then `python backend/app.py` and `npm run dev` in frontend).
