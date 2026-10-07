# Limitations and Future Scope

## Current limitations

1. The active API is implemented as a single FastAPI module; it is easy to follow for the current project but should be split into routers/services as the system grows.
2. The application stores small base64 images in PostgreSQL instead of object storage.
3. The browser clients keep bearer tokens in `sessionStorage`; HttpOnly secure cookies would provide stronger XSS resistance.
4. Rate limiting is not yet distributed or database-backed.
5. Security audit logging is not yet centralized.
6. Python dependency advisory scanning was not available on the current review machine.
7. Automated end-to-end tests against PostgreSQL are still limited.
8. Schema changes are applied at application startup rather than through versioned migrations.
10. Competition, judging and official-result functionality is outside the current active Python API scope.

## Future scope

- Split FastAPI routes, services and database access into maintainable modules.
- Add PostgreSQL migrations.
- Add distributed rate limiting and abuse controls.
- Add centralized security audit logs.
- Move images to object storage.
- Replace bearer tokens in browser storage with a secure session/cookie design where practical.
- Add CI SAST, dependency scanning and DAST.
- Add integration tests with PostgreSQL.
- Define personal-data retention and deletion rules.
- Add competition/judging functionality to the active API only if it is still required by the project scope.
