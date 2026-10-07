# Software Requirements Specification (SRS)

## 1. Purpose
CampusFest is a college event-management system designed to centralize event discovery, registration, entry passes, competitions, judging, and published results.

For the current academic deliverable, the primary user-facing artifact is an offline React website demo. The Spring Boot backend in this repository documents and implements the production-oriented API foundation.

## 2. Scope
### Included
- Student event discovery and search
- Event registration and cancellation
- Student entry-pass workflow
- Event schedule and venue information
- Competition management
- Judge assignment and scoring
- Official result publication
- Role-aware organizer and judge workspaces in the demo
- Backend authentication and authorization
- Validation and concurrency protection for registrations

### Current deliverable boundary
The Flutter mobile application and live deployment are intentionally outside the 3-day deliverable. The website is designed to run offline with local mock data. Backend APIs are supporting architecture and are not connected to the static demo.

## 3. Actors
- **Student:** discovers events, registers, views passes and results.
- **Organizer:** creates/manages events and competitions and publishes authorized results.
- **Judge:** views assigned competitions and submits evaluations.
- **Admin:** privileged management role with cross-competition administration rights.

## 4. Functional requirements
| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Users can authenticate through register/login APIs. | High |
| FR-02 | Organizers/admins can create, update and delete events subject to ownership rules. | High |
| FR-03 | Students can register for published events while capacity remains. | High |
| FR-04 | Duplicate active registrations are prevented. | High |
| FR-05 | Students can cancel their own registrations. | High |
| FR-06 | Students can issue/retrieve an entry pass for an active registration. | High |
| FR-07 | Organizers/admins can validate an entry pass at check-in. | High |
| FR-08 | Organizers/admins can manage competitions. | High |
| FR-09 | Organizers/admins can define scoring criteria and assign judges. | High |
| FR-10 | Assigned judges can submit one validated evaluation per participant. | High |
| FR-11 | Authorized organizers/admins can publish competition results after closure. | High |
| FR-12 | Students can browse schedules, venues and published results in the demo. | Medium |
| FR-13 | The website supports responsive presentation on desktop and mobile-sized screens. | Medium |

## 5. Non-functional requirements
- **Security:** password hashing, JWT authentication, RBAC, ownership checks, validation, opaque random pass tokens.
- **Integrity:** database uniqueness constraints and transaction/locking for event capacity.
- **Usability:** clear navigation, visible registration state, responsive layout and meaningful demo pages.
- **Maintainability:** layered Spring Boot backend and separate React frontend.
- **Offline operation:** the current website build must work without external fonts, APIs or network resources.
- **Performance:** static frontend should load locally without a backend dependency; backend uses indexed relational entities for core lookups.

## 6. Assumptions and constraints
- PostgreSQL is the intended backend database.
- Java 21 is the backend runtime target.
- The demo uses mock data and simulated actions.
- Production deployment would require HTTPS, managed secrets, rate limiting, monitoring and additional hardening.

## 7. Acceptance criteria
The current deliverable is acceptable when the static site builds successfully, navigation and demo actions work, documentation describes the actual scope, backend authorization rules compile, and no committed production secrets are used.
