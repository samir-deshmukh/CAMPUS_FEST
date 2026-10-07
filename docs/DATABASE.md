# Database Design

## Technology

PostgreSQL 16 is used by the active FastAPI backend. The application currently creates/updates its required tables at startup. A migration system is recommended as the schema grows.

## Tables

### `events`
Stores published, draft and closed events.

Key fields: `id`, `title`, `description`, `category`, `venue`, `start_time`, `end_time`, `capacity`, `status`, `poster_data`.

### `registrations`
Stores public event registrations and opaque entry passes.

Key fields: `id`, `event_id`, `name`, `course`, `phone`, `pass_token`, `status`, `entry_status`, `registered_at`.

`pass_token` is unique.

### `event_gallery`
Stores small event photos and descriptions.

Key fields: `id`, optional `event_id`, `photo_data`, `description`, `created_at`.

### `lost_found`
Stores found-item reports and moderation state.

Key fields: `id`, `type`, `item`, `description`, `location`, `contact`, `found_item_image`, `status`, `created_at`.

### `lost_found_claims`
Stores claimant information and the claim workflow.

Key fields: `id`, `item_id`, `full_name`, `college`, `course`, `year`, `email`, `phone`, `identification_details`, `lost_when_where`, `lost_item_image`, `status`, `created_at`.

### `scanner_credentials`
Stores the scanner username, salted password hash, default/migration flag and credential version.

The credential version is used to revoke previously issued scanner JWTs after a credential change.

### `admin_active_lock`
Stores active admin browser-tab identities and heartbeat timestamps.

The primary key is `(admin_key, client_id)`.

## Relationships

- An event can have many registrations.
- An event can have many gallery records.
- A found item can have many claims.
- A scanner credential record is singleton-style with `id = 1`.
- Admin lock records belong to the configured admin identity.

## Integrity and concurrency

Foreign keys protect event/gallery and lost-found claim relationships. The registration pass token is unique.

Scanner check-in runs inside a transaction and updates the entry state only after validating the pass.

Admin lock acquisition uses a PostgreSQL advisory transaction lock so simultaneous login attempts cannot both exceed the configured session limit.

## Privacy

Registration phone numbers and lost-and-found claimant details are personal data. Production deployments should define retention, access logging, backup protection and deletion policies before real-world use.
