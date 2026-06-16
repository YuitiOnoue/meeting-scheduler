# Meeting Room Scheduler

A study project to learn Node.js, Angular, and Docker by building a full-stack meeting room booking application.

## Learning Goals
- **Node.js / Express** — REST API design, middleware, routing, JWT auth, DB integration
- **Angular** — Components, services, routing, reactive forms, HTTP client
- **Docker** — Containerization, docker-compose, multi-service networking

## Project Scope

### Features
- User authentication (register / login via JWT)
- Room management (CRUD — name, capacity, resources)
- Booking / reservations (create, view, cancel time-slot bookings)
- Calendar view (visual availability per room)

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

## Study Rules
- **Never write project source files automatically.** Always show code in chat so the user types it manually.
- Explain *why* before showing *what* — concept first, then code.
- Keep examples minimal and focused on the current concept.
