# 📄 SimpleInvoice

An enterprise-grade, full-stack Invoice Management System built with **NestJS**, **Prisma ORM**, **PostgreSQL**, **Vite + React**, **TypeScript**, and **Tailwind CSS**.

SimpleInvoice enables businesses to generate, track, filter, and inspect invoices with live calculation previews, read-time dynamic overdue derivation, responsive multi-breakpoint layouts, and strict type-safe validation.

---

## ⚡ Reviewer Quick Start & Access

### Application URLs
| Service | Local Dev URL | Docker Compose URL |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | [http://localhost](http://localhost) |
| **Backend REST API** | [http://localhost:3000](http://localhost:3000) | [http://localhost:3000](http://localhost:3000) |
| **Swagger OpenAPI Docs** | [http://localhost:3000/api/docs](http://localhost:3000/api/docs) | [http://localhost:3000/api/docs](http://localhost:3000/api/docs) |
| **Health Check** | [http://localhost:3000/health](http://localhost:3000/health) | [http://localhost:3000/health](http://localhost:3000/health) |

### Default Reviewer Credentials
The database seed script initializes ready-to-test reviewer accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Reviewer (Default)** | `reviewer@simpleinvoice.dev` *(or `reviewer@101digital.io`)* | `Password123!` |
| **System Admin** | `admin@simpleinvoice.dev` | `Admin2026!Secure` |

> 💡 **Reviewer Convenience:** The login screen at `/login` includes a **"Reviewer Demo Access"** helper card with a **"Quick Fill"** button that populates the reviewer credentials with a single click.

---

## 🚀 Running the Project

### Option A: Docker Compose (Recommended — Zero Setup)

Ensure Docker Desktop or Docker Engine is running, then execute from the repository root:

```bash
docker compose up --build
```

This single command orchestrates:
1. **`postgres`**: PostgreSQL 16 container with persistent data volume and healthchecks.
2. **`backend`**: Multi-stage NestJS container. Automatically applies Prisma migrations, seeds the database, and boots on `http://localhost:3000`.
3. **`frontend`**: High-performance production Nginx container serving the Vite React static bundle on `http://localhost:80`.

To stop the containers:
```bash
docker compose down
```

---

### Option B: Local Development (Yarn)

#### Prerequisites
- **Node.js** `>= 20.0.0`
- **Yarn** `>= 1.22.0` (or Yarn Modern)
- **PostgreSQL** `>= 15.0` running locally (or via `docker compose up -d postgres`)

#### Step-by-Step Setup

1. **Install Root & Workspace Dependencies:**
   ```bash
   yarn install
   ```

2. **Configure Environment Variables:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   *Edit `backend/.env` if your local PostgreSQL credentials differ from `postgresql://postgres:postgres@localhost:5432/simple_invoice?schema=public`.*

3. **Generate Prisma Client & Run Migrations:**
   ```bash
   yarn prisma:generate
   yarn db:deploy
   ```

4. **Seed Mock Invoices & Users:**
   ```bash
   yarn seed
   ```
   *Seeds the Appendix A specification invoice (`IV1780488206995`), 30+ diverse invoices, and reviewer accounts.*

5. **Start Development Servers:**
   ```bash
   # Terminal 1: Start Backend NestJS Server (http://localhost:3000)
   yarn dev:backend

   # Terminal 2: Start Frontend Vite Server (http://localhost:5173)
   yarn dev:frontend
   ```

---

## 🏗️ Architecture & Technology Stack

```
SimpleInvoice/
├── backend/                  # NestJS 10 REST API
│   ├── prisma/               # Schema, migrations & client definition
│   └── src/
│       ├── auth/             # Passport JWT authentication, guards & strategies
│       ├── common/           # Global exception filter, decorators, DTOs
│       ├── database/         # Database seed script (Appendix A + 30+ records)
│       ├── invoices/         # Invoices controller, service & calculation engine
│       │   └── engine/       # Pure domain financial calculation engine
│       └── prisma/           # Prisma lifecycle service
├── frontend/                 # Vite + React 19 Single Page Application
│   ├── src/
│   │   ├── components/       # Reusable UI primitives, auth forms & invoice widgets
│   │   │   ├── auth/         # LoginForm, ReviewerQuickFill
│   │   │   ├── invoices/     # InvoiceTable, InvoiceFilters, LivePreview, LineItemsTable
│   │   │   ├── layout/       # AppLayout, Navbar, ProtectedRoute
│   │   │   └── ui/           # Button, Input, Select, Badge, Card, Spinner
│   │   ├── context/          # AuthContext (stateless JWT sync)
│   │   ├── pages/            # LoginPage, CreateInvoicePage, InvoiceListPage, InvoiceDetailPage
│   │   └── services/         # Axios API client, TanStack Query hooks
├── .github/workflows/        # Automated CI workflow
└── docker-compose.yml        # Multi-container orchestration
```

### Backend Stack
- **Framework**: [NestJS 10](https://nestjs.com/) with TypeScript in strict mode
- **ORM & Database**: [Prisma ORM 6](https://www.prisma.io/) + [PostgreSQL 16](https://www.postgresql.org/)
- **Authentication**: JWT access tokens via `@nestjs/jwt`, `@nestjs/passport`, and `bcryptjs`
- **Validation**: `class-validator` and `class-transformer` via global `ValidationPipe` (whitelisting and forbidding non-whitelisted properties)
- **API Documentation**: [Swagger / OpenAPI 3.0](https://swagger.io/) with interactive test execution
- **Testing**: Jest + Supertest for unit and end-to-end (E2E) testing

### Frontend Stack
- **Framework**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **Data Fetching & Cache**: [TanStack Query v5](https://tanstack.com/query) (automatic background refetching and cache invalidation)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with responsive breakpoints
- **Form & Schema Validation**: [Zod](https://zod.dev/) for client-side validation
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: Vitest + React Testing Library + `@testing-library/jest-dom`

---

## 💡 Key Architectural & Domain Decisions

### 1. Read-Time Dynamic "Overdue" Status Derivation
- **Requirement**: Invoices must display as `Overdue` when unpaid and the due date has passed.
- **Decision**: `Overdue` is **never written to the database**.
- **Rationale**: Persisting an "Overdue" state in the database requires recurring cron jobs or database triggers, which can cause state desynchronization and stale records. Instead, the database only stores `Draft`, `Pending`, or `Paid`.
- **Derivation Logic**:
  ```ts
  if (persistedStatus !== 'Paid' && new Date(dueDate) < today) {
    return 'Overdue';
  }
  return persistedStatus;
  ```
- Paid invoices whose due date is in the past remain `Paid`. When searching or filtering by `status=Overdue`, the database query dynamically matches invoices where `dueDate < CURRENT_DATE AND status != 'Paid'`.

### 2. Pure Server-Side Financial Calculation Engine
- **Requirement**: Total amount, tax amount, and balance amount calculations must be strictly computed on the backend to avoid floating-point errors and client manipulation.
- **Formula**:
  - `subTotal = quantity * rate`
  - `taxAmount = round(subTotal * (taxPercent / 100), 2)`
  - `totalAmount = round(subTotal + taxAmount - discount, 2)`
  - `balanceAmount = round(totalAmount - totalPaid, 2)`
- **Implementation**: Encapsulated within `invoice-calculations.ts` as pure domain functions with 100% unit test coverage. The frontend provides a live reactive preview mirroring this math for immediate user feedback before saving.

### 3. Customer Upsert Pattern
- Invoices are linked to a `Customer` entity via `customerId`.
- When creating an invoice, the system automatically checks whether a customer with the given email already exists:
  - If found, it updates customer contact info if necessary and associates the invoice.
  - If not found, a new customer record is automatically created within the same database transaction.

### 4. Standardized Global Error Envelope
Every HTTP error (400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Error) is normalized by `HttpExceptionFilter`:
```json
{
  "statusCode": 400,
  "message": ["dueDate must be on or after invoiceDate"],
  "error": "Bad Request"
}
```

---

## 📡 API Reference & Swagger Documentation

Interactive OpenAPI documentation is available at `http://localhost:3000/api/docs`.

### Primary Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user and returns JWT token + profile |
| `GET` | `/api/auth/me` | Bearer | Returns the authenticated user's profile |
| `GET` | `/api/invoices` | Bearer | Returns paginated invoices with search, filters & sort |
| `POST` | `/api/invoices` | Bearer | Creates a new invoice with server-calculated amounts |
| `GET` | `/api/invoices/:id` | Bearer | Returns invoice details with customer and line items |
| `GET` | `/health` | Public | Service healthcheck endpoint |

#### Example Query Parameters for `GET /api/invoices`:
- `keyword`: Partial text match on `invoiceNumber` or `customer.fullname`
- `status`: Filter by `Draft`, `Pending`, `Paid`, or `Overdue`
- `fromDate` & `toDate`: ISO date range filter on `invoiceDate`
- `sortBy`: `invoiceDate`, `dueDate`, or `totalAmount`
- `ordering`: `ASC` or `DESC`
- `page`: Page number (default: `1`)
- `pageSize`: Items per page (default: `10`)

---

## 🧪 Testing & Quality Assurance

Both frontend and backend include comprehensive unit and integration/E2E test suites:

### Running Tests

```bash
# Run all unit tests across frontend and backend
yarn test

# Run backend unit tests only (45 tests across 9 suites)
yarn test:backend

# Run backend end-to-end (E2E) integration tests (13 tests)
yarn test:e2e

# Run frontend tests (42 tests across 13 suites)
yarn test:frontend

# Generate test coverage reports
yarn test:cov
```

### Test Coverage Highlights
- **Backend Unit Tests (45/45 passing)**:
  - Calculation engine (`subTotal`, `taxAmount`, `totalAmount`, `balanceAmount`, discounts, edge cases)
  - Read-time Overdue derivation logic
  - Invoices service CRUD & query builder filters
  - JWT Auth service, strategies, guards, and password verification
  - Global `HttpExceptionFilter` exception transformation
- **Backend E2E Tests (13/13 passing)**:
  - Authentication flow (`POST /auth/login` & `GET /auth/me`)
  - Invoice creation with payload validation (`POST /invoices`)
  - Filtered listing, status derivation, pagination, and sorting (`GET /invoices`)
  - Detail retrieval (`GET /invoices/:id`) and 404 handling
- **Frontend Unit Tests (42/42 passing)**:
  - `LoginForm` validation and `ReviewerQuickFill` integration
  - `CreateInvoicePage` validation, date logic (`dueDate >= invoiceDate`), and `LiveInvoicePreview`
  - `InvoiceListPage` table, status chips, debounced search, and pagination controls
  - `InvoiceDetailPage` line items breakdown, financial summary, and print triggers

---

## 📦 Monorepo Scripts Reference

All primary commands are executable from the root repository directory:

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `yarn dev:backend` | `npm run start:dev --prefix backend` | Start NestJS backend in hot-reload mode |
| `yarn dev:frontend` | `npm run dev --prefix frontend` | Start Vite React dev server |
| `yarn build` | `yarn build:backend && yarn build:frontend` | Type-check and build production bundles |
| `yarn seed` | `npm run seed --prefix backend` | Seed database with reviewer and mock invoices |
| `yarn prisma:generate`| `npm run prisma:generate --prefix backend` | Regenerate Prisma client |
| `yarn db:deploy` | `yarn --cwd backend prisma migrate deploy` | Apply pending database migrations |
| `yarn test` | `yarn test:backend && yarn test:frontend` | Run all unit tests |
| `yarn test:e2e` | `npm run test:e2e --prefix backend` | Run backend end-to-end integration tests |
| `yarn docker:up` | `docker compose up -d` | Launch all containers in background |
| `yarn docker:down` | `docker compose down` | Stop and tear down Docker containers |

---

## 📄 License

This project is licensed under the MIT License.
