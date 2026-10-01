import React from 'react';
import { FileText, LogOut, Plus, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

interface NavbarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => handleNav('/invoices')}
              className="flex items-center space-x-2.5 text-left focus:outline-none"
            >
              <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight block">
                  SimpleInvoice
                </span>
                <span className="text-[10px] font-medium text-slate-400 block -mt-1">
                  101 Digital
                </span>
              </div>
            </button>

            {isAuthenticated && (
              <nav className="hidden sm:flex space-x-2">
                <button
                  onClick={() => handleNav('/invoices')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/invoices' || currentPath === '/'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  All Invoices
                </button>
                <button
                  onClick={() => handleNav('/invoices/new')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/invoices/new'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Plus className="h-4 w-4 text-brand-600" />
                  <span>Create Invoice</span>
                </button>
              </nav>
            )}
          </div>

          {/* User profile & Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <>
                <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200">
                  <div className="h-6 w-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-800 leading-none">
                      {user.fullname}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-none mt-0.5">
                      {user.email}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  leftIcon={<LogOut className="h-3.5 w-3.5 text-slate-500" />}
                >
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleNav('/login')}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
