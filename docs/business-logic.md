# Business Logic & Rules

This document details the financial calculations, status lifecycle, and validation rules in SimpleInvoice.

---

## 1. Financial Calculations

All financial totals are calculated on the backend (`backend/src/invoices/engine/invoice-calculations.ts`). The frontend provides an identical preview during form entry for user convenience.

### Calculation Formulas

```
subTotal       = quantity * rate
taxAmount      = subTotal * (taxPercent / 100)
totalAmount    = subTotal + taxAmount - discount
balanceAmount  = totalAmount - totalPaid
```

### Rounding & Precision
To prevent floating-point arithmetic errors, all amounts are rounded to 2 decimal places using epsilon adjustment:

```ts
function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
```

### Defaults
- `taxPercent`: Defaults to `10%` if omitted.
- `discount`: Defaults to `0.00` if omitted.
- `totalPaid`: Defaults to `0.00` on new invoices.

---

## 2. Invoice Status & Overdue Derivation

### Stored Statuses vs. Derived Status
The PostgreSQL database only stores three statuses:
- `Draft`
- `Pending`
- `Paid`

`Overdue` is a **read-time derived status**. It is calculated dynamically whenever an invoice is retrieved:

```ts
if (persistedStatus === 'Paid') {
  return 'Paid';
}

if (dueDate < today) {
  return 'Overdue';
}

return persistedStatus; // 'Draft' or 'Pending'
```

### Rationale
- Storing "Overdue" in a database requires cron jobs or triggers to periodically inspect dates.
- This creates race conditions and stale records when the server clock advances.
- Read-time derivation guarantees 100% accurate status on every read.

### Querying & Filtering by Overdue
When a client requests `GET /invoices?status=Overdue`, the database query applies:
```sql
WHERE "dueDate" < CURRENT_DATE AND "status" != 'Paid'
```

---

## 3. Validation Rules

### Invoice Creation (`POST /invoices`)

| Field | Rule | Validation Error Message |
| :--- | :--- | :--- |
| `invoiceNumber` | Required, non-empty, unique | "Invoice number already exists" (HTTP 409) |
| `invoiceDate` | Required, valid date format | "invoiceDate must be a valid ISO date" |
| `dueDate` | Required, must be on or after `invoiceDate` | "dueDate must be on or after invoiceDate" |
| `currency` | Required (e.g., `AUD`, `USD`) | "currency should not be empty" |
| `customerName` | Required, non-empty string | "customerName should not be empty" |
| `customerEmail`| Required, valid email format | "customerEmail must be an email" |
| `itemName` | Required, non-empty string | "itemName should not be empty" |
| `itemQuantity` | Required, integer `>= 1` | "itemQuantity must be an integer and greater than 0" |
| `itemRate` | Required, number `> 0` | "itemRate must be greater than 0" |
| `taxPercent` | Optional, number `>= 0` | "taxPercent must not be negative" |
| `discount` | Optional, number `>= 0` | "discount must not be negative" |

---

## 4. Customer Upsert Pattern

When creating an invoice:
1. The backend searches for an existing customer matching `customerEmail`.
2. **If found:** The existing customer is associated with the invoice, updating name and phone if provided.
3. **If not found:** A new customer is created in the same transaction.
4. The invoice is saved with `customerId` set to the customer record.
