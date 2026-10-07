# CampusFest Backend

## Active backend

`app/main.py` is the active FastAPI + PostgreSQL API used by the Render deployment.

Run locally with:

```bash
pip install -r requirements.txt
uvicorn app.main:app --app-dir . --reload
```

Required environment variables are documented in `.env.example`.

## Legacy backend

`src/main/java/` contains an older Spring Boot prototype. It is not used by the current deployment. Do not add new active features there unless the architecture is intentionally migrated back to Java.
