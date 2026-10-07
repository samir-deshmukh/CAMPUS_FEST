# Software Requirements Specification (SRS)

## 1. Purpose

CampusFest is a college event-management website that centralizes event publishing, student registration, QR-based entry, event gallery content, lost-and-found workflows and controlled entry scanning.

## 2. Current scope

### Student website
- Browse published events
- View event posters and descriptions
- Register with name, course and phone
- Receive a QR entry pass
- Download the pass as an image
- Cancel an unused registration by uploading the pass image
- View event gallery
- Report found items and submit claims

### Admin panel
- Secure admin login
- Manage events and posters
- View registrations
- Manage event gallery
- Moderate Lost & Found
- Configure scanner credentials
- Maintain an active-tab lock

### QR scanner
- Secure scanner login
- Select a published event
- Scan entry QR codes using the device camera
- Accept valid unused passes
- Reject cancelled, wrong-event and already-used passes

## 3. Actors

- **Student/public visitor:** uses the public website and registration/lost-found workflows.
- **Administrator:** manages event and operational data.
- **Entry scanner:** authorized event staff using the scanner client.

## 4. Non-functional requirements

- Backend authorization must not depend on frontend UI controls.
- Secrets must be environment supplied and must not have production fallbacks in source code.
- SQL must use parameterized statements.
- User input must be validated on the server.
- QR pass tokens must be cryptographically random and opaque.
- Uploads must have server-side type and size checks.
- CORS must be allow-list based.
- Public responses should be bounded where data can grow without limit.
- Documentation must describe the active Python/FastAPI architecture.

## 5. Data requirements

PostgreSQL stores events, registrations, gallery records, lost-and-found reports/claims, scanner credentials and admin locks.

## 6. Security requirements

- Admin JWT authentication
- Scanner JWT authentication
- Server-side role separation
- Scanner credential-version revocation
- Active admin-session control
- Security response headers
- Restricted CORS
- Parameterized SQL
- Secure random pass tokens
- Server-side input/image validation

## 7. Out of scope / future work

- Full student account management
- Competition/judge subsystem in the active Python implementation
- Push notifications
- Large-scale media storage
- Distributed rate limiting
- Centralized audit logging
- Independent penetration testing

The repository's Java competition subsystem is retained as legacy prototype code and is not part of the current runtime requirements.

## 8. Acceptance criteria

The implementation is acceptable for the current academic stage when the three React clients build, the FastAPI backend passes syntax checks, security-sensitive endpoints enforce authentication, no production secret is hardcoded, dependency checks are clean where available, and documentation matches the active architecture.
