# Database Design

## 1. Database technology
The backend is designed for PostgreSQL using Spring Data JPA/Hibernate. Local development is configured through environment variables with PostgreSQL defaults for development only.

## 2. Main entities
### users
Stores authenticated accounts.
- `id` primary key
- `name`
- `email` unique
- `password_hash`
- `role` (`STUDENT`, `ORGANIZER`, `JUDGE`, `ADMIN`)
- `active`
- `created_at`

### events
Stores college events.
- `id` primary key
- `title`, `description`, `category`, `venue`
- `start_time`, `end_time`
- `capacity`
- `status` (`DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`)
- `created_by` → users
- `created_at`, `updated_at`

### registrations
Connects students to events.
- `id` primary key
- `event_id` → events
- `user_id` → users
- `status` (`ACTIVE`, `CANCELLED`)
- `registered_at`
- unique constraint on `(event_id, user_id)`

### entry_passes
Stores one opaque pass per registration.
- `id` primary key
- `registration_id` → registrations, unique
- `token` unique, 64-character hex value
- `status` (`ACTIVE`, `USED`, `REVOKED`)
- `issued_at`, `checked_in_at`

### competitions
Stores competitions associated with events.
- `id` primary key
- `event_id` → events
- `title`, `description`
- `status` (`DRAFT`, `OPEN`, `CLOSED`, `PUBLISHED`)
- `created_by` → users
- `created_at`

### scoring_criteria
Defines competition scoring rules.
- `id` primary key
- `competition_id` → competitions
- `name`, `description`
- `max_score`
- `sort_order`

### judge_assignments
Maps judges to competitions.
- `id` primary key
- `competition_id` → competitions
- `judge_id` → users
- unique `(competition_id, judge_id)`

### evaluations
Stores one judge's total evaluation for a registration.
- `id` primary key
- `competition_id` → competitions
- `registration_id` → registrations
- `judge_id` → users
- `total_score`
- `submitted_at`
- unique `(judge_id, registration_id)`

### criterion_scores
Stores the individual score for each criterion.
- `id` primary key
- `evaluation_id` → evaluations
- `criterion_id` → scoring_criteria
- `score`
- unique `(evaluation_id, criterion_id)`

## 3. Relationships
- One user can create many events and competitions.
- One event has many registrations and can have many competitions.
- One registration belongs to one user and one event and can have one entry pass.
- One competition has many criteria, judge assignments and evaluations.
- One evaluation belongs to one judge, one competition and one registration and contains multiple criterion scores.

## 4. Integrity and indexing
Foreign keys enforce relationships. Unique constraints prevent duplicate registrations, duplicate passes, duplicate judge assignments and duplicate criterion scores. Indexes are present for event time/status, registration user, pass token, competition event/status, judge assignments, and evaluations.

## 5. Concurrency
Event registration locks the selected event row before checking capacity and creating a registration. This reduces race-condition overbooking when multiple registrations arrive concurrently.
