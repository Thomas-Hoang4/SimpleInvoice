/**
 * Format currency with currency symbol and 2 decimal places
 */
export function formatCurrency(
  amount: number | string | undefined | null,
  symbol: string = 'AU$',
): string {
  const numeric = typeof amount === 'number' ? amount : Number(amount || 0);
  const formatted = numeric.toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formatted}`;
}

/**
 * Format date string (YYYY-MM-DD) into readable human display format
 */
export function formatDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '—';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  return d.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
