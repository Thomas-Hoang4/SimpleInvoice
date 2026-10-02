import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InvoiceForm } from './InvoiceForm';
import { invoicesApi } from '../../services/invoices/invoices.api';

vi.mock('../../services/invoices/invoices.api', () => ({
  invoicesApi: {
    createInvoice: vi.fn(),
  },
}));

const renderInvoiceForm = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <InvoiceForm {...props} />
    </QueryClientProvider>,
  );
};

describe('InvoiceForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders customer, metadata, and item input fields', () => {
    renderInvoiceForm();

    expect(screen.getByLabelText(/customer name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/customer email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/invoice number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/invoice date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/item description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^rate/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create invoice/i }),
    ).toBeInTheDocument();
  });

  it('validates required fields on submit and displays error messages', async () => {
    renderInvoiceForm();

    const submitBtn = screen.getByRole('button', { name: /create invoice/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/customer name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/customer email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/invoice number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/item name is required/i)).toBeInTheDocument();
    });
  });

  it('validates that due date cannot precede invoice date', async () => {
    renderInvoiceForm();

    // Fill valid basic details but invalid dates
    fireEvent.change(screen.getByLabelText(/customer name/i), {
      target: { value: 'Paul' },
    });
    fireEvent.change(screen.getByLabelText(/customer email/i), {
      target: { value: 'paul@101digital.io' },
    });
    fireEvent.change(screen.getByLabelText(/invoice number/i), {
      target: { value: 'INV-100' },
    });
    fireEvent.change(screen.getByLabelText(/item description/i), {
      target: { value: 'Service' },
    });
    fireEvent.change(screen.getByLabelText(/^rate/i), {
      target: { value: '100' },
    });

    // Invoice Date in future, Due Date in past
    fireEvent.change(screen.getByLabelText(/invoice date/i), {
      target: { value: '2026-07-10' },
    });
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: '2026-07-01' },
    });

    const submitBtn = screen.getByRole('button', { name: /create invoice/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/duedate must be on or after invoicedate/i),
      ).toBeInTheDocument();
    });
  });

  it('populates fields when sample data button is clicked', async () => {
    renderInvoiceForm();

    const sampleBtn = screen.getByRole('button', {
      name: /fill sample invoice/i,
    });
    fireEvent.click(sampleBtn);

    const nameInput = screen.getByLabelText(/customer name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/customer email/i) as HTMLInputElement;
    const itemInput = screen.getByLabelText(/item description/i) as HTMLInputElement;
    const qtyInput = screen.getByLabelText(/quantity/i) as HTMLInputElement;

    expect(nameInput.value).toBe('Paul');
    expect(emailInput.value).toBe('paul@101digital.io');
    expect(itemInput.value).toBe('Honda RC150');
    expect(qtyInput.value).toBe('2');
  });

  it('successfully submits valid invoice form and triggers onSuccess', async () => {
    const mockCreatedInvoice = {
      invoiceId: 'inv-123',
      invoiceNumber: 'IV1780488206995',
      invoiceDate: '2026-06-03',
      dueDate: '2026-07-03',
      status: 'Draft',
      totalAmount: 2180,
      customer: { fullname: 'Paul', email: 'paul@101digital.io' },
      items: [{ name: 'Honda RC150', quantity: 2, rate: 1000 }],
    };

    vi.mocked(invoicesApi.createInvoice).mockResolvedValueOnce(
      mockCreatedInvoice as any,
    );

    const onSuccess = vi.fn();
    renderInvoiceForm({ onSuccess });

    // Fill sample
    const sampleBtn = screen.getByRole('button', {
      name: /fill sample invoice/i,
    });
    fireEvent.click(sampleBtn);

    // Submit
    const submitBtn = screen.getByRole('button', { name: /create invoice/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(invoicesApi.createInvoice).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(mockCreatedInvoice);
    });
  });
});
