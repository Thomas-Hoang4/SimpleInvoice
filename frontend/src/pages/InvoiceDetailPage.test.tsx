import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InvoiceDetailPage } from './InvoiceDetailPage';
import { invoicesApi } from '../services/invoices/invoices.api';

vi.mock('../services/invoices/invoices.api', () => ({
  invoicesApi: {
    getInvoiceById: vi.fn(),
  },
}));

const mockInvoice = {
  invoiceId: 'inv-42',
  invoiceNumber: 'IV1780488206995',
  invoiceReference: '#5721662',
  invoiceDate: '2026-06-03',
  dueDate: '2026-07-03',
  currency: 'AUD',
  currencySymbol: 'AU$',
  status: 'Pending',
  description: 'Annual service package for Honda bike',
  invoiceSubTotal: 2000,
  totalTax: 200,
  totalDiscount: 20,
  totalAmount: 2180,
  totalPaid: 1451.34,
  balanceAmount: 728.66,
  createdAt: '2026-06-03T12:00:00Z',
  customer: {
    fullname: 'Paul',
    email: 'paul@101digital.io',
    mobileNumber: '947717364111',
    address: 'Singapore',
  },
  items: [
    {
      id: 'item-1',
      name: 'Honda RC150',
      quantity: 2,
      rate: 1000,
    },
  ],
};

const renderInvoiceDetailPage = (invoiceId = 'inv-42', onNavigate = vi.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <InvoiceDetailPage invoiceId={invoiceId} onNavigate={onNavigate} />
    </QueryClientProvider>,
  );
};

describe('InvoiceDetailPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invoicesApi.getInvoiceById).mockResolvedValue(mockInvoice as any);
  });

  it('renders loading state initially', () => {
    vi.mocked(invoicesApi.getInvoiceById).mockReturnValue(new Promise(() => {}));
    renderInvoiceDetailPage();

    expect(screen.getByText(/loading invoice details/i)).toBeInTheDocument();
  });

  it('renders invoice not found when API rejects with error', async () => {
    vi.mocked(invoicesApi.getInvoiceById).mockRejectedValueOnce(
      new Error('Invoice not found'),
    );
    renderInvoiceDetailPage('non-existent');

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /invoice not found/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back to invoices/i })).toBeInTheDocument();
    });
  });

  it('renders full itemized invoice details and financial summary when loaded', async () => {
    renderInvoiceDetailPage();

    await waitFor(() => {
      // Header info
      expect(screen.getByText('IV1780488206995')).toBeInTheDocument();
      expect(screen.getByText('#5721662')).toBeInTheDocument();

      // Customer info
      expect(screen.getByText('Paul')).toBeInTheDocument();
      expect(screen.getByText('paul@101digital.io')).toBeInTheDocument();
      expect(screen.getByText('Singapore')).toBeInTheDocument();
      expect(screen.getByText('947717364111')).toBeInTheDocument();

      // Line items
      expect(screen.getByText('Honda RC150')).toBeInTheDocument();

      // Financial breakdown
      expect(screen.getAllByText('AU$ 2,000.00').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('AU$ 200.00')).toBeInTheDocument();
      expect(screen.getByText(/- AU\$ 20\.00/i)).toBeInTheDocument();
      expect(screen.getByText('AU$ 2,180.00')).toBeInTheDocument();
      expect(screen.getAllByText(/728\.66/).length).toBeGreaterThanOrEqual(1);

      // Notes
      expect(
        screen.getByText(/annual service package for honda bike/i),
      ).toBeInTheDocument();
    });
  });

  it('triggers window.print when print button is clicked', async () => {
    vi.mocked(invoicesApi.getInvoiceById).mockResolvedValueOnce(mockInvoice as any);
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    renderInvoiceDetailPage();

    await waitFor(() => {
      expect(screen.getByText('IV1780488206995')).toBeInTheDocument();
    });

    const printBtn = screen.getByRole('button', { name: /print \/ save as pdf/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('navigates back to invoices list when back button is clicked', async () => {
    vi.mocked(invoicesApi.getInvoiceById).mockResolvedValueOnce(mockInvoice as any);
    const onNavigate = vi.fn();

    renderInvoiceDetailPage('inv-42', onNavigate);

    await waitFor(() => {
      expect(screen.getByText('IV1780488206995')).toBeInTheDocument();
    });

    const backBtn = screen.getByRole('button', { name: /back to invoices/i });
    fireEvent.click(backBtn);

    expect(onNavigate).toHaveBeenCalledWith('/invoices');
  });
});
