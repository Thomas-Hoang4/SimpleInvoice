import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge Component', () => {
  it('renders status text correctly', () => {
    render(<Badge status="Draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders with semantic variant styling for Overdue', () => {
    const { container } = render(<Badge status="Overdue" />);
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-rose-50');
  });

  it('renders with semantic variant styling for Paid', () => {
    const { container } = render(<Badge status="Paid" />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-emerald-50');
  });
});
