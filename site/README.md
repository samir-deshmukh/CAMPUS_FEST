# CampusFest Student Website

React/Vite public client for browsing events, registering, downloading/cancelling QR passes, viewing the event gallery, and using Lost & Found.

## Run

```bash
npm ci
npm run dev
```

Set `VITE_API_URL` when the API is not `http://localhost:8080/api`.

## Security

The student site does not contain privileged credentials. Public validation is repeated by the FastAPI backend, which must be treated as the security boundary.
