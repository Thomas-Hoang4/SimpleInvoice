import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InvoiceFilters } from './InvoiceFilters';

describe('InvoiceFilters Component', () => {
  it('renders search input, status chips, and date range inputs', () => {
    render(
      <InvoiceFilters
        keyword=""
        onKeywordChange={vi.fn()}
        status="All"
        onStatusChange={vi.fn()}
        onDateRangeChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(
      screen.getByPlaceholderText(/search by invoice # or customer name/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^draft$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^pending$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^paid$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^overdue$/i })).toBeInTheDocument();
  });

  it('calls onStatusChange when a status chip is clicked', () => {
    const onStatusChange = vi.fn();
    render(
      <InvoiceFilters
        keyword=""
        onKeywordChange={vi.fn()}
        status="All"
        onStatusChange={onStatusChange}
        onDateRangeChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^pending$/i }));
    expect(onStatusChange).toHaveBeenCalledWith('Pending');
  });

  it('debounces keyword changes when typing in search input', async () => {
    const onKeywordChange = vi.fn();
    render(
      <InvoiceFilters
        keyword=""
        onKeywordChange={onKeywordChange}
        status="All"
        onStatusChange={vi.fn()}
        onDateRangeChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText(/search by invoice/i);
    fireEvent.change(input, { target: { value: 'Paul' } });

    await waitFor(
      () => {
        expect(onKeywordChange).toHaveBeenCalledWith('Paul');
      },
      { timeout: 1000 },
    );
  });

  it('renders reset button when active filters exist and triggers onReset', () => {
    const onReset = vi.fn();
    render(
      <InvoiceFilters
        keyword="IV100"
        onKeywordChange={vi.fn()}
        status="Paid"
        onStatusChange={vi.fn()}
        onDateRangeChange={vi.fn()}
        onReset={onReset}
      />,
    );

    const resetBtn = screen.getByRole('button', { name: /reset/i });
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
