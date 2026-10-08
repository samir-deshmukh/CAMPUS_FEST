# CampusFest User Guide

## Student website
1. Open the CampusFest student website.
2. Select a published event.
3. Enter the requested registration details.
4. Submit the registration.
5. Download the generated entry pass.
6. Use the Cancel Registration page if the registration must be cancelled.
7. Use Lost & Found to report a found item or submit a claim for an available item.
8. Open Event Gallery to view published event photos.

## Administrator website
1. Open the CampusFest admin website.
2. Sign in with the configured administrator credentials.
3. Events: post, edit, publish, close, reopen, or delete events.
4. Registrations: select an event and inspect its registrations.
5. Event Gallery: upload, edit, and delete photos.
6. Lost & Found: review reports and manage claims.
7. Only the active administrator browser session should continue to operate.

## Deployment
The websites communicate with the backend through VITE_API_URL. The backend connects to PostgreSQL through DATABASE_URL.
