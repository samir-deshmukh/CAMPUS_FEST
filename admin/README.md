# CampusFest Admin Panel

React/Vite administrator client for the active CampusFest FastAPI backend.

## Run

```bash
npm ci
npm run dev
```

Set `VITE_API_URL` when the API is not `http://localhost:8080/api`.

## Security

The browser sends the admin JWT and `X-Admin-Client-ID` header to protected API routes. The backend is the authority for authorization. Do not add privileged operations that rely only on hidden React buttons.
