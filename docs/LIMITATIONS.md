# Limitations and Future Scope

## Current limitations
1. The website is an offline static demo and does not call the Spring Boot API.
2. Demo data is hard-coded/mock data and is not backed by PostgreSQL.
3. Registration, pass generation and other visible actions are simulated in browser state.
4. Flutter mobile delivery is intentionally excluded from the current 3-day submission scope.
5. There is no production deployment in the current deliverable.
6. Backend production hardening such as rate limiting, 2FA, centralized audit logging and comprehensive integration testing remains future work.
7. Result publication currently accepts any non-empty evaluation set; a production system should define and enforce complete judging coverage or an explicit exception workflow.
8. Competition lifecycle and result-publication state are currently represented through the same competition status enum; production design could separate these concerns.

## Future scope
- Connect the React website to the Spring Boot REST API.
- Add PostgreSQL-backed persistence and migrations.
- Add secure session/refresh-token lifecycle.
- Add rate limiting and abuse detection.
- Add organizer/admin 2FA.
- Add centralized audit logs and monitoring.
- Add automated integration and security testing.
- Add file/object storage for event assets if required.
- Add notifications and email delivery.
- Reintroduce a Flutter mobile client when time and deployment scope allow.
- Deploy behind HTTPS with managed secrets and restricted infrastructure endpoints.
