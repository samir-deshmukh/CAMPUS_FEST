# CampusFest Limitations

- The project is an academic website and has not received a formal production security audit.
- Image files are stored as data in the database, which is simple but not ideal for large-scale media.
- Authentication uses administrator credentials supplied through environment variables.
- The current API uses permissive CORS and should be restricted to the deployed website origins before production.
- Rate limiting, centralized logging, monitoring, automated backups, and advanced abuse protection should be added for production.
- Entry verification currently remains an API capability; the separate scanner client has been removed from this website-only repository.

## Future improvements
- Object storage for images.
- Restricted CORS and stronger production security headers.
- Rate limiting and audit logging.
- Automated database backups and monitoring.
- A dedicated entry-verification interface only if the project scope later requires it.
