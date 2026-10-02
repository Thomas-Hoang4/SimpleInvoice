import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '../../context/AuthContext';

const renderLoginForm = (onSuccess?: () => void) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoginForm onSuccess={onSuccess} />
      </AuthProvider>
    </QueryClientProvider>,
  );
};

describe('LoginForm Component', () => {
  it('renders email and password inputs with sign in button', () => {
    renderLoginForm();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates empty inputs and displays inline error messages', async () => {
    renderLoginForm();
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('populates fields when Quick Fill button is clicked', async () => {
    renderLoginForm();
    const quickFillBtn = screen.getByRole('button', { name: /quick fill/i });

    fireEvent.click(quickFillBtn);

    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    expect(emailInput.value).toBe('reviewer@simpleinvoice.dev');
    expect(passwordInput.value).toBe('Password123!');
  });
});
