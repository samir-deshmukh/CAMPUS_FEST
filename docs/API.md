# CampusFest API Reference

Base path: /api

## Health

GET /health
- Returns backend service health.

## Authentication

POST /auth/register
- Creates a user account and stores a BCrypt password hash.

POST /auth/login
- Authenticates credentials and returns a JWT authentication response.

## Events

GET /events
GET /events/{id}
- Read event information.

GET /events/all
- Organizer/Admin event listing.

POST /events
PUT /events/{id}
DELETE /events/{id}
- Organizer/Admin event management.

## Registrations

POST /registrations/events/{eventId}
- Creates an active registration and enforces event capacity.

GET /registrations/me
- Lists the authenticated user's registrations.

DELETE /registrations/{id}
- Cancels the authenticated user's own registration.

## Entry passes

POST /passes/registrations/{registrationId}
- Issues a pass for an active registration.

GET /passes/registrations/{registrationId}
- Gets the user's pass.

POST /passes/check-in?token={token}
- Organizer/Admin check-in with backend token validation.

## Competitions

GET /competitions
GET /competitions/{id}

POST /competitions
PUT /competitions/{id}
DELETE /competitions/{id}

POST /competitions/{id}/criteria
GET /competitions/{id}/criteria

POST /competitions/{id}/judges/{judgeId}
GET /competitions/{id}/judges

GET /judging/my-competitions

POST /judging/competitions/{id}/evaluations
- Judge submission; server calculates total score.

## Official results

POST /competitions/{id}/publish-results
- Organizer/Admin publishes official results after competition closure.

GET /competitions/{id}/results
- Returns published rankings without exposing raw judge evaluations.

## API security model

Protected endpoints require a valid JWT. Role checks use Spring Security method authorization and service-level ownership/business validation.

The API is designed for backend enforcement; the frontend must not be trusted to enforce permissions.
