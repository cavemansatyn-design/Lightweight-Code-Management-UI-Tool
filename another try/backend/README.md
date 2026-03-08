# QUASAR Backend

Flask REST API: auth (JWT), projects/files/versions, intent-based locking, AI reports (Groq), admin, attendance, meet, chat, progress.

## Structure

| Path | Purpose |
|------|---------|
| `app.py` | App factory, blueprint registration, `seed_data()`. |
| `config.py` | Loads `.env`; `DATABASE_URL`, `JWT_SECRET_KEY`. |
| `routes/` | Blueprints: auth, projects, folders, files, locks, versions, ai, intents, admin, attendance, meet, chat, progress. |
| `models/` | SQLAlchemy models (User, Project, Folder, File, Version, Lock, Intent, AIReport, SystemLog, etc.). |
| `create_default_users.py` | Demo users: admin1, lead1, emp1. |
| `seed_python_files.py` | Demo `.py` files under Core Project. |

## Run

From repo root: `.\scripts\run-backend.ps1`  
Or: `python -m venv .venv` → activate → `pip install -r requirements.txt` → create `backend/.env` → `python app.py` (port 5000).
