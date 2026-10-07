# CampusFest — Current Demo Runbook

## Architecture

The current demo uses a React/Vite student site, React/Vite admin panel, React/Vite QR scanner, FastAPI backend and PostgreSQL database.

The Java/Spring Boot code is legacy and is not used by the current deployment.

## Quick flow

1. Start PostgreSQL and the FastAPI backend.
2. Open the student site and show published events.
3. Register for an event and download the generated QR pass.
4. Open the scanner, sign in, choose the event and scan the pass.
5. Show that the same pass is rejected on a second scan.
6. Open the admin panel and show registrations and event management.
7. Show the event gallery and Lost & Found moderation.
8. Show scanner credential management and explain that changing credentials revokes existing scanner sessions.

## Security points to mention

- Secrets come from environment variables.
- Admin and scanner access are enforced by the backend.
- QR passes use opaque cryptographically random tokens.
- Pass tokens are not placed in URLs by the current clients.
- Images are type- and size-validated server-side.
- CORS is restricted to configured frontend origins.

## Scope note

This remains an academic project. The documented remaining hardening work is in `docs/SECURITY.md` and should be acknowledged instead of claiming production certification.
