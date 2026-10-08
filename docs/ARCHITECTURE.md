# CampusFest Architecture

## Current architecture

Student Browser
    |
    v
Student React/Vite website
    |
    | HTTPS / JSON
    v
FastAPI backend
    |
    v
PostgreSQL

Administrator Browser
    |
    v
Admin React/Vite website
    |
    | HTTPS / JSON
    v
FastAPI backend

## Components
- site/ contains the public student interface.
- admin/ contains the administrator interface.
- backend/app/main.py contains the FastAPI API, validation, authentication, and database operations.
- PostgreSQL stores events, registrations, Lost & Found records, claims, gallery photos, and admin-lock state.
- render.yaml defines the three web services and database used for deployment.

## Design boundary
The backend is the source of truth for persistent state. The frontends do not contain an independent mock-data implementation.

The QR code generated for a registration is an entry-pass token. A standalone scanner application is intentionally not part of the website-only project.
