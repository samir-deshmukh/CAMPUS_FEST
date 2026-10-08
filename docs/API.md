# CampusFest API

Base URL: /api

## Authentication
- POST /auth/login — administrator login.
- POST /auth/admin-lock/heartbeat — maintain the administrator browser lock.
- POST /auth/admin-lock/release — release the administrator browser lock.

## Public
- GET /events — published events.
- POST /registrations/events/{event_id} — create a registration.
- GET /registrations/me?passToken=... — retrieve a pass.
- DELETE /registrations/me?passToken=... — cancel a registration.
- GET /lost-found — published Lost & Found items.
- POST /lost-found — report a found item.
- POST /lost-found/{item_id}/claim — submit a claim.
- GET /event-gallery — event photos.
- POST /validate-text — validate submitted text.

## Administrator
- GET /events/all
- POST /events
- PUT /events/{event_id}
- POST /events/{event_id}/close
- POST /events/{event_id}/reopen
- DELETE /events/{event_id}
- GET /admin/events/{event_id}/registrations
- GET /admin/registrations
- GET /admin/event-gallery
- POST /admin/event-gallery
- PUT /admin/event-gallery/{photo_id}
- DELETE /admin/event-gallery/{photo_id}
- GET /admin/lost-found
- GET /admin/lost-found/claims
- POST /admin/lost-found/{item_id}/verify
- POST /admin/lost-found/{item_id}/resolve
- POST /admin/lost-found/claims/{claim_id}/approve
- POST /admin/lost-found/claims/{claim_id}/reject

Administrator endpoints require a valid Bearer token and admin client identifier where enforced by the application.
