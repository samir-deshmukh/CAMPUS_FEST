# CampusFest – Smart Event Management App

CampusFest is a college event-management project covering event discovery, registration, entry passes, competitions, judging and official results.

## Current academic deliverable
The immediate submission is an **offline React website demo**. It does not require hosting or an internet connection and is intentionally independent of the backend at runtime.

The repository also contains a **Spring Boot 4 / Java 21 backend foundation** with PostgreSQL persistence, JWT authentication, role-based authorization, event registration, entry passes, competition management, judge scoring and result publication.

The Flutter mobile application is retained in the repository as future work but is **not part of the current 3-day website deliverable**.

## Repository structure
- `admin/` – offline React/Vite website demo
- `backend/` – Spring Boot REST API and domain logic
- `mobile/` – Flutter prototype/future client
- `docs/` – project requirements, architecture, database, API, security, testing and user documentation
- `DEMO.md` – quick demonstration and offline-build instructions

## Run the website
```bash
cd admin
npm ci
npm run dev
```

Build a static version:
```bash
npm run build
```

Then open `admin/dist/index.html` for the offline build.

## Backend
The backend targets Java 21 and PostgreSQL. Development configuration is environment-variable driven; the repository's local database defaults are development-only and must not be reused as production secrets.

## Security highlights
- BCrypt password hashing
- JWT-based stateless authentication
- Role-based access control
- Ownership checks for organizer operations
- Student-only self-registration
- Unique registration/pass/assignment constraints
- Pessimistic locking for event-capacity registration
- Cryptographically random opaque entry-pass tokens
- Server-side judging and score validation
- Ownership-protected result publication

See `docs/SECURITY.md` for the security model and production hardening requirements.

## Documentation
- `docs/SRS.md` – requirements and acceptance criteria
- `docs/ARCHITECTURE.md` – system architecture and boundaries
- `docs/DATABASE.md` – entities, relationships and integrity rules
- `docs/API.md` – backend endpoints and security model
- `docs/SECURITY.md` – threats, controls and hardening
- `docs/TESTING.md` – verification and manual test checklist
- `docs/USER_GUIDE.md` – demo usage instructions
- `docs/LIMITATIONS.md` – current limitations and future scope

## Important scope statement
This is an academic project/demo. The offline website should not be presented as a production-connected event platform. The backend is a production-oriented foundation and requires additional hardening, integration testing and deployment controls before real-world use.
