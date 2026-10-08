# CampusFest Database

CampusFest uses PostgreSQL through psycopg.

## Tables
- events — event information, poster data, and publication status.
- registrations — participant data, event relationship, pass token, and status.
- lost_found — found-item reports and status.
- lost_found_claims — claims linked to found items.
- event_gallery — event photos and descriptions.
- admin_active_lock — active administrator browser/session lock.

The FastAPI application creates or updates the required tables when it starts. Foreign keys protect event and Lost & Found relationships.
