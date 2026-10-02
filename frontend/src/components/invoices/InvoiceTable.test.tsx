import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InvoiceTable } from './InvoiceTable';
import { Invoice } from '../../types/invoice.types';

const mockInvoices: Invoice[] = [
  {
    invoiceId: 'inv-1',
    invoiceNumber: 'IV1780488206995',
    invoiceReference: '#5721662',
    invoiceDate: '2026-06-03',
    dueDate: '2026-07-03',
    currency: 'AUD',
    currencySymbol: 'AU$',
    status: 'Pending',
    invoiceSubTotal: 2000,
    totalTax: 200,
    totalDiscount: 20,
    totalAmount: 2180,
    totalPaid: 0,
    balanceAmount: 2180,
    createdAt: '2026-06-03T12:00:00Z',
    customer: { fullname: 'Paul', email: 'paul@101digital.io' },
    items: [{ name: 'Honda RC150', quantity: 2, rate: 1000 }],
  },
  {
    invoiceId: 'inv-2',
    invoiceNumber: 'IV9999999999999',
    invoiceDate: '2026-05-01',
    dueDate: '2026-05-15',
    currency: 'AUD',
    currencySymbol: 'AU$',
    status: 'Overdue',
    invoiceSubTotal: 500,
    totalTax: 50,
    totalDiscount: 0,
    totalAmount: 550,
    totalPaid: 0,
    balanceAmount: 550,
    createdAt: '2026-05-01T10:00:00Z',
    customer: { fullname: 'Alice', email: 'alice@example.com' },
    items: [{ name: 'Service', quantity: 1, rate: 500 }],
  },
];

describe('InvoiceTable Component', () => {
  it('renders table headers and invoice rows', () => {
    render(
      <InvoiceTable
        invoices={mockInvoices}
        onSortChange={vi.fn()}
        onSelectInvoice={vi.fn()}
      />,
    );

    expect(screen.getByText('IV1780488206995')).toBeInTheDocument();
    expect(screen.getByText('Paul')).toBeInTheDocument();
    expect(screen.getByText('IV9999999999999')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('calls onSortChange when clicking sortable table header', () => {
    const onSortChange = vi.fn();
    render(
      <InvoiceTable
        invoices={mockInvoices}
        sortBy="invoiceDate"
        ordering="DESC"
        onSortChange={onSortChange}
        onSelectInvoice={vi.fn()}
      />,
    );

    const amountHeader = screen.getByText(/total amount/i);
    fireEvent.click(amountHeader);

    expect(onSortChange).toHaveBeenCalledWith('totalAmount');
  });

  it('calls onSelectInvoice when a row or view button is clicked', () => {
    const onSelectInvoice = vi.fn();
    render(
      <InvoiceTable
        invoices={mockInvoices}
        onSortChange={vi.fn()}
        onSelectInvoice={onSelectInvoice}
      />,
    );

    fireEvent.click(screen.getByText('IV1780488206995'));
    expect(onSelectInvoice).toHaveBeenCalledWith('inv-1');
  });

  it('renders empty state when no invoices are provided', () => {
    const onCreateNew = vi.fn();
    render(
      <InvoiceTable
        invoices={[]}
        onSortChange={vi.fn()}
        onSelectInvoice={vi.fn()}
        onCreateNew={onCreateNew}
      />,
    );

    expect(screen.getByText(/no invoices found/i)).toBeInTheDocument();
    const createBtn = screen.getByRole('button', { name: /create new invoice/i });
    expect(createBtn).toBeInTheDocument();
    fireEvent.click(createBtn);
    expect(onCreateNew).toHaveBeenCalledTimes(1);
  });
});
