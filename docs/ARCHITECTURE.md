# QUASAR Architecture

This document explains the system architecture and workflow. Use it to generate or update `architecture.png` and `system-flow.png` (e.g. export from Mermaid or draw in your preferred tool).

---

## 1. System architecture (high-level)

QUASAR is a **SPA + REST API** stack:

- **Frontend**: React (Vite) SPA — UI, routing, auth context, API client (Axios).
- **Backend**: Flask REST API — auth (JWT), projects/files/versions, locking & intents, AI, admin, attendance, meet, chat.
- **Database**: PostgreSQL — users, projects, folders, files, versions, locks, intents, ai_reports, system_logs, attendance, meetings, chat_messages.
- **External**: Groq (AI), optional Discord (chat sync), Jitsi (video meetings).

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React SPA)                       │
│  Landing | Login | Dashboard | Workspace | AI | Attendance | …  │
└────────────────────────────┬────────────────────────────────────┘
                              │ HTTP + JWT
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Flask API (backend)                            │
│  /api/auth | /api/projects | /api/files | /api/locks | /api/ai … │
└────────────┬──────────────────────────────┬─────────────────────┘
             │                               │
             ▼                               ▼
┌──────────────────────┐       ┌──────────────────────────────────┐
│   PostgreSQL         │       │  External services                │
│   (all app data)     │       │  Groq • Discord (opt) • Jitsi     │
└──────────────────────┘       └──────────────────────────────────┘
```

**Diagram placeholder:** Save or export this as `docs/architecture.png` for the README.

---

## 2. Intent-based locking workflow

Flow for employees (request lock) and tech leads/admins (approve/reject):

1. **Employee** opens a file in Workspace → clicks **Request Lock** → backend creates an **Intent** with status `PENDING`.
2. **Tech lead / Admin** sees the request in **Lock Requests** on the Dashboard → **Approve** or **Reject**.
3. On **Approve**, backend creates an active **Lock** for that file and the employee can edit.
4. Employee edits and clicks **Save Version** → backend creates a new **Version**, releases the lock, logs `VERSION_SAVED`.
5. **Admin** can view **Active Locks** and **Force unlock** if needed.

```
[Employee]  Request Lock  →  [Intent PENDING]
                                  ↓
[Tech Lead/Admin]  Approve  →  [Lock ACTIVE]  →  [Employee] Edit + Save Version
                    Reject  →  [Intent REJECTED]           →  New Version + Lock released
```

**Diagram placeholder:** Save or export this as `docs/system-flow.png` for the README.

---

## 3. Main backend domains

| Domain    | Purpose |
|----------|---------|
| Auth     | Login, register, JWT, attendance check-in/out |
| Projects | List projects, folder/file tree (structure) |
| Files    | CRUD files, get content, lock intent creation |
| Locks    | Lock status, cancel lock |
| Intents  | Pending intents, approve, reject |
| Versions | Save version, version history |
| AI       | Generate AI report (Groq), list/get reports |
| Admin    | Users CRUD, active locks, force unlock, system logs |
| Attendance | List/active attendance, manual checkout |
| Meet     | Start/end global meeting (Jitsi room) |
| Chat     | Messages, send (DB + optional Discord) |
| Progress | Per-user progress (files edited, lock activity) |

---

## 4. Frontend structure (concise)

- **Pages:** Landing, Login, Register, Dashboard, Workspace, AIModule, Attendance, AdminPanel, PersonalProgress, PlaceholderModule.
- **Components:** Topbar, FolderTree, Editor, Timeline, LockRequests, ActiveLocks, ChatPanel, Meet.
- **Context:** AuthContext (user, role, login, logout).
- **Services:** `api.js` — axios instance + namespaced methods (auth, workspace, lock, version, ai, admin, attendance, meet, progress, chat).

This layout supports a scalable, recruiter-friendly repo: add real `architecture.png` and `system-flow.png` when you export from the diagrams above or from your own tools.
