# Tech Stack & APIs

Summary of technologies and external APIs used by QUASAR.

---

## 1. High-Level Architecture

- **Frontend**: React + Vite SPA.
- **Backend**: Flask REST API (Python).
- **Database**: PostgreSQL (users, files, versions, locks, logs, etc.).
- **External**: Groq (AI), optional Discord (chat), Jitsi (video meetings).

---

## 2. Frontend Stack (`frontend/`)

- **React 19**, **React Router**, **Vite 7**, **Axios**.
- **AuthContext** for user/role and login/logout.
- **api.js**: `baseURL = http://localhost:5000/api`, JWT in `Authorization` header.
- Routes: `/dashboard`, `/workspace/:projectId`, `/ai`, `/attendance`, `/admin`, `/progress`.

---

## 3. Backend Stack (`backend/`)

- **Flask**, **Flask-SQLAlchemy**, **Flask-JWT-Extended**, **Flask-CORS**, **psycopg2-binary**, **python-dotenv**, **requests**.
- Models: User, Project, Folder, File, Version, Lock, Intent, AIReport, SystemLog, Attendance, GlobalMeeting, ChatMessage.
- Config from `.env`: `DATABASE_URL`, `JWT_SECRET_KEY`, etc.

---

## 4. External APIs

- **Groq**: AI report generation (`/api/ai/generate-ai-report`), key in `GROQ_API_KEY`.
- **Discord**: Optional chat sync via `DISCORD_BOT_TOKEN`, `DISCORD_CHANNEL_ID`.
- **Jitsi Meet**: Embedded meetings; backend stores room name, frontend iframe to `meet.jit.si/<room>`.

---

## 5. Environment Variables

- **Required**: `DATABASE_URL`, `JWT_SECRET_KEY`, `GROQ_API_KEY`.
- **Optional**: `DISCORD_BOT_TOKEN`, `DISCORD_CHANNEL_ID`.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for diagram descriptions and [HOW_TO_RUN.md](./HOW_TO_RUN.md) for setup.
