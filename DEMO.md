# CampusFest — Offline Demo

## Run

The project is designed for a 3-day academic demonstration. No backend, database, cloud service, API, or internet connection is required for the website demo.

From `admin/`:

```bash
npm ci
npm run dev
```

For a static build:

```bash
npm run build
```

Open `admin/dist/index.html` from the built output. Vite is configured with a relative base so generated assets use relative paths.

## Demo flow

1. Open CampusFest Overview.
2. Go to Events and filter by Cultural, Technical, Arts, or Academic.
3. Register for an event.
4. Open My Passes and show the generated entry pass.
5. Open Master Schedule and Campus Map.
6. Open Official Results and explain that rankings use judge scores and tied ranks are supported.
7. Open Lost & Found and submit a sample report.
8. Switch the role selector to Organizer and show the organizer operations dashboard.
9. Switch to Judge and show the judging workspace.
10. Return to Student for the final walkthrough.

## Important scope decision

The Flutter mobile app and live deployment were intentionally removed from the 3-day deliverable. The Spring Boot backend remains in the repository as supporting architecture, but the demonstrated product is the offline React website.

## Roles represented

- Student — discover, register, passes, schedule, results, map, lost & found, profile
- Organizer — event operations and result publication workflow
- Judge — assigned competition evaluation workflow

## Data

The website uses local mock data for predictable offline demonstration. It does not claim to be connected to the production backend.
