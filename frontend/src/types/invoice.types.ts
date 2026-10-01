import { z } from 'zod';

export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue';

export interface Customer {
  id?: string;
  fullname: string;
  email: string;
  mobileNumber?: string | null;
  address?: string | null;
}

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  name: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  invoiceReference?: string | null;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  currencySymbol: string;
  description?: string | null;
  status: InvoiceStatus;
  invoiceSubTotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
  totalPaid: number;
  balanceAmount: number;
  createdAt: string;
  createdBy?: string;
  customer: Customer;
  items: InvoiceItem[];
}

export interface PagingMetadata {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedInvoicesResponse {
  data: Invoice[];
  paging: PagingMetadata;
}

export interface InvoiceQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'invoiceDate' | 'dueDate' | 'totalAmount';
  ordering?: 'ASC' | 'DESC';
  status?: InvoiceStatus;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
}

export const createInvoiceSchema = z
  .object({
    customerName: z.string().trim().min(1, 'Customer name is required'),
    customerEmail: z
      .string()
      .trim()
      .min(1, 'Customer email is required')
      .email('Please enter a valid customer email address'),
    customerMobile: z.string().optional(),
    customerAddress: z.string().optional(),
    invoiceNumber: z.string().trim().min(1, 'Invoice number is required'),
    invoiceReference: z.string().optional(),
    invoiceDate: z.string().min(1, 'Invoice date is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    currency: z.string().default('AUD'),
    currencySymbol: z.string().default('AU$'),
    description: z.string().optional(),
    itemName: z.string().trim().min(1, 'Item name is required'),
    itemQuantity: z.coerce
      .number({ invalid_type_error: 'Quantity must be a number' })
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1'),
    itemRate: z.coerce
      .number({ invalid_type_error: 'Rate must be a number' })
      .positive('Rate must be greater than 0'),
    tax: z.coerce
      .number({ invalid_type_error: 'Tax must be a number' })
      .min(0, 'Tax must be non-negative')
      .default(10),
    discount: z.coerce
      .number({ invalid_type_error: 'Discount must be a number' })
      .min(0, 'Discount must be non-negative')
      .default(0),
  })
  .refine(
    (data) => {
      if (!data.invoiceDate || !data.dueDate) return true;
      const invDate = new Date(data.invoiceDate);
      const dueDate = new Date(data.dueDate);
      return dueDate.getTime() >= invDate.getTime();
    },
    {
      message: 'dueDate must be on or after invoiceDate',
      path: ['dueDate'],
    },
  );

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
