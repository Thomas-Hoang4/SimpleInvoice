# SimpleInvoice Documentation

SimpleInvoice is a full-stack invoice management application with a NestJS backend, Vite + React frontend, and PostgreSQL database.

This folder contains clear, concise technical documentation for developers and reviewers.

## Documentation Index

| Document | Description |
| :--- | :--- |
| [Architecture](architecture.md) | System components, data flow, monorepo layout, and key design decisions. |
| [API Reference](api.md) | Endpoints, query parameters, request/response formats, and error codes. |
| [Database Schema](database.md) | PostgreSQL schema, Prisma models, relations, indexes, and seed data. |
| [Business Logic](business-logic.md) | Financial calculation formulas, rounding rules, and read-time overdue status derivation. |
| [Setup & Deployment](setup.md) | Prerequisites, running locally, Docker Compose, running tests, and environment variables. |
| [Screenshots](screenshots/) | UI screenshots of authentication, invoice list, and invoice details views. |

---

## Quick Reference

### Service URLs

| Service | Local Dev URL | Docker Compose URL |
| :--- | :--- | :--- |
| **Frontend Web App** | http://localhost:5173 | http://localhost |
| **Backend REST API** | http://localhost:3000 | http://localhost:3000 |
| **Swagger OpenAPI Docs** | http://localhost:3000/api/docs | http://localhost:3000/api/docs |
| **Health Check** | http://localhost:3000/health | http://localhost:3000/health |

### Reviewer Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Reviewer (Default)** | `reviewer@simpleinvoice.dev` *(or `reviewer@101digital.io`)* | `Password123!` |
| **Admin** | `admin@simpleinvoice.dev` | `Admin2026!Secure` |

---

## Screenshots

- [Authentication Portal](screenshots/0EDBE8A0-5051-4D89-9313-18CC37DFCFC3.png) — Login screen with reviewer quick-fill.
- [Invoice List View](screenshots/6CA8AA89-1C3C-4846-842C-82FF267813C1.png) — Filter chips, search bar, and invoice table.
- [Invoice Detail View](screenshots/C8501494-B737-4B14-A26C-CC0F6F1A6BE8.png) — Customer details, itemized breakdown, and totals.
