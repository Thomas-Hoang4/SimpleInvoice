export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  INVOICES: '/invoices',
  NEW_INVOICE: '/invoices/new',
  INVOICE_DETAIL: (id: string = ':id') => `/invoices/${id}`,
} as const;
