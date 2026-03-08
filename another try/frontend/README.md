# QUASAR Frontend

React 19 + Vite 7 SPA. Connects to the Flask backend at `http://localhost:5000/api` (see `src/services/api.js`).

## Structure

| Path | Purpose |
|------|---------|
| `src/pages/` | Route-level views: Landing, Login, Register, Dashboard, Workspace, AIModule, Attendance, AdminPanel, PersonalProgress. |
| `src/components/` | Reusable UI: Topbar, FolderTree, Editor, Timeline, LockRequests, ActiveLocks, ChatPanel, Meet. |
| `src/context/` | AuthContext (user, role, login, logout). |
| `src/services/api.js` | Axios instance + namespaced API (auth, workspace, lock, version, ai, admin, attendance, meet, progress, chat). |

## Scripts

- `npm run dev` — Development server (Vite).
- `npm run build` — Production build.
- `npm run preview` — Preview production build.
