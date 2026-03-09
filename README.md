# QUASAR

**Intent-based locking collaboration platform** — versioned files, approval workflows, AI code summaries, and global chat. Built for recruiters and teams who want to see a full-stack, production-style repo at a glance.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-green.svg)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-API-black.svg)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791.svg)](https://www.postgresql.org/)

---

## Screenshots

| | |
|---|---|
| ![Login](docs/screenshots/01-login.png) | ![Dashboard](docs/screenshots/02-dashboard.png) |
| **Login** | **Dashboard** — Workspace, AI Module, Attendance, Personal Progress, Top Level Meet, Lock Requests, Global Chat |
| ![Workspace](docs/screenshots/03-workspace-locked.png) | ![Lock Requests](docs/screenshots/10-lock-requests.png) |
| **Workspace** — File tree, editor with lock controls, timeline, Generate AI Analysis | **Lock Requests** — Approve or reject pending lock intents (tech lead / admin) |
| ![AI Report](docs/screenshots/05-ai-report.png) | ![Admin Panel](docs/screenshots/09-admin-user-mgmt.png) |
| **AI Module** — Groq-powered code analysis and reports | **Admin Panel** — User management, roles, system logs |
| ![Attendance](docs/screenshots/07-attendance.png) | ![Personal Progress](docs/screenshots/08-personal-progress.png) |
| **Attendance** — Check-in/out, active users, attendance log | **Personal Progress** — Files you edited, your lock activity |
| ![Active Locks](docs/screenshots/06-admin-active-locks.png) | ![Workspace — Lock Request](docs/screenshots/11-workspace-request.png) |
| **Admin — Active Locks** — Force unlock files | **Workspace** — Lock request submitted, waiting for approval |

---

## In 30 seconds

QUASAR simulates **company-scale collaboration** on a shared codebase: **employees** request locks on files, **tech leads / admins** approve or reject, and everyone benefits from **version history**, **AI-generated reports** (Groq), and **global chat**. Use the diagrams and docs below to understand the repo.

---

## Table of contents

- [System architecture](#-system-architecture)
- [Workflow (intent-based locking)](#-workflow-intent-based-locking)
- [Tech stack](#-tech-stack)
- [Features](#-features)
- [Folder structure](#-folder-structure)
- [Installation](#-installation)
- [Running the app](#-running-the-app)
- [Documentation](#-documentation)

---

## System architecture

High-level: **React SPA** → **Flask REST API** → **PostgreSQL**; optional integrations with **Groq**, **Discord**, and **Jitsi**.

![System architecture](docs/architecture.svg)

| Layer | Role |
|-------|------|
| **Browser** | React app: Dashboard, Workspace, AI Module, Attendance, Admin, Progress. |
| **Flask API** | Auth (JWT), projects/files/versions, locks & intents, AI, admin, attendance, meet, chat, progress. |
| **PostgreSQL** | Users, projects, folders, files, versions, locks, intents, ai_reports, system_logs, attendance, meetings, chat. |
| **External** | Groq (AI), Discord (optional chat), Jitsi (meetings). |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full workflow description.

---

## Workflow (intent-based locking)

Employees request locks; tech leads or admins approve or reject. One active lock per file; saving creates a new version and releases the lock.

![System flow](docs/system-flow.svg)

1. **Employee** → Request Lock → **Intent (PENDING)**  
2. **Tech lead / Admin** → Approve → **Lock ACTIVE** → employee edits and **Save Version** → new version, lock released  
3. **Admin** can force-unlock from the Active Locks panel.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full workflow description.

---

## Tech stack

| Area | Technologies |
|------|--------------|
| **Frontend** | React 19, Vite 7, React Router, Axios, Lucide React |
| **Backend** | Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS, python-dotenv, requests |
| **Database** | PostgreSQL (psycopg2-binary) |
| **Auth** | JWT (Bearer), Werkzeug password hashing |
| **External** | Groq (AI), Discord (optional chat), Jitsi Meet (meetings) |

More detail: [docs/TECHSTACK_AND_APIS.md](docs/TECHSTACK_AND_APIS.md).

---

## Features

- **Authentication & roles** — Username/password login, JWT; roles: `admin`, `tech_lead`, `employee`.
- **Intent-based locking** — Employees request lock → tech lead/admin approve or reject; one active lock per file.
- **Versioned files** — Projects/folders/files in sidebar; initial + saved versions; timeline and history.
- **AI module** — Groq-powered project summaries (structural changes, conflicts, security/validation notes).
- **Admin panel** — User CRUD, active locks, force unlock, system logs.
- **Personal progress** — “Files you edited” and your lock activity.
- **Attendance** — Check-in on login, manual checkout, active users list.
- **Global chat** — DB-backed; optional Discord sync.
- **Top-level meetings** — Tech lead starts/ends Jitsi room; everyone can join via iframe.
- **Demo data** — Scripts for default users (`admin1`, `lead1`, `emp1`) and seed Python files.

---

## Folder structure

```
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── components/ # Editor, FolderTree, LockRequests, ChatPanel, Meet, etc.
│   │   ├── context/   # AuthContext
│   │   ├── pages/     # Dashboard, Workspace, AIModule, Admin, Progress, …
│   │   ├── services/  # api.js (Axios + auth, workspace, lock, version, ai, …)
│   │   └── assets/
│   └── package.json
├── backend/           # Flask API
│   ├── routes/       # auth, projects, folders, files, locks, versions, ai, intents, admin, attendance, meet, chat, progress
│   ├── models/       # User, Project, Folder, File, Version, Lock, Intent, AIReport, SystemLog, …
│   ├── app.py        # App factory, blueprints, seed_data
│   ├── config.py
│   ├── requirements.txt
│   ├── create_default_users.py
│   └── seed_python_files.py
├── docs/
│   ├── architecture.svg
│   ├── system-flow.svg
│   ├── ARCHITECTURE.md
│   ├── screenshots/
│   ├── HOW_TO_RUN.md
│   ├── TECHSTACK_AND_APIS.md
│   └── PORTING_GUIDE.md
├── scripts/           # setup-backend.ps1, setup-frontend.ps1, run-backend.ps1, run-frontend.ps1
├── README.md
├── .gitignore
└── LICENSE
```

---

## Installation

**Prerequisites:** Python 3.10+, Node.js 18+, PostgreSQL, [Groq API key](https://console.groq.com/) (for AI).

1. **Clone the repository** (do not commit `node_modules/` or `backend/.venv/`; they are in `.gitignore`).

2. **Backend**
   - Create `backend/.env`:
     ```env
     DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@HOST:PORT/DBNAME
     JWT_SECRET_KEY=your-long-random-secret
     GROQ_API_KEY=your_groq_api_key
     # Optional: DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID
     ```
   - From repo root (PowerShell): `.\scripts\setup-backend.ps1`  
     Or: `cd backend` → `python -m venv .venv` → activate → `pip install -r requirements.txt`

3. **Frontend**
   - From repo root: `.\scripts\setup-frontend.ps1`  
     Or: `cd frontend` → `npm install`

4. **First run (DB init)**  
   - `cd backend` → activate venv → `python app.py` (creates tables and seed data). Stop with Ctrl+C.  
   - Optional: `python create_default_users.py`, `python seed_python_files.py`

Step-by-step: [docs/HOW_TO_RUN.md](docs/HOW_TO_RUN.md).

---

## Running the app

1. **Backend** (terminal 1):  
   `.\scripts\run-backend.ps1`  
   Or: `cd backend` → activate venv → `python app.py`  
   → API at **http://localhost:5000**

2. **Frontend** (terminal 2):  
   `.\scripts\run-frontend.ps1`  
   Or: `cd frontend` → `npm run dev`  
   → App at **http://localhost:5173**

3. **Login** with demo users: `admin1` / `admin1`, `lead1` / `lead1`, `emp1` / `emp1` (username = password).

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture and workflow diagram descriptions. |
| [docs/HOW_TO_RUN.md](docs/HOW_TO_RUN.md) | Detailed run/setup instructions. |
| [docs/TECHSTACK_AND_APIS.md](docs/TECHSTACK_AND_APIS.md) | Tech stack and external APIs. |
| [docs/PORTING_GUIDE.md](docs/PORTING_GUIDE.md) | Moving the project to another machine. |
| [docs/README.md](docs/README.md) | Index of docs and assets. |
| [scripts/README.md](scripts/README.md) | Setup and run scripts. |

---

## License

[MIT](LICENSE).
