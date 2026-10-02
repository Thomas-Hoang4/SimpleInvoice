import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateInvoicePage } from './CreateInvoicePage';

const renderCreateInvoicePage = (onNavigate = vi.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CreateInvoicePage onNavigate={onNavigate} />
    </QueryClientProvider>,
  );
};

describe('CreateInvoicePage Component', () => {
  it('renders page header, form, and live preview', () => {
    renderCreateInvoicePage();

    expect(
      screen.getByRole('heading', { name: /create new invoice/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/back to invoices/i)).toBeInTheDocument();
    expect(screen.getByTestId('live-invoice-preview')).toBeInTheDocument();
  });

  it('navigates back to invoices list when back button is clicked', () => {
    const onNavigate = vi.fn();
    renderCreateInvoicePage(onNavigate);

    const backBtn = screen.getByText(/back to invoices/i);
    fireEvent.click(backBtn);

    expect(onNavigate).toHaveBeenCalledWith('/invoices');
  });
});
