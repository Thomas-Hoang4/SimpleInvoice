export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  INVOICES: {
    BASE: '/invoices',
    DETAIL: (id: string) => `/invoices/${id}`,
  },
  HEALTH: '/health',
} as const;
