export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    list: (params?: any) => ['invoices', 'list', params] as const,
    detail: (id: string) => ['invoices', 'detail', id] as const,
  },
} as const;
