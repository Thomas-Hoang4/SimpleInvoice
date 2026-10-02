# Setup & Deployment

Instructions for running, testing, and deploying SimpleInvoice.

---

## Prerequisites

- **Node.js:** `>= 20.0.0`
- **Yarn:** `>= 1.22.0`
- **Docker & Docker Compose:** Required for containerized execution.

---

## Option 1: Docker Compose (Fastest Setup)

Starts PostgreSQL, backend API, and frontend Nginx container with one command:

```bash
docker compose up --build
```

### Access Points
- **Frontend App:** http://localhost
- **Backend API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api/docs
- **Health Check:** http://localhost:3000/health

### Stop Containers
```bash
docker compose down
```

---

## Option 2: Local Development with Yarn

### 1. Install Dependencies
```bash
yarn install
```

### 2. Configure Environment Files
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Start PostgreSQL Database
You can use Docker to run only PostgreSQL:
```bash
docker compose up -d postgres
```
*Or use your own local PostgreSQL instance on port `5432`.*

### 4. Run Migrations & Seed Database
```bash
yarn prisma:generate
yarn db:deploy
yarn seed
```

### 5. Start Development Servers
Run the backend and frontend in separate terminals:

```bash
# Terminal 1: Backend API (http://localhost:3000)
yarn dev:backend

# Terminal 2: Frontend App (http://localhost:5173)
yarn dev:frontend
```

---

## Reviewer Accounts

The seed script (`yarn seed`) creates these test accounts:

| Email | Password | Role |
| :--- | :--- | :--- |
| `reviewer@simpleinvoice.dev` *(or `reviewer@101digital.io`)* | `Password123!` | Standard Reviewer |
| `admin@simpleinvoice.dev` | `Admin2026!Secure` | Administrator |

*Tip: The web login page includes a **"Quick Fill"** button to populate reviewer credentials with one click.*

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | HTTP port for NestJS server |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/simple_invoice?schema=public` | PostgreSQL connection URL |
| `JWT_SECRET` | `super-secret-jwt-key...` | Secret key used for signing JWTs |
| `JWT_EXPIRES_IN` | `3600s` | Token validity duration |

### Frontend (`frontend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:3000` | Backend API base URL |

---

## Testing

SimpleInvoice includes comprehensive test suites across the frontend and backend.

```bash
# Run all unit tests (backend + frontend)
yarn test

# Run backend unit tests only (45 tests)
yarn test:backend

# Run frontend unit tests only (42 tests)
yarn test:frontend

# Run backend end-to-end integration tests (13 tests)
yarn test:e2e

# Generate test coverage reports
yarn test:cov
```
