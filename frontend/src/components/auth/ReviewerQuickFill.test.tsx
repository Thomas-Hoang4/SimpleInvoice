import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReviewerQuickFill } from './ReviewerQuickFill';

describe('ReviewerQuickFill Component', () => {
  it('renders reviewer credentials information', () => {
    render(<ReviewerQuickFill onFill={vi.fn()} />);
    expect(screen.getByText('Reviewer Demo Access')).toBeInTheDocument();
    expect(screen.getByText('reviewer@101digital.io')).toBeInTheDocument();
    expect(screen.getByText('Password123!')).toBeInTheDocument();
  });

  it('calls onFill with reviewer credentials when Quick Fill button is clicked', () => {
    const handleFill = vi.fn();
    render(<ReviewerQuickFill onFill={handleFill} />);

    const quickFillBtn = screen.getByRole('button', { name: /quick fill/i });
    fireEvent.click(quickFillBtn);

    expect(handleFill).toHaveBeenCalledWith({
      email: 'reviewer@101digital.io',
      pass: 'Password123!',
    });
  });
});
