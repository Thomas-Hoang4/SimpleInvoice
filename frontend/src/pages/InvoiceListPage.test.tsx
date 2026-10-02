import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InvoiceListPage } from './InvoiceListPage';
import { invoicesApi } from '../services/invoices/invoices.api';

vi.mock('../services/invoices/invoices.api', () => ({
  invoicesApi: {
    getInvoices: vi.fn(),
  },
}));

const mockData = {
  data: [
    {
      invoiceId: 'inv-101',
      invoiceNumber: 'IV1780488206995',
      invoiceDate: '2026-06-03',
      dueDate: '2026-07-03',
      currency: 'AUD',
      currencySymbol: 'AU$',
      status: 'Pending',
      totalAmount: 2180,
      customer: { fullname: 'Paul', email: 'paul@101digital.io' },
      items: [{ name: 'Honda RC150', quantity: 2, rate: 1000 }],
    },
  ],
  paging: {
    page: 1,
    pageSize: 10,
    total: 1,
  },
};

const renderInvoiceListPage = (onNavigate = vi.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <InvoiceListPage onNavigate={onNavigate} />
    </QueryClientProvider>,
  );
};

describe('InvoiceListPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invoicesApi.getInvoices).mockResolvedValue(mockData as any);
  });

  it('renders page title, create button, and fetched invoices', async () => {
    renderInvoiceListPage();

    expect(screen.getByRole('heading', { name: /^invoices$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create invoice/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('IV1780488206995').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Paul').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('navigates to invoice creation page when Create Invoice button is clicked', () => {
    const onNavigate = vi.fn();
    renderInvoiceListPage(onNavigate);

    const createBtn = screen.getByRole('button', { name: /create invoice/i });
    fireEvent.click(createBtn);

    expect(onNavigate).toHaveBeenCalledWith('/invoices/new');
  });

  it('navigates to invoice detail page when invoice row is clicked', async () => {
    const onNavigate = vi.fn();
    renderInvoiceListPage(onNavigate);

    await waitFor(() => {
      expect(screen.getAllByText('IV1780488206995').length).toBeGreaterThanOrEqual(1);
    });

    fireEvent.click(screen.getAllByText('IV1780488206995')[0]);
    expect(onNavigate).toHaveBeenCalledWith('/invoices/inv-101');
  });
});
