# CampusFest Software Requirements

## Scope
CampusFest is a website-based college event-management system. It has a public student website, an administrator website, and a FastAPI backend.

## Functional requirements
- Display published events and posters.
- Allow students to register with name, course, and mobile number.
- Generate a unique entry pass with a QR token.
- Allow a participant to cancel a registration using the downloaded pass image.
- Provide a Lost & Found reporting and claiming workflow.
- Provide an event photo gallery.
- Allow administrators to authenticate and manage events, registrations, gallery photos, and Lost & Found records.
- Keep only one active administrator browser session through the admin lock mechanism.

## Non-functional requirements
- Validate important input on the server.
- Store administrator passwords through environment configuration rather than source code.
- Use signed JWT administrator sessions.
- Use PostgreSQL for persistent data.
- Keep the public and admin interfaces separate from the API.

## Out of scope
Mobile applications and a separate QR-scanner client are not part of this repository.
