# Porting QUASAR to Another Machine

This guide lists **everything you must change** when moving the project from one laptop/server to another.

---

## 1. Copying the Codebase

Copy the project directory (e.g. via zip, git, or shared drive).  
Do **not** copy:

- `backend/.venv/`
- `frontend/node_modules/`

Recreate these on the new machine.

---

## 2. System Requirements on the New Machine

- Python 3.10+
- Node.js 18+ and npm
- Access to a PostgreSQL database (hosted or local)
- Internet for Groq API, optional Discord, Jitsi (meet.jit.si)

---

## 3. Environment Variables & Secrets

Create a fresh `backend/.env` on the new machine. **Never copy someone else’s secrets.**

- **DATABASE_URL**: `postgresql+psycopg2://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require`
- **JWT_SECRET_KEY**: Unique random secret (rotate = everyone re-logs in).
- **GROQ_API_KEY**: Your own Groq key (required for AI).
- **DISCORD_BOT_TOKEN** / **DISCORD_CHANNEL_ID**: Optional, for chat sync.

---

## 4. Backend Setup per Machine

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py          # create tables + seed
python create_default_users.py
python seed_python_files.py   # optional
python app.py          # run server
```

---

## 5. Frontend Setup per Machine

```powershell
cd frontend
npm install
npm run dev
```

To point at a different backend, edit `frontend/src/services/api.js`: set `API_URL` to your backend base URL.

---

## 6. Quick Checklist

1. Copy codebase (no `.venv`, no `node_modules`).
2. Install Python and Node.js.
3. Create `backend/.env` (DATABASE_URL, JWT_SECRET_KEY, GROQ_API_KEY).
4. Backend: venv, pip install, app.py, optional seed scripts.
5. Frontend: npm install, npm run dev.
6. Open app in browser and log in with demo users.
