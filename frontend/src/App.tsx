import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/query-client';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { CreateInvoicePage } from './pages/CreateInvoicePage';
import { InvoiceListPage } from './pages/InvoiceListPage';
import { InvoiceDetailPage } from './pages/InvoiceDetailPage';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

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

    if (currentPath.startsWith('/invoices/') && currentPath !== '/invoices/new') {
      const invoiceId = currentPath.replace('/invoices/', '');
      return <InvoiceDetailPage invoiceId={invoiceId} onNavigate={navigate} />;
    }

    // Default: Invoices list view
    return <InvoiceListPage onNavigate={navigate} />;
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
