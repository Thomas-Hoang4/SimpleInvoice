import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Plus, FileText, ArrowRight } from 'lucide-react';
import { queryClient } from './services/query-client';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { CreateInvoicePage } from './pages/CreateInvoicePage';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.hash.replace('#', '') || '/login';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.replace('#', '') || '/login';
      setCurrentPath(path);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  if (currentPath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  // Render appropriate protected page based on route hash
  const renderContent = () => {
    if (currentPath === '/invoices/new') {
      return <CreateInvoicePage onNavigate={navigate} />;
    }

    // Default /invoices view
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Invoices
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage and track your billing records
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/invoices/new')}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Invoice
          </Button>
        </div>

        <Card className="text-center py-12 px-4">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Create Your First Invoice
            </h3>
            <p className="text-xs text-slate-500">
              Get started by creating a new invoice record with real-time tax and total calculations.
            </p>
            <div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/invoices/new')}
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Go to Invoice Creator
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <ProtectedRoute fallback={<LoginPage onNavigate={navigate} />}>
      <AppLayout currentPath={currentPath} onNavigate={navigate}>
        {renderContent()}
      </AppLayout>
    </ProtectedRoute>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
