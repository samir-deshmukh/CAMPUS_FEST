# CampusFest – Smart Event Management Website

CampusFest is a college event-management system for event publishing, student registration, QR entry passes, event-photo gallery, lost & found, and controlled entry scanning.

## Current implementation

The active web stack is:

- `site/` – student React/Vite website
- `admin/` – protected React/Vite admin panel
- `scanner/` – protected QR scanner client
- `backend/` – FastAPI + PostgreSQL API used by the three web clients
- `docs/` – requirements, architecture, database, API, security and testing documentation


## Local setup

### Backend

Required environment variables:

```text
DATABASE_URL
SECURITY_JWT_SECRET       # at least 32 characters
ADMIN_USERNAME
ADMIN_PASSWORD
SCANNER_USERNAME          # recommended for a fresh database
SCANNER_PASSWORD          # recommended for a fresh database
CORS_ALLOWED_ORIGINS      # comma-separated frontend origins
```

See `backend/.env.example` for the names and safe examples. Never commit real values.

Run:

```bash
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --reload
```

### Student website

```bash
cd site
npm ci
npm run dev
```

### Admin panel

```bash
cd admin
npm ci
npm run dev
```

### QR scanner

```bash
cd scanner
npm ci
npm run dev
```

Each frontend reads `VITE_API_URL`; without it, development falls back to `http://localhost:8080/api`.

## Security baseline

- JWTs are signed with a required, non-default secret.
- Admin credentials are supplied through environment variables and compared with constant-time comparison.
- Scanner passwords are salted and hashed with PBKDF2-HMAC-SHA256.
- Scanner credential changes revoke existing scanner JWTs through a credential version.
- Admin APIs require both a valid JWT and the active admin-tab identity.
- CORS is allow-list based rather than `*`.
- API responses receive baseline security headers.
- Pass tokens are generated with `secrets.token_urlsafe()` and are no longer sent in URL query strings by the web clients.
- Image inputs are restricted to PNG/JPEG/WebP and size-limited server-side.
- Public gallery responses are capped to the newest 30 items.
- SQL uses parameterized queries.
- User-facing text is validated server-side; frontend validation is only a usability aid.

See `docs/SECURITY.md` for the full threat model and remaining production controls.

## Verification

Run from the repository root:

```bash
python3 -m py_compile backend/app/main.py
git diff --check
npm --prefix site ci && npm --prefix site run build
npm --prefix admin ci && npm --prefix admin run build
npm --prefix scanner ci && npm --prefix scanner run build
npm --prefix admin audit --omit=dev --audit-level=moderate
npm --prefix site audit --omit=dev --audit-level=moderate
npm --prefix scanner audit --omit=dev --audit-level=moderate
```

## Documentation

- `docs/SRS.md` – current requirements and scope
- `docs/ARCHITECTURE.md` – actual runtime architecture and boundaries
- `docs/DATABASE.md` – PostgreSQL tables and integrity rules
- `docs/API.md` – current FastAPI endpoints
- `docs/SECURITY.md` – security controls, findings and remaining hardening
- `docs/TESTING.md` – automated and manual verification
- `docs/USER_GUIDE.md` – local usage for student, admin and scanner clients
- `docs/LIMITATIONS.md` – known limitations and future work
- `DEMO.md` – short presentation/demo runbook

## Scope statement

This is an academic project. The current stack has meaningful security controls, but it should not be treated as a production service until rate limiting, centralized audit logging, stronger secret/session management, deployment headers, integration tests and independent security testing are completed.
