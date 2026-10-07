# CampusFest Backend

## Active backend

`app/main.py` is the active FastAPI + PostgreSQL API used by the Render deployment.

Run locally with:

```bash
pip install -r requirements.txt
uvicorn app.main:app --app-dir . --reload
```

Required environment variables are documented in `.env.example`.
