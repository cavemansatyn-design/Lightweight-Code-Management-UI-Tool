## How to Run QUASAR Locally (Windows)

This guide assumes Windows with PowerShell. Run all commands from the **repository root**.

---

## 1. Prerequisites

- **Python**: 3.10+ (`python --version`)
- **Node.js + npm**: Node 18+ (`node --version`, `npm --version`)
- **PostgreSQL**: Local or hosted (e.g. Neon)
- **Groq API key** (for AI features)
- (Optional) **Discord** bot + channel for chat sync

---

## 2. Backend Setup (Flask API)

### 2.1. Create `backend/.env`

```env
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require
JWT_SECRET_KEY=some-long-random-secret-string
GROQ_API_KEY=your_groq_api_key_here

# Optional:
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CHANNEL_ID=your_discord_channel_id_here
```

### 2.2. Virtual environment and dependencies

From repo root:

```powershell
.\scripts\setup-backend.ps1
```

Or manually:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2.3. Initialize database (first run)

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python app.py
```

Stop with `Ctrl+C` after tables are created and seed data is loaded.

### 2.4. Seed demo users (recommended)

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python create_default_users.py
```

Creates: `admin1`/`admin1`, `lead1`/`lead1`, `emp1`/`emp1`.

### 2.5. Seed demo Python files (optional)

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python seed_python_files.py
```

### 2.6. Run backend

```powershell
.\scripts\run-backend.ps1
```

Backend runs at `http://localhost:5000`.

---

## 3. Frontend Setup (React + Vite)

```powershell
.\scripts\setup-frontend.ps1
.\scripts\run-frontend.ps1
```

Or: `cd frontend`, `npm install`, `npm run dev`. Frontend at `http://localhost:5173`.

---

## 4. Logging In

Use demo accounts: **admin1**/admin1, **lead1**/lead1, **emp1**/emp1 (username = password).

---

## 5. Verifying Features

- **Workspace**: Dashboard → Workspace → open file → Request Lock (as emp1).
- **Approve**: As lead1/admin1, use Lock Requests on Dashboard → Approve.
- **AI**: Workspace → Generate AI Analysis, or AI Module → Generate New AI Report.
- **Meeting**: As lead1, Start Global Meeting; others Join Meeting.
- **Chat**: Use Global Chat panel on the right.

---

## 6. Common Issues

- **Cannot log in**: Backend running? Correct `DATABASE_URL`? Run `create_default_users.py` again.
- **AI errors**: Set valid `GROQ_API_KEY` in `backend/.env`.
- **No Python files**: Run `seed_python_files.py` after DB is initialized.
