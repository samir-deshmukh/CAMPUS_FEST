# CampusFest Testing Checklist

## Frontend
From site/:
- npm ci
- npm run build

From admin/:
- npm ci
- npm run build

## Backend
From backend/:
- python -m compileall app
- pip install -r requirements.txt
- Start the API and verify /health.

## Functional checks
- Student site loads events from the API.
- Registration creates a pass.
- Pass QR can be decoded by the cancellation workflow.
- Cancellation invalidates the registration.
- Lost & Found report submission works.
- Admin can authenticate.
- Admin can create and publish an event.
- Admin can inspect registrations.
- Admin can manage gallery photos.
- Admin can verify Lost & Found reports and process claims.
- Admin session lock rejects a second active administrator session.

## Repository checks
- No mobile/ directory.
- No scanner/ directory.
- No Flutter project files.
- No scanner-specific API routes or admin screens.
- Documentation describes the website-only architecture.
