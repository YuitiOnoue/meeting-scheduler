# Meeting Room Scheduler

A study project to learn Node.js, Angular, and Docker by building a full-stack meeting room booking application.

## Learning Goals

- **Node.js / Express** — REST API design, middleware, routing, JWT auth, DB integration
- **Angular** — Components, services, routing, reactive forms, HTTP client
- **Docker** — Containerization, docker-compose, multi-service networking

## Project: Meeting Room Scheduler

### Tech Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Frontend | Angular                 |
| Backend  | Node.js + Express       |
| Database | PostgreSQL              |
| Infra    | Docker + docker-compose |

## Project Structure

```
meeting-scheduler/
├── api/                      # Node.js/Express backend
│   ├── migrations/           # node-pg-migrate migrations
│   └── src/
│       ├── routes/           # rooms.js, auth.js, reservations.js
│       ├── middleware/       # authenticate.js
│       └── db/                # db.js (pg Pool), schema.sql, seed.js
├── web/                      # Angular frontend — not started yet (target)
└── docker-compose.yml        # currently only defines the `db` service — api/ui services are target (Phase 9)
```

### Features

- User authentication (register / login via JWT)
- Room management (CRUD — name, capacity, resources, details)
- Booking / reservations (create, view, cancel time-slot bookings)
- Show available rooms for a given date/time
- Reserve a room by selecting a date and hour slot
- Calendar view (visual availability per room)
- Display a real-time dashboard with the current status of all rooms
- Generate a unique QR code per room that redirects to that room's booking page (printed and placed on the door for easy walk-up scheduling)
- Create roles for adminstrators (register rooms, cancel others reservations) and users (make/cancel own reservations)

## Data Models

### Room

```json
{
  "id": "uuid",
  "name": "Sala Guepardo",
  "capacity": 6,
  "location": "São Paulo - 10º andar",
  "description": "Projector, whiteboard, video conferencing",
  "amenities": ["projector", "whiteboard", "video-conference"]
}
```

### Reservation

```json
{
  "id": "uuid",
  "roomId": "uuid",
  "title": "Sprint Planning",
  "organizer": "Jane Doe",
  "date": "2026-06-20",
  "startTime": "9:45",
  "endTime": "11:15"
}
```

### User

```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "passwordHash": "...",
  "role": "admin | user"
}
```

---

## API Endpoints

| Method | Route                                        | Description                                    |
| ------ | -------------------------------------------- | ---------------------------------------------- |
| GET    | `/rooms`                                     | List all rooms with capacity                   |
| POST   | `/rooms`                                     | Create a room                                  |
| GET    | `/rooms/:id`                                 | Get room details                               |
| PUT    | `/rooms/:id`                                 | Update room details                            |
| DELETE | `/rooms/:id`                                 | Delete a room                                  |
| GET    | `/rooms/available?date=&startTime=&endTime=` | List rooms free in that slot                   |
| GET    | `/rooms/:id/qrcode`                          | Returns QR code PNG for the room's booking URL |
| GET    | `/reservations`                              | List all reservations                          |
| POST   | `/reservations`                              | Create a reservation                           |
| DELETE | `/reservations/:id`                          | Cancel a reservation                           |
| GET    | `/reservations?roomId=&date=`                | Get reservations for a room on a date          |
| POST   | `/auth/register`                             | Create a user account                          |
| POST   | `/auth/login`                                | Authenticate and return a JWT token            |
| GET    | `/auth/me`                                   | Return current authenticated user (protected)  |

---

## Frontend Views

| View                | Route             | Description                                                                                   |
| ------------------- | ----------------- | --------------------------------------------------------------------------------------------- |
| Dashboard           | `/`               | Grid of all rooms — shows current occupancy status (free/busy), capacity, next available slot |
| Room Detail         | `/rooms/:id`      | Hourly timeline for the day, existing reservations, book button                               |
| Book Room           | `/rooms/:id/book` | Form: title, organizer, date, start/end hour (with conflict validation)                       |
| QR Door Card        | `/rooms/:id/door` | Full-screen card with room name, capacity, QR code — optimized for printing                   |
| Availability Search | `/search`         | Pick date + time range → shows only available rooms                                           |

---

## Phases

> **Note:** Phases 1–3 originally planned a JSON-file data layer (`rooms.json`/`users.json`/`reservations.json` under `src/data/`, read via `fs/promises`). The actual implementation pivoted to PostgreSQL from the start (matching the Tech Stack table above). The steps below have been updated to reflect what was actually built. See "Known gaps (deferred)" after Phase 3 for open items to pick up later.

### Phase 1 — Node.js: Project Setup & Room Routes ✅ done

**Concepts:** npm init, Express, routing, dotenv, Postgres, migrations

Steps (as actually implemented):

1. Created `meeting-scheduler/api/` folder, ran `npm init`
2. Installed `express`, `dotenv`, `pg`, `node-pg-migrate` (no `nodemon`/`uuid` — `npm run dev` uses `node --watch src/index.js`, and Postgres generates UUIDs via `pgcrypto`)
3. Structure used: `src/routes/`, `src/db/` (`db.js`, `schema.sql`, `seed.js`), `migrations/` (not `src/controllers/`/`src/data/`)
4. Seeded 6 rooms into Postgres via `src/db/seed.js` (`npm run seed`)
5. Implemented `GET /rooms` and `GET /rooms/:id` in `src/routes/rooms.js` (also `POST`/`PUT`/`DELETE /rooms`, ahead of the original Phase 1 scope)
6. `npm run dev` runs `node --watch src/index.js` for auto-restart

### Phase 2 — Node.js: Authentication & JWT ✅ mostly done

**Concepts:** bcryptjs, JWT, middleware, protected routes, role-based access

Steps (as actually implemented):

1. Installed `bcryptjs` (not `bcrypt`), `jsonwebtoken`
2. `src/db/seed.js` seeds one admin user into Postgres; there is no seeded regular user — regular users are expected to self-register via `POST /auth/register`
3. Implemented `POST /auth/register` — hash password with bcryptjs, save user
4. Implemented `POST /auth/login` — verify password, return signed JWT
5. Implemented `GET /auth/me` — protected route using `src/middleware/authenticate.js` (has unit tests)
6. **Not yet implemented (deferred):** role-checking middleware for admin-only routes — see "Known gaps" below

### Phase 3 — Node.js: Reservations & Availability Logic ✅ done

**Concepts:** SQL queries via `pg`, business logic, query params, conflict detection

Steps (as actually implemented):

1. No reservation seed data — reservations are created live through the API
2. Implemented `POST /reservations` in `src/routes/reservations.js` with a half-open-interval overlap conflict check (409 on conflict), auth-protected
3. Implemented `DELETE /reservations/:id` — auth-protected, but currently restricted to the reservation's own owner (see "Known gaps")
4. Implemented `GET /rooms/available?date=&startTime=&endTime=` — reuses the same overlap-exclusion query
5. Implemented `GET /reservations?roomId=&date=` for the room detail view (note: there is no "list all" mode — calling it without both query params returns an empty result, not all reservations)

## Known gaps (deferred)

These were found during the Phase 1–3 audit and intentionally deferred rather than fixed, to keep moving on Phase 4:

- **No admin-role-check middleware exists.** `POST/PUT/DELETE /rooms` are completely unauthenticated/unrestricted, and `DELETE /reservations/:id` only allows the owning user — admins cannot yet create the intended "cancel others' reservations" capability. Needs a `requireAdmin` (or similar) middleware applied to the right routes.
- **`POST /auth/register` accepts a client-supplied `role`** with no restriction, so a caller can self-assign `role: "admin"`.

### Phase 4 — Node.js: QR Code Generation

**Concepts:** npm packages, binary responses, URL design

Steps:

1. Install `qrcode` package
2. Implement `GET /rooms/:id/qrcode` — generates a QR code PNG pointing to `http://localhost:4200/rooms/:id/book`
3. Serve as `image/png` buffer response
4. Test by opening the URL in the browser — scan with phone to verify redirect

### Phase 5 — Docker: Containerize the API

**Concepts:** Dockerfile, image layers, `.dockerignore`, ARG/ENV, port mapping, service networking, healthchecks

Steps:

1. Write `Dockerfile` for the Node.js API (multi-stage optional)
2. Add `.dockerignore` (exclude `node_modules`, `*.json` data files)
3. Build and run: `docker build` → `docker run -p 3000:3000`
4. ~~Mount `src/data/` as a volume so JSON files persist between container restarts~~ — stale (JSON-era plan). The API is stateless; only Postgres needs a volume, which `docker-compose.yml` already has (`db_data`)
5. Harden the Dockerfile: `npm install` → `npm ci --omit=dev` (deterministic installs from the lockfile); pin `FROM node:22.14.0-alpine` to match `.nvmrc`; add `USER node` (drop root); add a comment documenting required runtime env vars (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `FRONTEND_URL`); add `*.test.js` to `.dockerignore` so test files aren't copied into the image
6. Add a `HEALTHCHECK` to `api/Dockerfile` (hitting the existing `GET /health` route) so `depends_on: condition: service_healthy` can be used later
7. Add an `api` service to the root `docker-compose.yml` (building `api/Dockerfile`), on the same network as `db`, with `DB_HOST=db` — pulled forward from Phase 9 so the API runs fully containerized (`docker compose up --build`) instead of requiring the manual `docker run --network ... -e DB_HOST=db` workaround used to first verify connectivity

### Phase 6 — Angular: Project Setup & Dashboard

**Concepts:** Angular CLI, components, services, `HttpClient`, `*ngFor`, `*ngIf`, pipes

Steps:

1. Scaffold: `ng new meeting-scheduler-ui --routing --style=scss`
2. Create `RoomService` with `HttpClient` — methods: `getRooms()`, `getRoom(id)`, `getAvailable(params)`
3. Build `DashboardComponent` — card grid showing each room's status (free/busy/capacity)
4. Add a `RoomStatusPipe` to compute and format current occupancy

### Phase 7 — Angular: Room Detail & Booking Form

**Concepts:** Reactive forms, route params, form validation, conditional UI

Steps:

1. Build `RoomDetailComponent` — hourly timeline for today showing each reservation block
2. Build `BookRoomComponent` with a reactive form: title, organizer, date, startHour, endHour
3. Add client-side validation (end > start, required fields)
4. On submit, call `POST /reservations` and redirect back to room detail on success

### Phase 8 — Angular: QR Door Card & Search View

**Concepts:** `<img>` binding to API URL, print CSS, query params in routing

Steps:

1. Build `DoorCardComponent` at `/rooms/:id/door`:
   - Room name, capacity, amenities
   - `<img [src]="'/api/rooms/' + id + '/qrcode'">` renders the QR code
   - Add a "Print" button and `@media print` CSS to hide nav/buttons
2. Build `AvailabilitySearchComponent` at `/search`:
   - Date picker + start/end hour selectors
   - On search, call `GET /rooms/available` and display matching rooms as cards

### Phase 9 — Docker Compose: Full Stack

**Concepts:** `docker-compose.yml`, service networking, build context, volumes, depends_on

Steps:

1. Add a `ui` service to `docker-compose.yml` alongside the `db` and `api` services (`api`+`db` wiring already done in Phase 5)
2. Configure `ui` to proxy `/api` requests to the `api` service by name
3. Add `depends_on: condition: service_healthy` for `ui` → `api` and `api` → `db`, using the `HEALTHCHECK` added to `api/Dockerfile` in Phase 5
4. Run `docker compose up --build` — verify the full app works end-to-end

---

## How to guide the user

- **Never write project source files automatically.** Always show code in chat so the user types it manually.
- **One step at a time.** After each step, pause and ask: "Try it out — does it work? Any errors?"
- **Explain the why before showing what.** concept first, then code.
- **When the user is stuck,** read the relevant files first with `Read`, then diagnose — don't guess.
- **After each phase** give a short recap of what was learned and preview the next phase.
- **Demonstrate new concepts** keep examples minimal and focused on the current concept.
