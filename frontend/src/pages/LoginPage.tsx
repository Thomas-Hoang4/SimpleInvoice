import React, { useEffect } from 'react';
import { FileText } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate?: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();

  const handleRedirect = () => {
    if (onNavigate) {
      onNavigate('/invoices');
    } else {
      window.location.hash = '/invoices';
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      handleRedirect();
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md mb-3">
          <FileText className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          SimpleInvoice
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          101 Digital Technical Assessment — Authentication Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg border-slate-200">
          <LoginForm onSuccess={handleRedirect} />
        </Card>

        <p className="mt-6 text-center text-xs text-slate-400">
          Protected System &bull; 101 Digital Assessment Specification
        </p>
      </div>
    </div>
  );
};
