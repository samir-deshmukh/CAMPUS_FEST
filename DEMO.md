# CampusFest Website Demo

CampusFest consists of a public student website, an administrator website, and a FastAPI/PostgreSQL backend.

## Student flow
1. Open the Events page.
2. Select a published event and register.
3. Download the generated CampusFest entry pass.
4. Use Cancel Registration with the downloaded pass image when required.
5. Report or claim items through Lost & Found.
6. View event photos in Event Gallery.

## Admin flow
1. Open the admin website and sign in.
2. Create, edit, publish, close, reopen, or delete events.
3. Open an event to view registrations.
4. Manage event-gallery photos.
5. Review Lost & Found reports and claims.

## Build checks
Student website: npm ci && npm run build
Admin website: npm ci && npm run build
Backend: python -m compileall app

This repository is website-only. The former Flutter client, standalone scanner client, and unused Spring Boot backend have been removed.
