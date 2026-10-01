export interface LiveCalculationResult {
  subTotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  balanceAmount: number;
}

export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function computeLiveInvoiceTotals(
  quantity: number = 0,
  rate: number = 0,
  taxPercent: number = 10,
  discount: number = 0,
  totalPaid: number = 0,
): LiveCalculationResult {
  const qty = Number(quantity) || 0;
  const rt = Number(rate) || 0;
  const taxPct = taxPercent !== undefined ? Number(taxPercent) : 10;
  const disc = Number(discount) || 0;
  const paid = Number(totalPaid) || 0;

  const subTotal = roundToTwoDecimals(qty * rt);
  const taxAmount = roundToTwoDecimals(subTotal * (taxPct / 100));
  const totalAmount = roundToTwoDecimals(subTotal + taxAmount - disc);
  const balanceAmount = roundToTwoDecimals(totalAmount - paid);

  return {
    subTotal,
    taxAmount,
    discount: roundToTwoDecimals(disc),
    totalAmount: Math.max(0, totalAmount),
    balanceAmount: Math.max(0, balanceAmount),
  };
}
