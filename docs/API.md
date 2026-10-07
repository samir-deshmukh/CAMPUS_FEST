# CampusFest API Reference

Base URL: the deployed backend origin followed by `/api`.

## Health

`GET /health`

Public health check. Returns a simple service status.

## Authentication

`POST /api/auth/login`

Admin login. Requires JSON:

```json
{"username":"...","password":"..."}
```

Also requires `X-Admin-Client-ID`.

`POST /api/auth/admin-lock/heartbeat`

Refreshes an authenticated admin tab lock.

`POST /api/auth/admin-lock/release`

Releases the authenticated admin tab lock. The client may use `sendBeacon` during page close.

## Public events

`GET /api/events`

Returns published events.

`POST /api/registrations/events/{eventId}`

Creates a registration for a published event. The server validates the name, course and phone number and returns an opaque `passToken`.

## Passes

`POST /api/registrations/me`

Request:

```json
{"passToken":"..."}
```

Returns the pass associated with the token.

`DELETE /api/registrations/me`

Request body is the same as above. Cancels an unused active registration.

Pass tokens are deliberately sent in request bodies by the current clients rather than query strings.

## Admin events

All require an admin JWT and `X-Admin-Client-ID`.

- `GET /api/events/all`
- `POST /api/events`
- `PUT /api/events/{eventId}`
- `POST /api/events/{eventId}/close`
- `POST /api/events/{eventId}/reopen`
- `DELETE /api/events/{eventId}`
- `GET /api/admin/dashboard`
- `GET /api/admin/events/{eventId}/registrations`
- `GET /api/admin/registrations`
- `POST /api/admin/verify`

Event posters must be PNG, JPEG or WebP and are size-limited server-side.

## Event gallery

- `GET /api/event-gallery` – public, newest 30 records
- `GET /api/admin/event-gallery` – admin
- `POST /api/admin/event-gallery` – admin upload
- `PUT /api/admin/event-gallery/{photoId}` – admin description update
- `DELETE /api/admin/event-gallery/{photoId}` – admin delete

## Scanner

`POST /api/scanner/login`

Returns an 8-hour scanner JWT when configured credentials are correct.

`GET /api/scanner/events`

Requires a scanner JWT.

`POST /api/scanner/verify`

Requires a scanner JWT. Request body:

```json
{"eventId":123,"passToken":"..."}
```

The server verifies event ownership, active registration state and single-use entry state.

## Scanner credential administration

Admin JWT required:

- `GET /api/admin/scanner-credentials`
- `POST /api/admin/scanner-credentials`
- `POST /api/admin/scanner-password`

Changing scanner credentials increments the credential version and revokes existing scanner sessions.

## Lost & Found

Public:

- `GET /api/lost-found`
- `POST /api/lost-found`
- `POST /api/lost-found/{itemId}/claim`
- `POST /api/validate-text`

Admin:

- `GET /api/admin/lost-found`
- `GET /api/admin/lost-found/claims`
- `POST /api/admin/lost-found/{itemId}/verify`
- `POST /api/admin/lost-found/{itemId}/resolve`
- `POST /api/admin/lost-found/claims/{claimId}/approve`
- `POST /api/admin/lost-found/claims/{claimId}/reject`

## Security model

The API does not expose a user registration endpoint. The current academic implementation uses a single environment-configured admin identity and a separately configured scanner identity. Public student registration is event participation, not an authenticated account system.

All SQL parameters are bound through psycopg. Frontend validation is not treated as a security control.
