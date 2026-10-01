import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const TestConsumer = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-email">{user?.email || 'No User'}</div>
      <button
        onClick={() =>
          login('mock-jwt-token', {
            id: 'u1',
            email: 'reviewer@101digital.io',
            fullname: 'Reviewer',
          })
        }
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes as unauthenticated when localStorage is empty', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated',
    );
    expect(screen.getByTestId('user-email')).toHaveTextContent('No User');
  });

  it('updates state and localStorage on login and logout', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    act(() => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent(
      'reviewer@101digital.io',
    );
    expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated',
    );
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
