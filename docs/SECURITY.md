# CampusFest Security Review

## 1. Security scope

This document describes the **active** security implementation in `backend/app/main.py`, `site/`, `admin/`, and `scanner/`. The Spring Boot code under `backend/src/main/java/` is legacy prototype code and is not part of the active deployment path.

The review covers authentication, authorization, token handling, input validation, database access, uploads, browser security, secret handling, and dependency checks available in the development environment.

## 2. Authentication

### Admin
- Admin credentials come from `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables.
- There is no hardcoded production credential fallback.
- Username/password comparisons use `secrets.compare_digest`.
- Successful login receives an 8-hour signed JWT.
- Admin requests also require a valid `X-Admin-Client-ID` that matches the JWT and an active server-side admin lock.
- The lock is heartbeat-based and supports two concurrent admin sessions.

### QR scanner
- Scanner credentials are initialized from `SCANNER_USERNAME` and `SCANNER_PASSWORD` on a fresh database.
- The stored password is a salted PBKDF2-HMAC-SHA256 hash with 210,000 iterations.
- Scanner JWTs carry a credential version.
- Changing the scanner ID or password increments the credential version and therefore revokes existing scanner JWTs.
- If scanner credentials are not configured for a fresh database, scanner login remains disabled rather than receiving a default password.

## 3. Authorization

Protected admin endpoints use the `admin()` dependency. Scanner endpoints use `scanner_user()`.

The frontend is not trusted for authorization. The backend decides whether an operation is allowed.

Examples:
- Event management requires an admin session.
- Gallery changes require an admin session.
- Lost & Found moderation requires an admin session.
- Scanner verification requires a scanner session.
- Public registration does not require an account but is restricted by server-side validation.

## 4. Token and pass handling

Registration pass tokens are generated with `secrets.token_urlsafe(32)` and stored as opaque values. They contain no personal information.

Pass-token operations use request bodies for the current web clients instead of putting tokens in URLs. This reduces accidental exposure through browser history, access logs, analytics, and referrer data.

QR check-in is performed inside a database transaction and refuses cancelled, wrong-event, or already-used passes.

## 5. Input validation

Server-side validation covers:
- required text fields
- length and word limits
- Indian mobile-number format
- email format where supplied
- allowed event status values
- allowed image MIME types
- image size limits
- scanner credential length
- pass-token length

SQL statements use psycopg parameter binding; user input is not concatenated into SQL.

## 6. File/image handling

The current application stores small base64 images in PostgreSQL for simplicity.

Server-side image validation now accepts only:
- PNG
- JPEG
- WebP

Uploads are limited to approximately 2.5 MB of decoded image data. SVG is deliberately rejected.

The public event gallery is capped to the newest 30 records to prevent an unbounded response.

For a larger production system, object storage with generated image URLs and server-side media processing would be preferable.

## 7. Browser security

The API sends baseline security headers including:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy`
- `Cache-Control: no-store` for API responses

Frontend builds should also be deployed with a restrictive Content Security Policy through the static-site host.

The current browser clients keep bearer tokens in `sessionStorage`. This is simpler for the academic architecture but means an XSS vulnerability could expose a live token. React's normal escaped rendering and the CSP reduce this risk; an HttpOnly cookie session is the stronger production design.

## 8. CORS

CORS is no longer `*`. It is controlled through `CORS_ALLOWED_ORIGINS`.

Production deployment must set this variable to the exact student/admin/scanner origins and must not use a wildcard.

## 9. Database security

- Parameterized SQL is used throughout the active API.
- Registration pass tokens have a unique constraint.
- Foreign keys protect event/gallery and lost-found relationships.
- QR entry changes are transactionally committed.
- Admin lock admission uses a PostgreSQL advisory transaction lock to prevent concurrent over-admission.

## 10. Findings fixed in this review

| Finding | Severity | Status |
|---|---|---|
| Hardcoded JWT secret fallback | Critical | Fixed |
| Hardcoded admin credential fallback | High | Fixed |
| Wildcard CORS | High | Fixed |
| Scanner credential fallback tied to admin credential | High | Fixed |
| Scanner JWTs remained valid after credential change | High | Fixed |
| Pass tokens sent in query strings by web clients | Medium | Fixed |
| Unrestricted image data-URI types | Medium | Fixed |
| Unbounded public gallery response | Medium | Fixed |
| Missing baseline API security headers | Medium | Fixed |
| Documentation described a different Spring Boot system | High | Fixed |

## 11. Remaining production hardening

These are not silently claimed as solved:

1. Extend the current process-local login rate limiting to distributed rate limiting for login, registration, scanner verification and public submissions.
2. Add centralized audit logging for admin and scanner actions.
3. Prefer HttpOnly secure cookies or a short-lived access-token/session architecture for production.
4. Add automated integration tests against PostgreSQL.
5. Run SAST, DAST and Python dependency vulnerability scanning in CI.
6. Add deployment-level CSP/security headers on the Render static sites.
7. Move large images to object storage instead of database base64 fields.
8. Review privacy/retention requirements for phone numbers and lost-and-found claimant data.
9. Add account lockout or progressive delay for repeated credential failures.
10. Use database migrations rather than application-startup schema mutation as the system grows.

The current login limiter is intentionally process-local; it is a useful baseline but is not a substitute for a shared production rate limiter.

## 12. Security conclusion

After the fixes in this review, the active code has a substantially safer baseline and the documentation now matches the deployed architecture. It is **not** appropriate to claim that the application is penetration-test clean or production-certified without the remaining controls and an independent security test.
