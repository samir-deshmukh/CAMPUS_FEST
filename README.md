# CampusFest – Smart Event Management Website

CampusFest is a college event-management website with a public student site, an administrator panel, and a FastAPI/PostgreSQL backend.

## Included
- site/ — public student website for events, registration, entry passes, registration cancellation, Lost & Found, and event gallery.
- admin/ — administrator website for events, registrations, gallery photos, and Lost & Found.
- backend/ — FastAPI REST API and PostgreSQL integration.
- docs/ — current project documentation.
- render.yaml — Render deployment configuration.

The repository intentionally contains website and backend code only. The old Flutter client and separate QR-scanner client have been removed.

## Local development
Student website:
  cd site
  npm ci
  npm run dev

Admin website:
  cd admin
  npm ci
  npm run dev

Backend:
  cd backend
  python -m venv .venv
  pip install -r requirements.txt
  uvicorn app.main:app --host 0.0.0.0 --port 8000

The backend requires DATABASE_URL, SECURITY_JWT_SECRET, ADMIN_USERNAME, and ADMIN_PASSWORD. Frontends use VITE_API_URL.

## Deployment
render.yaml defines the FastAPI backend, student website, admin website, and PostgreSQL database.

## Documentation
- docs/SRS.md — requirements and scope
- docs/ARCHITECTURE.md — current architecture
- docs/DATABASE.md — database model
- docs/API.md — API endpoints
- docs/SECURITY.md — security controls
- docs/TESTING.md — verification checklist
- docs/USER_GUIDE.md — website and admin usage
- docs/LIMITATIONS.md — known limitations

This is an academic project. Production use requires appropriate hosting, secrets management, backups, monitoring, rate limiting, and a formal security review.
