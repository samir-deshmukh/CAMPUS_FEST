# CampusFest Architecture

## Deliverable architecture

For the three-day academic deliverable, the demonstrated product is an offline React website. It is intentionally independent of the backend so the demo can run without internet access, a database, or cloud services.

## Repository

- admin/ — React + Vite website/demo
- backend/ — Spring Boot REST API and domain implementation
- docs/ — architecture, API, security, and requirements documentation
- DEMO.md — presentation/demo runbook

## Production-oriented architecture

    Student Web/App       Organizer Web       Judge Web
             \               |               /
                      REST API
                    Spring Boot
                    /    |    \
              PostgreSQL  Storage  Notifications

## Backend layers

Controller -> Service -> Repository -> PostgreSQL

Controllers handle HTTP and authentication context. Services enforce business rules and transactions. Repositories provide persistence and locking. Entities model the domain.

## Main domains

Authentication:
User and role management.

Events:
Event lifecycle, venue, capacity, schedule, ownership.

Registration:
Student participation with duplicate prevention and capacity enforcement.

Entry passes:
Opaque secure token, pass state, and check-in timestamp.

Competitions:
Competition lifecycle, scoring criteria, judge assignments.

Judging:
Judge evaluations and criterion-level scores.

Results:
Official publication and server-side ranking calculation.

## Security boundaries

Authentication and authorization belong at the backend boundary. The frontend must be treated as untrusted input. Hiding an action in React is not a security control.

Sensitive operations such as registration capacity checks, judge assignment, score validation, result publication, and QR check-in are therefore implemented or intended to be enforced server-side.

## Offline demo boundary

The website uses local mock data. Its buttons simulate successful workflows for demonstration and must not be described as connected production operations.

## Future evolution

If the project is expanded after submission, the React website can consume the existing REST API, real authentication can replace the role selector, PostgreSQL can become the source of truth, and storage/notification integrations can be added behind service interfaces.
