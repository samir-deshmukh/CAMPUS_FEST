# CampusFest Security

## Current controls
- Administrator authentication uses a signed JWT.
- Administrator API routes require an authenticated admin role.
- The backend validates names, courses, mobile numbers, and other submitted text.
- Registration pass tokens are generated with cryptographically secure randomness.
- Database queries use parameterized SQL.
- The admin panel uses a client identifier and heartbeat/release mechanism to prevent simultaneous administrator sessions.
- Credentials are supplied through environment variables.

## Production hardening
Before real-world deployment:
- Use a strong randomly generated SECURITY_JWT_SECRET.
- Never commit administrator credentials.
- Restrict CORS to the actual student/admin origins.
- Add API rate limiting and request-size limits.
- Use HTTPS only.
- Add security headers and centralized audit logging.
- Back up PostgreSQL and test restoration.
- Move gallery and Lost & Found images to object storage for scale.
- Run dependency and application security scans regularly.

The repository no longer contains the former Flutter client or separate QR-scanner client.
