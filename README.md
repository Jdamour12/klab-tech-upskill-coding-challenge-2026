# Taskly

A full-stack task management system built for the kLab Tech Upskill Program coding challenge. Users register/log in, then create, view, edit, delete, search, filter, and paginate through their own tasks — with a custom dashboard-style UI (sidebar navigation, side drawers, stat cards).

## Live Demo

- **App:** https://taskly-challenge.vercel.app
- **API:** https://taskly-api-n610.onrender.com
- **API docs (Swagger UI):** https://taskly-api-n610.onrender.com/api-docs

> The backend is on Render's free tier, which spins down after ~15 minutes of inactivity. The **first** request after a period of idleness can take 30–50 seconds to respond while it wakes up — this is a known free-tier trade-off, not a bug. Hitting `/health` once will "warm it up" before a demo.

## Technologies Used

**Frontend**
- React 19 (Vite)
- Tailwind CSS v4 — utility-first styling with no separate config file needed (v4 uses a single `@import "tailwindcss"` in [client/src/index.css](client/src/index.css))
- `lucide-react` — icon set
- A small hand-built UI kit ([client/src/components/ui](client/src/components/ui)) — Button, Card, Badge, Drawer, Table, Pagination, StatCard, etc. — following a design language of amber/ink brand colors, Lora (serif headings) + Poppins (sans body), and a hover-expanding sidebar rail
- React Context (`AuthContext`) for auth state — no external state library needed for an app this size
- Deployed on **Vercel**

**Backend**
- Node.js + Express — REST API
- `pg` (node-postgres) — direct, parameterized SQL queries against Postgres (no ORM, so the data layer stays transparent)
- `jsonwebtoken` + `bcryptjs` — JWT-based authentication with hashed passwords
- `swagger-ui-express` — interactive API documentation
- `jest` + `supertest` — integration tests against a real Postgres database
- Deployed on **Render** (Web Service, defined as code in [render.yaml](render.yaml))

**Database**
- PostgreSQL — [Neon](https://neon.tech) (serverless Postgres) in production, Docker Compose for local development

## Project Structure

```
.
├── client/                       React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── ui/               Hand-built design system: Button, Card, Badge, Drawer, Table, Pagination, StatCard, ...
│       │   ├── layout/            Sidebar, PageShell, PageHeader
│       │   ├── auth/              AuthLayout (centered auth screen shell)
│       │   ├── tasks/             TaskFormDrawer, TaskViewDrawer
│       │   ├── AuthForm.jsx        Login / sign-up form
│       │   ├── TaskManager.jsx     Main dashboard: stats, filters, table, drawers
│       │   └── Toast.jsx
│       ├── context/AuthContext.jsx  Login/register/logout, token persistence
│       ├── hooks/useToast.js
│       ├── lib/cn.js               className-join helper
│       └── api.js                  fetch wrapper for the REST API
├── server/                        Express REST API
│   ├── src/
│   │   ├── db/                    connection pool, schema.sql, init script
│   │   ├── controllers/           request handlers + validation
│   │   ├── middleware/            JWT auth guard
│   │   ├── routes/                route definitions
│   │   ├── swagger.js             OpenAPI spec served at /api-docs
│   │   ├── app.js                 Express app (exported for tests)
│   │   └── index.js               entry point (starts the HTTP server)
│   └── tests/                     Jest + Supertest integration tests
├── docker-compose.yml             Postgres container for local development
└── render.yaml                    Render Blueprint (Infrastructure as Code) for the API service
```

## Prerequisites

- Node.js 18+
- Docker Desktop (for local Postgres) — or any local/hosted PostgreSQL instance if you prefer

## How to Install and Run Locally

### 1. Start the database

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with credentials matching `server/.env.example` (`taskuser` / `taskpass` / `taskdb`).

If you'd rather use an existing local Postgres install or a hosted one (Neon, etc.), just update `DATABASE_URL` in `server/.env` instead.

### 2. Set up and run the backend

```bash
cd server
cp .env.example .env   # then set JWT_SECRET to any long random string
npm install
npm run db:init   # creates the users/tasks tables
npm run dev       # starts the API on http://localhost:4000
```

### 3. Set up and run the frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev       # starts the app on http://localhost:5173
```

Open http://localhost:5173, sign up for an account, and start creating tasks.

### Running tests

```bash
cd server
npm test
```

Tests run against the real database pointed to by `DATABASE_URL` (truncating `tasks`/`users` between runs), so start Postgres first.

## Environment Variables

**`server/.env`**

| Variable | Purpose |
|---|---|
| `PORT` | Port the API listens on (Render sets this automatically in production) |
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Secret used to sign/verify auth tokens |
| `CLIENT_ORIGIN` | Allowed CORS origin(s) for the frontend — comma-separated if more than one (e.g. the deployed Vercel URL **and** `http://localhost:5173` for local dev against a deployed API) |

**`client/.env`**

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

## Database Setup

The schema lives in [server/src/db/schema.sql](server/src/db/schema.sql) — a `users` table and a `tasks` table with a `user_id` foreign key so each user only ever sees their own tasks:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed')),
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

`npm run db:init` (inside `server/`) runs this file against whatever `DATABASE_URL` points to — local Docker Postgres or a hosted one like Neon. It's idempotent (`CREATE TABLE IF NOT EXISTS`), so it's safe to re-run.

## API Endpoints

All `/tasks` routes require an `Authorization: Bearer <token>` header (obtained from `/auth/login` or `/auth/register`) and only ever operate on the authenticated user's own tasks.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/register` | Create an account, returns a JWT |
| `POST` | `/auth/login` | Log in, returns a JWT |
| `GET` | `/auth/me` | Get the current authenticated user |
| `GET` | `/tasks` | List tasks — supports `?status=`, `?search=`, `?page=`, `?limit=` |
| `GET` | `/tasks/:id` | Get one task |
| `POST` | `/tasks` | Create a task |
| `PUT` | `/tasks/:id` | Update a task |
| `DELETE` | `/tasks/:id` | Delete a task |

Interactive documentation (try-it-out included) is served at `/api-docs` — locally at http://localhost:4000/api-docs, or live at https://taskly-api-n610.onrender.com/api-docs.

Example `POST /tasks` body:

```json
{
  "title": "Write README",
  "description": "Document setup steps",
  "status": "Pending",
  "priority": "High"
}
```

Example `GET /tasks` response:

```json
{
  "data": [{ "id": 1, "title": "Write README", "status": "Pending", "priority": "High", "user_id": 1, "created_at": "..." }],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

## Deployment Architecture

| Layer | Platform | Why |
|---|---|---|
| Frontend | **Vercel** | Zero-config static hosting for Vite/React, global CDN, automatic HTTPS, git-push-to-deploy. |
| Backend | **Render** (Web Service) | Runs the Express app as a normal long-lived Node process — a natural fit, since it already expects a persistent `pg` connection pool rather than being rewritten around serverless functions (Vercel's backend model). Free tier, git-integrated auto-deploy, service defined as code in [render.yaml](render.yaml). |
| Database | **Neon** (serverless Postgres) | Same Postgres wire protocol as local Docker Postgres, so no code changes were needed — only `DATABASE_URL`. Chosen over Render's own free Postgres because Render deletes free databases after 30 days, while Neon's free tier persists indefinitely. Connections go through Neon's pooled endpoint (PgBouncer), which matters because the free tier has a low native connection cap and the app keeps a persistent connection pool open. |

Deploying the backend to a new Render service or elsewhere only requires setting three environment variables (`DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`) — everything else (build command, start command, health check) is captured in `render.yaml`.

## Key Technical Decisions

- **No ORM.** Queries go through `pg` directly with parameterized SQL (e.g. `$1`, `$2` placeholders) rather than an ORM like Prisma or Sequelize. This keeps the data access layer small and fully explicit — every query is plain SQL, which is easier to reason about and to defend/explain in review.
- **Status and priority are constrained at the database level** via `CHECK` constraints, not just validated in the app layer, so invalid values can't slip in even from a direct DB write.
- **Validation lives in the controllers** and returns descriptive 400 errors instead of relying on the database to reject bad input as the first line of defense.
- **JWT auth, stateless.** `/auth/login` and `/auth/register` issue a signed JWT (7-day expiry) containing the user id; the `requireAuth` middleware ([server/src/middleware/auth.js](server/src/middleware/auth.js)) verifies it on every `/tasks` request and attaches `req.userId`. No server-side session store is needed. Passwords are hashed with bcrypt, never stored or returned in plaintext.
- **Tasks are scoped per-user** at the query level (`WHERE user_id = $1` on every read/write), not just hidden in the UI — a user cannot read or modify another user's task even by guessing an id.
- **Search + pagination share one query path.** `GET /tasks` builds up a single parameterized `WHERE` clause for `status`/`search` and reuses it for both the `COUNT(*)` and the paginated `SELECT`, so the returned `meta.total`/`totalPages` always match the filters actually applied.
- **API documented with OpenAPI/Swagger**, hand-written as a plain spec object ([server/src/swagger.js](server/src/swagger.js)) rather than parsed from JSDoc comments — fewer moving parts, and the spec can't drift out of sync silently the way comment-based generation sometimes does.
- **Tests are integration-style**, hitting the real Express app with `supertest` against a real Postgres database rather than mocking the database layer — this catches issues mocks would hide (e.g. a bad SQL query or constraint violation).
- **Tailwind CSS v4** was chosen over hand-written CSS for speed and consistency, and over a component library (e.g. MUI) to keep bundle size and dependencies minimal for a small app.
- **Docker Compose for local Postgres only** (not the whole app) — keeps the edit-save-refresh loop fast during development, while still giving anyone cloning the repo a one-command way to get a database running.
- **Status toggle** is a checkbox/button that sends a `PUT` with the flipped status, reusing the same update endpoint rather than adding a separate `PATCH /tasks/:id/status` route.
- **SSL is conditional on environment** ([server/src/db/pool.js](server/src/db/pool.js)) — disabled for local/Docker Postgres (which has none configured), enabled for any non-local `DATABASE_URL` (Neon and most hosted providers require it).
- **`CLIENT_ORIGIN` accepts a comma-separated list** so the deployed Vercel frontend and a local dev server can both call the API without swapping environment variables back and forth.

## Optional Features Implemented

- ✅ **User authentication** — JWT-based register/login, tasks are private per-user
- ✅ **Search** — `?search=` matches task title or description (case-insensitive)
- ✅ **Pagination** — `?page=`/`?limit=`, with page controls in the UI
- ✅ **Form validation** — both client-side (inline errors) and server-side (400s with descriptive messages)
- ✅ **Tests** — Jest + Supertest integration tests covering auth and task CRUD/search/pagination/ownership
- ✅ **API documentation** — Swagger UI at `/api-docs`
- ✅ **Deployment** — frontend on Vercel, backend on Render, database on Neon (see [Live Demo](#live-demo) and [Deployment Architecture](#deployment-architecture))
- ✅ **Improved UI/UX** — a custom design system (sidebar navigation, side drawers for create/view/delete instead of modals, dashboard-style stat cards, toned badges), toast notifications, debounced search, empty states, loading states, responsive layout
