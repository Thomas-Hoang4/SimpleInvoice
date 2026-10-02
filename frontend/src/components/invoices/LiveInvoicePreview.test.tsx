import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  LiveInvoicePreview,
  LiveInvoicePreviewData,
} from './LiveInvoicePreview';

describe('LiveInvoicePreview Component', () => {
  it('renders default preview with draft badge and placeholders', () => {
    const data: LiveInvoicePreviewData = {
      currency: 'AUD',
      currencySymbol: 'AU$',
      tax: 10,
      discount: 0,
      itemQuantity: 1,
    };

    render(<LiveInvoicePreview data={data} />);

    expect(screen.getByTestId('live-invoice-preview')).toBeInTheDocument();
    expect(screen.getByText(/invoice preview/i)).toBeInTheDocument();
    expect(screen.getAllByText(/draft/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/live calculation/i)).toBeInTheDocument();
    expect(screen.getByText(/billed to/i)).toBeInTheDocument();
  });

  it('correctly calculates and formats subtotal, tax, discount, and total amounts', () => {
    // 2 items * 1000 = 2000 subtotal
    // 10% tax = 200
    // 20 discount
    // Total = 2000 + 200 - 20 = 2180.00
    const data: LiveInvoicePreviewData = {
      customerName: 'Paul',
      customerEmail: 'paul@101digital.io',
      customerAddress: 'Singapore',
      customerMobile: '947717364111',
      invoiceNumber: 'IV1780488206995',
      invoiceReference: '#5721662',
      invoiceDate: '2026-06-03',
      dueDate: '2026-07-03',
      currency: 'AUD',
      currencySymbol: 'AU$',
      itemName: 'Honda RC150',
      itemQuantity: 2,
      itemRate: 1000,
      tax: 10,
      discount: 20,
    };

    render(<LiveInvoicePreview data={data} />);

    // Header info
    expect(screen.getByText('IV1780488206995')).toBeInTheDocument();
    expect(screen.getByText('#5721662')).toBeInTheDocument();
    expect(screen.getByText('Paul')).toBeInTheDocument();
    expect(screen.getByText('paul@101digital.io')).toBeInTheDocument();
    expect(screen.getByText('Singapore')).toBeInTheDocument();
    expect(screen.getByText('947717364111')).toBeInTheDocument();

    // Line item
    expect(screen.getByText('Honda RC150')).toBeInTheDocument();

    // Calculation checks
    // Subtotal: AU$ 2,000.00
    expect(screen.getAllByText(/AU\$ 2,000\.00/i).length).toBeGreaterThanOrEqual(1);
    // Tax: AU$ 200.00
    expect(screen.getByText(/AU\$ 200\.00/i)).toBeInTheDocument();
    // Discount: - AU$ 20.00
    expect(screen.getByText(/- AU\$ 20\.00/i)).toBeInTheDocument();
    // Total & Balance both equal AU$ 2,180.00
    expect(screen.getAllByText(/AU\$ 2,180\.00/i).length).toBe(2);
  });

  it('renders optional notes if provided', () => {
    const data: LiveInvoicePreviewData = {
      itemName: 'Consulting',
      itemQuantity: 1,
      itemRate: 500,
      description: 'Payment terms: 30 days net',
    };

    render(<LiveInvoicePreview data={data} />);

    expect(screen.getByText(/payment terms: 30 days net/i)).toBeInTheDocument();
  });
});
