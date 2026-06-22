# AGENTS.md — attendance-dashboard

## Quick start

```bash
cp .env.example .env   # fill in 6 VITE_FIREBASE_* vars
npm install
npm run dev            # http://localhost:5173
```

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the built site locally |
| `npm run lint` | ESLint (JS + JSX) |

No test or typecheck commands exist — the project is plain JSX, no TypeScript.

## Project structure

```
src/
  main.jsx          # entrypoint
  App.jsx           # BrowserRouter, 4 routes
  pages/            # LiveStatus, Attendance, Students, Settings
  components/       # Sidebar, StatusBadge, StudentFormModal, etc.
  lib/
    firebase.js     # Firebase init from import.meta.env.VITE_FIREBASE_*
    students.js     # Firestore read/write helpers for students collection
    attendance.js   # Firestore read helpers for attendance collection
```

## Key facts

- **Framework:** React 19 + Vite 8 + React Router v7 (SPA). No SSR, no state library.
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"` in `index.css`, NOT the old `@tailwind` directives).
- **Data layer:** Firebase Firestore via raw `onSnapshot` subscriptions (no React Query, no context).
- **Data model:** `students/{id}` (name, section, rfidUid, currentStatus, lastTapTime, parentChannel, parentChatId) and `attendance/{autoId}` (date, studentId, status, timeIn, timeOut).
- **n8n workflow** (separate system) writes attendance records and flips `currentStatus`. The dashboard reads both collections and writes only to `students` (CRUD).
- **Env:** 6 `VITE_FIREBASE_*` vars → `.env` (local) or Vercel project env vars.
- **Vercel deploy:** `vercel.json` rewrites all paths to `/index.html` (SPA fallback).
- **Firestore rules** are wide-open (`allow read, write: if true`) — temporary for dev. Lock down via Firebase Auth before going live.
