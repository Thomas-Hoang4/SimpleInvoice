import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders SimpleInvoice application title', () => {
    render(<App />);
    expect(screen.getByText('SimpleInvoice')).toBeInTheDocument();
  });

  it('renders assessment subtitle and authentication form', () => {
    render(<App />);
    expect(
      screen.getByText(/101 digital technical assessment/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
