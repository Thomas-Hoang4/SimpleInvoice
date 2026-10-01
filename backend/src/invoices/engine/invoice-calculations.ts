export interface InvoiceCalculationInput {
  quantity: number;
  rate: number;
  taxPercent?: number;
  discount?: number;
  totalPaid?: number;
}

export interface InvoiceCalculationResult {
  subTotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  totalPaid: number;
  balanceAmount: number;
}

/**
 * Rounds a number to exactly 2 decimal places with epsilon adjustment
 * to prevent floating point precision drift.
 */
export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Computes subtotal, tax amount, total amount, and balance due for an invoice.
 * Business rules:
 *   subTotal = quantity * rate
 *   taxAmount = round(subTotal * (taxPercent / 100), 2)
 *   totalAmount = round(subTotal + taxAmount - discount, 2)
 *   balanceAmount = round(totalAmount - totalPaid, 2)
 */
export function calculateInvoiceAmounts(
  input: InvoiceCalculationInput,
): InvoiceCalculationResult {
  const quantity = Number(input.quantity);
  const rate = Number(input.rate);
  const taxPercent = input.taxPercent !== undefined ? Number(input.taxPercent) : 10;
  const discount = input.discount !== undefined ? Number(input.discount) : 0;
  const totalPaid = input.totalPaid !== undefined ? Number(input.totalPaid) : 0;

  const subTotal = roundToTwoDecimals(quantity * rate);
  const taxAmount = roundToTwoDecimals(subTotal * (taxPercent / 100));
  const totalAmount = roundToTwoDecimals(subTotal + taxAmount - discount);
  const balanceAmount = roundToTwoDecimals(totalAmount - totalPaid);

  return {
    subTotal,
    taxAmount,
    discount: roundToTwoDecimals(discount),
    totalAmount,
    totalPaid: roundToTwoDecimals(totalPaid),
    balanceAmount,
  };
}

/**
 * Derives read-time invoice status.
 * Overdue is NOT stored in the database.
 * If status != 'Paid' AND dueDate < today (by date part), status is 'Overdue'.
 */
export function deriveInvoiceStatus(
  persistedStatus: string,
  dueDate: Date | string,
  referenceDate: Date = new Date(),
): 'Draft' | 'Pending' | 'Paid' | 'Overdue' {
  if (persistedStatus === 'Paid') {
    return 'Paid';
  }

  const due = new Date(dueDate);
  const dueYear = due.getUTCFullYear();
  const dueMonth = due.getUTCMonth();
  const dueDateNum = due.getUTCDate();

  const refYear = referenceDate.getUTCFullYear();
  const refMonth = referenceDate.getUTCMonth();
  const refDateNum = referenceDate.getUTCDate();

  const isBeforeToday =
    dueYear < refYear ||
    (dueYear === refYear && dueMonth < refMonth) ||
    (dueYear === refYear && dueMonth === refMonth && dueDateNum < refDateNum);

  if (isBeforeToday) {
    return 'Overdue';
  }

  return persistedStatus as 'Draft' | 'Pending';
}
