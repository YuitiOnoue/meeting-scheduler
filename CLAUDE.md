# Meeting Room Scheduler

A study project to learn Node.js, Angular, and Docker by building a full-stack meeting room booking application.

## Learning Goals
- **Node.js / Express** — REST API design, middleware, routing, JWT auth, DB integration
- **Angular** — Components, services, routing, reactive forms, HTTP client
- **Docker** — Containerization, docker-compose, multi-service networking

## Project: Meeting Room Scheduler

### Tech Stack
| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | Angular                 |
| Backend   | Node.js + Express       |
| Database  | PostgreSQL              |
| Infra     | Docker + docker-compose |

## Project Structure (target)
```
meeting-scheduler/
├── api/          # Node.js/Express backend
├── web/          # Angular frontend
└── docker-compose.yml
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

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/rooms` | List all rooms with capacity |
| POST | `/rooms` | Create a room |
| GET | `/rooms/:id` | Get room details |
| PUT | `/rooms/:id` | Update room details |
| DELETE | `/rooms/:id` | Delete a room |
| GET | `/rooms/available?date=&startTime=&endTime=` | List rooms free in that slot |
| GET | `/rooms/:id/qrcode` | Returns QR code PNG for the room's booking URL |
| GET | `/reservations` | List all reservations |
| POST | `/reservations` | Create a reservation |
| DELETE | `/reservations/:id` | Cancel a reservation |
| GET | `/reservations?roomId=&date=` | Get reservations for a room on a date |
| POST | `/auth/register` | Create a user account |
| POST | `/auth/login` | Authenticate and return a JWT token |
| GET | `/auth/me` | Return current authenticated user (protected) |

---

## Frontend Views

| View | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Grid of all rooms — shows current occupancy status (free/busy), capacity, next available slot |
| Room Detail | `/rooms/:id` | Hourly timeline for the day, existing reservations, book button |
| Book Room | `/rooms/:id/book` | Form: title, organizer, date, start/end hour (with conflict validation) |
| QR Door Card | `/rooms/:id/door` | Full-screen card with room name, capacity, QR code — optimized for printing |
| Availability Search | `/search` | Pick date + time range → shows only available rooms |

---

## Phases

### Phase 1 — Node.js: Project Setup & Room Routes
**Concepts:** npm init, Express, folder structure, routing, JSON middleware, nodemon, dotenv

Steps:
1. Create `meeting-scheduler/api/` folder, run `npm init`
2. Install `express`, `nodemon`, `dotenv`, `uuid`
3. Create structure: `src/routes/`, `src/controllers/`, `src/data/`
4. Seed `rooms.json` with 4–5 sample rooms
5. Implement `GET /rooms` and `GET /rooms/:id`
6. Add `npm run dev` with nodemon

### Phase 2 — Node.js: Authentication & JWT

**Concepts:** bcrypt, JWT, middleware, protected routes, role-based access

Steps:

1. Install `bcrypt`, `jsonwebtoken`
2. Seed `users.json` with one admin and one regular user
3. Implement `POST /auth/register` — hash password with bcrypt, save user
4. Implement `POST /auth/login` — verify password, return signed JWT
5. Implement `GET /auth/me` — protected route using an `authenticate` middleware
6. Add role-checking middleware for admin-only routes (room creation/deletion)

### Phase 3 — Node.js: Reservations & Availability Logic
**Concepts:** async file I/O with `fs/promises`, business logic, query params, conflict detection

Steps:
1. Seed `reservations.json`
2. Implement `POST /reservations` with hour-conflict validation (no double booking)
3. Implement `DELETE /reservations/:id`
4. Implement `GET /rooms/available?date=&startHour=&endHour=` — filter rooms with no conflicting reservations
5. Implement `GET /reservations?roomId=&date=` for the room detail view

### Phase 4 — Node.js: QR Code Generation
**Concepts:** npm packages, binary responses, URL design

Steps:
1. Install `qrcode` package
2. Implement `GET /rooms/:id/qrcode` — generates a QR code PNG pointing to `http://localhost:4200/rooms/:id/book`
3. Serve as `image/png` buffer response
4. Test by opening the URL in the browser — scan with phone to verify redirect

### Phase 5 — Docker: Containerize the API
**Concepts:** Dockerfile, image layers, `.dockerignore`, ARG/ENV, port mapping

Steps:
1. Write `Dockerfile` for the Node.js API (multi-stage optional)
2. Add `.dockerignore` (exclude `node_modules`, `*.json` data files)
3. Build and run: `docker build` → `docker run -p 3000:3000`
4. Mount `src/data/` as a volume so JSON files persist between container restarts

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
1. Write `docker-compose.yml` with services: `api` and `ui`
2. Configure `ui` to proxy `/api` requests to the `api` service by name
3. Add a named volume for the API's `src/data/` folder
4. Add `depends_on: api` to the `ui` service
5. Run `docker compose up --build` — verify the full app works end-to-end

---

## How to guide the user

- **Never write project source files automatically.** Always show code in chat so the user types it manually.
- **One step at a time.** After each step, pause and ask: "Try it out — does it work? Any errors?"
- **Explain the why before showing what.** concept first, then code.
- **When the user is stuck,** read the relevant files first with `Read`, then diagnose — don't guess.
- **After each phase** give a short recap of what was learned and preview the next phase.
- **Demonstrate new concepts** keep examples minimal and focused on the current concept.