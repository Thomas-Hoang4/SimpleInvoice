# API Reference

SimpleInvoice provides a REST API built with NestJS.

- **Base URL:** `http://localhost:3000`
- **Interactive Swagger Docs:** `http://localhost:3000/api/docs`
- **Authentication:** Bearer token passed in the `Authorization` header:
  ```http
  Authorization: Bearer <access_token>
  ```

---

## Endpoints Summary

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/login` | None | Authenticate user with email and password |
| `GET` | `/auth/me` | Bearer | Return current user profile |
| `GET` | `/invoices` | Bearer | List invoices with search, filter, sort, and pagination |
| `GET` | `/invoices/:id` | Bearer | Get invoice details by UUID or invoice number |
| `POST` | `/invoices` | Bearer | Create a new invoice in Draft status |
| `GET` | `/health` | None | Check API health status |

---

## 1. Authentication

### `POST /auth/login`
Authenticates a user and returns a JWT access token.

**Request Body:**
```json
{
  "email": "reviewer@simpleinvoice.dev",
  "password": "Password123!"
}
```

**Response (`200 OK`):**
```json
{
  "accessToken": "eyJhbGciOi...",
  "expiresIn": 3600,
  "user": {
    "id": "ad1e0902-1928-4345-b513-60c86c94fc91",
    "email": "reviewer@simpleinvoice.dev",
    "fullname": "Reviewer Account"
  }
}
```

### `GET /auth/me`
Returns the profile of the currently authenticated user.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (`200 OK`):**
```json
{
  "id": "ad1e0902-1928-4345-b513-60c86c94fc91",
  "email": "reviewer@simpleinvoice.dev",
  "fullname": "Reviewer Account",
  "createdAt": "2026-10-02T00:00:00.000Z"
}
```

---

## 2. Invoices

### `GET /invoices`
Returns a paginated list of invoices.

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number |
| `pageSize` | `number` | `10` | Records per page (max `100`) |
| `sortBy` | `string` | `invoiceDate` | Field to sort by: `invoiceDate`, `dueDate`, `totalAmount` |
| `ordering` | `string` | `DESC` | Sort direction: `ASC` or `DESC` |
| `status` | `string` | — | Filter by status: `Draft`, `Pending`, `Paid`, `Overdue` |
| `keyword` | `string` | — | Search invoice number or customer name (partial, case-insensitive) |
| `fromDate` | `string` | — | Filter invoice date on or after (format: `YYYY-MM-DD`) |
| `toDate` | `string` | — | Filter invoice date on or before (format: `YYYY-MM-DD`) |

**Response (`200 OK`):**
```json
{
  "data": [
    {
      "invoiceId": "099ca7da-a290-40fa-93b9-1c43ae7bb887",
      "invoiceNumber": "IV1780488206995",
      "invoiceReference": "#5721662",
      "invoiceDate": "2026-06-03T00:00:00.000Z",
      "dueDate": "2026-07-03T00:00:00.000Z",
      "currency": "AUD",
      "currencySymbol": "AU$",
      "description": "Invoice is issued to Kanglee",
      "status": "Overdue",
      "invoiceSubTotal": 2000.0,
      "totalTax": 200.0,
      "totalDiscount": 20.0,
      "totalAmount": 2180.0,
      "totalPaid": 1451.34,
      "balanceAmount": 728.66,
      "createdAt": "2026-06-03T12:03:26.995Z",
      "customer": {
        "id": "c1a2b3c4-...",
        "fullname": "Paul",
        "email": "paul@101digital.io",
        "mobileNumber": "947717364111",
        "address": "Singapore"
      },
      "items": [
        {
          "id": "b1c2d3e4-...",
          "name": "Honda RC150",
          "quantity": 2,
          "rate": 1000.0
        }
      ]
    }
  ],
  "paging": {
    "page": 1,
    "pageSize": 10,
    "total": 35
  }
}
```

---

### `GET /invoices/:id`
Retrieves a single invoice by its UUID or invoice number.

**Response (`200 OK`):**
Returns the invoice object matching the schema above.

**Response (`404 Not Found`):**
```json
{
  "statusCode": 404,
  "message": "Invoice not found",
  "error": "Not Found"
}
```

---

### `POST /invoices`
Creates a new invoice. The invoice is created with status `Draft`. Financial totals are calculated server-side.

**Request Body:**
```json
{
  "invoiceNumber": "INV-2026-001",
  "invoiceReference": "REF-001",
  "invoiceDate": "2026-10-02",
  "dueDate": "2026-10-16",
  "currency": "AUD",
  "currencySymbol": "AU$",
  "description": "Consulting services",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerMobile": "+61 400 123 456",
  "customerAddress": "Sydney, Australia",
  "itemName": "Technical Architecture Consultation",
  "itemQuantity": 4,
  "itemRate": 150.0,
  "taxPercent": 10.0,
  "discount": 0.0
}
```

**Validation Rules:**
- `invoiceNumber`: Required, must be unique.
- `customerName`: Required, non-empty string.
- `customerEmail`: Required, valid email address.
- `invoiceDate`: Required, valid date (`YYYY-MM-DD`).
- `dueDate`: Required, must be on or after `invoiceDate`.
- `currency`: Required string (e.g., `AUD`, `USD`).
- `itemName`: Required, non-empty string.
- `itemQuantity`: Required integer `>= 1`.
- `itemRate`: Required number `> 0`.
- `taxPercent`: Number `>= 0` (defaults to `10`).
- `discount`: Number `>= 0` (defaults to `0`).

**Response (`201 Created`):**
Returns the newly created invoice object.

---

## 3. Error Responses

All API errors return a standard envelope format:

```json
{
  "statusCode": 400,
  "message": ["dueDate must be on or after invoiceDate"],
  "error": "Bad Request"
}
```

### Common HTTP Status Codes
- `200 OK` — Request succeeded.
- `201 Created` — Resource created successfully.
- `400 Bad Request` — Validation failed or invalid query parameters.
- `401 Unauthorized` — Missing, expired, or invalid JWT token.
- `404 Not Found` — Resource was not found.
- `409 Conflict` — Unique constraint violated (e.g., duplicate invoice number).
- `500 Internal Server Error` — Server unexpected error.
