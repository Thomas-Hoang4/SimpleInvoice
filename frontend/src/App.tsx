import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/query-client';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Card } from './components/ui/Card';

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

  return (
    <ProtectedRoute fallback={<LoginPage onNavigate={navigate} />}>
      <AppLayout currentPath={currentPath} onNavigate={navigate}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                SimpleInvoice
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                101 Digital Technical Assessment
              </p>
            </div>
          </div>
          <Card>
            <p className="text-sm text-slate-600">
              Welcome to SimpleInvoice! Select an option from the navigation bar.
            </p>
          </Card>
        </div>
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
