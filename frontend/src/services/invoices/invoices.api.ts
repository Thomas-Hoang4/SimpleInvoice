import { apiClient } from '../api-client';
import { ENDPOINTS } from '../../constants/endpoints';
import {
  Invoice,
  CreateInvoiceInput,
  InvoiceQueryParams,
  PaginatedInvoicesResponse,
} from '../../types/invoice.types';

export const invoicesApi = {
  /**
   * Create a new draft invoice
   */
  createInvoice: async (input: CreateInvoiceInput): Promise<Invoice> => {
    const payload = {
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim(),
      customerMobile: input.customerMobile?.trim() || undefined,
      customerAddress: input.customerAddress?.trim() || undefined,
      invoiceNumber: input.invoiceNumber.trim(),
      invoiceReference: input.invoiceReference?.trim() || undefined,
      invoiceDate: input.invoiceDate,
      dueDate: input.dueDate,
      currency: input.currency?.trim() || 'AUD',
      currencySymbol: input.currencySymbol?.trim() || 'AU$',
      description: input.description?.trim() || undefined,
      itemName: input.itemName.trim(),
      itemQuantity: Number(input.itemQuantity),
      itemRate: Number(input.itemRate),
      tax: Number(input.tax ?? 10),
      discount: Number(input.discount ?? 0),
    };

    const response = await apiClient.post<Invoice>(
      ENDPOINTS.INVOICES.BASE,
      payload,
    );
    return response.data;
  },

  /**
   * Fetch paginated invoices with optional search, filters, and sorting
   */
  getInvoices: async (
    params?: InvoiceQueryParams,
  ): Promise<PaginatedInvoicesResponse> => {
    const response = await apiClient.get<PaginatedInvoicesResponse>(
      ENDPOINTS.INVOICES.BASE,
      { params },
    );
    return response.data;
  },

  /**
   * Fetch single invoice details by ID or invoice number
   */
  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get<Invoice>(
      ENDPOINTS.INVOICES.DETAIL(id),
    );
    return response.data;
  },
};
