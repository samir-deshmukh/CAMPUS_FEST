# User Guide – CampusFest

## 1. Start the backend

Set the environment variables described in `backend/.env.example`, then run:

```bash
uvicorn app.main:app --app-dir backend --reload
```

The default development API is `http://localhost:8080/api`.

## 2. Student website

```bash
cd site
npm ci
npm run dev
```

Use the site to browse events, register, download a QR pass, cancel a registration, view the event gallery, and use Lost & Found.

## 3. Admin panel

```bash
cd admin
npm ci
npm run dev
```

Sign in using the configured `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

The admin panel can manage events, registrations, gallery records, Lost & Found moderation and scanner credentials.

Keep the admin tab open while working. The backend uses a heartbeat lock to detect stale sessions and limit simultaneous admin tabs.

## 4. QR scanner

```bash
cd scanner
npm ci
npm run dev
```

Sign in with the configured scanner credentials, choose a published event, allow camera access, and scan the student's QR pass.

A pass is accepted only once and only for its registered event.

## 5. Production configuration

Set:

- `DATABASE_URL`
- `SECURITY_JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SCANNER_USERNAME`
- `SCANNER_PASSWORD`
- `CORS_ALLOWED_ORIGINS`

Never place real secrets in source files or commit `.env` files.
