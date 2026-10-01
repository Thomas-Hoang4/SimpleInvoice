import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Spinner size="lg" className="text-brand-600 mb-3" />
          <p className="text-sm font-medium text-slate-500">
            Checking authentication session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    // Default fallback redirects or updates hash to /login
    if (typeof window !== 'undefined') {
      window.location.hash = '/login';
    }
    return null;
  }

  return <>{children}</>;
};
