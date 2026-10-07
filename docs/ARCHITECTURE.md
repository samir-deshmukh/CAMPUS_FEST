# CampusFest Architecture

## 1. Active runtime architecture

```text
Student React/Vite  ───────┐
Admin React/Vite    ───────┼── HTTPS/REST ── FastAPI ── PostgreSQL
QR Scanner React/Vite ─────┘
```

The three web clients share one FastAPI backend. PostgreSQL is the source of truth for events, registrations, passes, gallery content, lost-and-found records, claims, scanner credentials, and admin-session locks.

## 2. Repository boundaries

- `site/` – public student client
- `admin/` – authenticated administration client
- `scanner/` – authenticated QR entry client
- `backend/app/main.py` – active API and database logic
- `backend/src/main/java/` – legacy Spring Boot prototype, not deployed
- `mobile/` – Flutter prototype
- `docs/` – project documentation

## 3. Request flow

1. Browser sends an HTTPS request to the FastAPI API.
2. Public endpoints validate request data before database writes.
3. Protected admin/scanner endpoints validate the bearer JWT and role/session state.
4. SQL is executed with psycopg parameter binding.
5. The API returns JSON to the client.

## 4. Authentication boundaries

Admin JWTs identify the admin role and browser-tab client ID. The backend additionally checks the active admin lock.

Scanner JWTs identify the scanner role and current credential version. Changing scanner credentials invalidates older scanner tokens.

The frontend never decides whether a privileged operation is authorized.

## 5. Main data domains

- Events and posters
- Student registrations and opaque entry passes
- Event gallery
- Lost & Found reports and claims
- Scanner credentials
- Admin active-session locks

## 6. Important design choices

### Stateless tokens with server-side admin lock
JWTs avoid server-side session storage for normal authentication. Admin concurrency is a separate server-side control because the project intentionally limits simultaneous admin tabs.

### Database transactions for entry
QR verification reads and updates the registration in one transaction so a used pass cannot be accepted twice through normal concurrent requests.

### Database-stored images
Small images are stored as base64 data URIs to keep the academic deployment simple. This is suitable for the current scale, not for a large media library.

## 7. Legacy code

The repository still contains a Java/Spring Boot implementation from an earlier architecture. It should not be mixed with the active Python API when modifying the system. If the Java prototype is permanently abandoned, it can be removed in a separate cleanup change after confirming no coursework requires it.

## 8. Deployment

Render runs the FastAPI backend as a web service and the React clients as static sites. Environment variables supply secrets, database connection information, CORS origins, and frontend API URLs.
