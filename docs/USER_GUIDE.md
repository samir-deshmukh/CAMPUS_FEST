# User Guide – CampusFest Offline Demo

## 1. Start the demo
From the repository root:

```bash
cd admin
npm ci
npm run dev
```

For a production-style static build:

```bash
npm run build
```

The resulting `dist/index.html` is designed for offline use.

## 2. Student demo flow
1. Open **Overview** to see the festival summary.
2. Select **Events**.
3. Search by event, category or venue.
4. Use category filters to narrow the list.
5. Open an event card to view details.
6. Select **Register now**.
7. Open **My Passes** to see the simulated entry pass.
8. Use **Schedule** for the event timeline.
9. Use **Campus Map** for venue information.
10. Open **Results** for published competition outcomes.
11. Use **Lost & Found** to demonstrate the report form.
12. Use **Profile** to demonstrate student account information.

## 3. Role demonstration
The sidebar role selector switches the demo view between Student, Organizer and Judge. This is a presentation-only role switch; it does not authenticate against the backend.

- **Organizer:** demonstrate event/competition management concepts and result workflow.
- **Judge:** demonstrate the judging workspace.
- **Student:** demonstrate discovery, registration, pass and result viewing.

## 4. Presentation tip
A short demonstration should follow: Overview → Events/search → event details → Register → My Passes → Schedule/Map → Results → Organizer → Judge.

## 5. Important limitation
The website is an offline academic demonstration. Actions shown in the UI are simulated locally and are not persisted to PostgreSQL.
