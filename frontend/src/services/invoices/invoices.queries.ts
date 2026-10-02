import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from './invoices.api';
import { queryKeys } from '../../constants/query-keys';
import {
  CreateInvoiceInput,
  Invoice,
  InvoiceQueryParams,
  PaginatedInvoicesResponse,
} from '../../types/invoice.types';

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient();

  return useMutation<Invoice, Error, CreateInvoiceInput>({
    mutationFn: (input: CreateInvoiceInput) => invoicesApi.createInvoice(input),
    onSuccess: () => {
      // Invalidate invoice lists so newly created invoice appears immediately
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.all,
      });
    },
  });
}

export function useInvoicesQuery(params?: InvoiceQueryParams) {
  return useQuery<PaginatedInvoicesResponse, Error>({
    queryKey: queryKeys.invoices.list(params),
    queryFn: () => invoicesApi.getInvoices(params),
  });
}

export function useInvoiceDetailQuery(id: string) {
  return useQuery<Invoice, Error>({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => invoicesApi.getInvoiceById(id),
    enabled: Boolean(id),
  });
}
