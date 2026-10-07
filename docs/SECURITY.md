# CampusFest Security Documentation

## Scope

CampusFest contains a Spring Boot backend and an offline React demonstration website. The offline website uses mock data and does not provide real authentication, authorization, registration, QR validation, or persistence.

The backend is the security reference implementation.

## Authentication

- Stateless JWT authentication is used.
- Passwords are stored as BCrypt hashes, never plaintext.
- BCrypt strength is configured to 12.
- Authentication identifies users by email.
- JWT validation is performed by a security filter before protected requests reach application logic.

## Authorization and RBAC

Roles are STUDENT, ORGANIZER, JUDGE, and ADMIN.

Authorization is enforced on the backend, not only by hiding frontend controls.

- Students can access their own registration/pass workflows.
- Organizers manage events and judging operations permitted to their account.
- Judges can evaluate only competitions assigned to them.
- Admin has elevated management permissions.

## Registration integrity

Registration uses a database uniqueness constraint on event and user. Event capacity is checked inside a transaction while the event row is pessimistically locked. This reduces race-condition risk when simultaneous users attempt the last available seats.

## QR entry passes

Pass tokens are generated using SecureRandom with 256 bits of randomness and contain no personal information. Check-in validates the token and pass state on the backend. A pass cannot be checked in twice once marked USED.

## Judge scoring

Judge assignment is validated by role. Judges must be assigned to the competition, the competition must be OPEN, the participant registration must be active and belong to the same event, and submitted scores are checked against server-side criteria limits. Total score is calculated by the server.

## Results

Official results are hidden until publication. Published ranking is calculated from stored judge evaluations. Raw evaluation data is not exposed through the public results response.

## Input validation

Backend request DTOs use Bean Validation for required fields, length limits, numeric limits, and event time ordering.

## Production hardening

For a production deployment, configure HTTPS/TLS, restrictive CORS, security headers, request size limits, rate limiting, centralized secrets, audit logging, dependency scanning, and security testing.

The local development database password must be supplied through environment variables for production.

## Known MVP hardening items

1. Add refresh-token/session lifecycle controls if long-lived sessions are required.
2. Add explicit CORS policy rather than broad origins.
3. Add rate limiting and abuse controls.
4. Add CSRF protection if browser cookies are used for authentication.
5. Add 2FA for organizer/admin accounts.
6. Add centralized audit events for security-sensitive actions.
7. Require all eligible participants to have required judge evaluations before official publication, or document an explicit exception workflow.
8. Separate competition lifecycle state from result-publication state if the domain grows.
9. Run dependency, SAST, and DAST scans before release.
10. Never expose actuator or API documentation publicly without an intentional access policy.

## Threat model summary

Primary threats are credential theft, unauthorized role escalation, registration abuse, QR replay, malicious input, unauthorized judge access, and accidental exposure of private evaluation data.

Primary controls are password hashing, JWT authentication, backend RBAC, database constraints, transactional capacity enforcement, cryptographically random opaque QR tokens, validation, ownership checks, and controlled result publication.
