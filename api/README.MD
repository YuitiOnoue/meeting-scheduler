# Meeting Room Scheduler

A study project for learning Node.js, Angular, and Docker by building a meeting room booking app.

## Tech stack

Node.js + Express (API) · PostgreSQL · Docker

## Prerequisites

- Node `22.14.0` (see `.nvmrc` — run `nvm use` in `api/`)
- Docker (for Postgres via `docker-compose.yml`)

## Setup

1. Start Postgres:
   ```
   docker compose up -d
   ```
2. Install API dependencies:
   ```
   cd api
   npm install
   ```
3. Copy the environment template and adjust if needed:
   ```
   cp .env.example .env
   ```
4. Run migrations:
   ```
   npm run migrate
   ```
5. Seed sample data (rooms + an admin user):
   ```
   npm run seed
   ```
6. Start the dev server:
   ```
   npm run dev
   ```
7. Verify it's running:
   ```
   curl http://localhost:3000/health
   ```

## Default seeded login

- Admin: `admin@scheduler.dev` / `admin123`

## Running tests

```
cd api
npm test
```
