# Taskly

A task management app built for the kLab Tech Upskill Program coding challenge. Register, log in, and create, edit, delete, search, filter, and paginate through your own tasks.

## Live Demo

- App: https://taskly-challenge.vercel.app
- API: https://taskly-api-n610.onrender.com
- API docs: https://taskly-api-n610.onrender.com/api-docs

The backend is on Render's free tier, so it goes to sleep after a while and can take 30–50 seconds to wake up on the first request. Normal after that.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS, hand-built UI components (buttons, cards, drawers, tables, etc.), `lucide-react` icons
- **Backend:** Node.js + Express, plain SQL via `pg` (no ORM), JWT auth with bcrypt
- **Database:** PostgreSQL (Neon in production, Docker locally)
- **Other:** Swagger for API docs, Jest + Supertest for tests
- **Hosting:** Vercel (frontend), Render (backend), Neon (database)

## Project Structure

```
client/    React frontend
  src/components/ui       buttons, cards, drawers, tables, etc.
  src/components/layout   sidebar, page shell/header
  src/components/tasks    task drawers
  src/context             auth state
  src/api.js               talks to the backend

server/    Express API
  src/db            connection, schema, init script
  src/controllers   route logic + validation
  src/middleware    JWT auth check
  src/routes
  tests/            Jest + Supertest
```

## Running It Locally

**1. Start Postgres**

```bash
docker compose up -d
```

Or point `DATABASE_URL` in `server/.env` at your own Postgres instance instead.

**2. Backend**

```bash
cd server
cp .env.example .env   # set JWT_SECRET to any random string
npm install
npm run db:init
npm run dev             # http://localhost:4000
```

**3. Frontend**

```bash
cd client
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

**Tests**

```bash
cd server
npm test
```

## Database

One `users` table and one `tasks` table, linked by `user_id` so everyone only ever sees their own tasks. Full schema is in [server/src/db/schema.sql](server/src/db/schema.sql). `npm run db:init` runs it against whatever `DATABASE_URL` points to (local or hosted, doesn't matter) — safe to re-run any time.

## API

Everything under `/tasks` needs an `Authorization: Bearer <token>` header, from `/auth/login` or `/auth/register`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Log in |
| GET | `/auth/me` | Current user |
| GET | `/tasks` | List tasks (`?status=`, `?search=`, `?page=`, `?limit=`) |
| GET | `/tasks/:id` | Get one task |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

Full interactive docs at `/api-docs` (locally or on the [live API](https://taskly-api-n610.onrender.com/api-docs)).

## A Few Decisions Worth Explaining

- **No ORM** — just `pg` with parameterized queries. Keeps the SQL visible instead of hidden behind an abstraction.
- **JWT auth, no sessions** — the token carries the user id, and every task query is scoped to `WHERE user_id = $1`, so one user can never see or touch another's tasks.
- **Render for the backend, not Vercel** — the API keeps a persistent Postgres connection pool open, which fits a normal long-running server better than Vercel's serverless functions.
- **Neon over Render's own Postgres** — Render deletes free databases after 30 days; Neon's free tier doesn't expire.
- **Tests hit a real database** through Supertest instead of mocking it, so they catch actual SQL/constraint bugs, not just logic bugs.

## Optional Features

- ✅ Authentication (JWT, per-user tasks)
- ✅ Search
- ✅ Pagination
- ✅ Form validation (client + server)
- ✅ Tests
- ✅ API documentation
- ✅ Deployment
- ✅ Extra UI polish — sidebar, drawers instead of modals, stat cards, toasts
