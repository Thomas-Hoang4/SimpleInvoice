import React, { useState } from 'react';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { InvoiceFilters } from '../components/invoices/InvoiceFilters';
import { InvoiceTable } from '../components/invoices/InvoiceTable';
import { InvoiceCardList } from '../components/invoices/InvoiceCardList';
import { InvoicePagination } from '../components/invoices/InvoicePagination';
import { useInvoicesQuery } from '../services/invoices/invoices.queries';
import { InvoiceQueryParams, InvoiceStatus } from '../types/invoice.types';

export interface InvoiceListPageProps {
  onNavigate?: (path: string) => void;
}

export const InvoiceListPage: React.FC<InvoiceListPageProps> = ({
  onNavigate,
}) => {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | 'All'>('All');
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<'invoiceDate' | 'dueDate' | 'totalAmount'>('invoiceDate');
  const [ordering, setOrdering] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryParams: InvoiceQueryParams = {
    page,
    pageSize,
    sortBy,
    ordering,
    status: status === 'All' ? undefined : status,
    keyword: keyword.trim() || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  };

  const { data, isLoading, isError, error, refetch, isFetching } =
    useInvoicesQuery(queryParams);

  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
  };

  const handleSortChange = (column: 'invoiceDate' | 'dueDate' | 'totalAmount') => {
    if (sortBy === column) {
      // Toggle order
      setOrdering((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(column);
      setOrdering('DESC');
    }
    setPage(1);
  };

  const handleKeywordChange = (newKeyword: string) => {
    setKeyword(newKeyword);
    setPage(1);
  };

  const handleStatusChange = (newStatus: InvoiceStatus | 'All') => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleDateRangeChange = (newFrom?: string, newTo?: string) => {
    setFromDate(newFrom);
    setToDate(newTo);
    setPage(1);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setStatus('All');
    setFromDate(undefined);
    setToDate(undefined);
    setSortBy('invoiceDate');
    setOrdering('DESC');
    setPage(1);
  };

  const invoices = data?.data || [];
  const total = data?.paging?.total || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Invoices
            </h1>
            {!isLoading && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                {total} total
              </span>
            )}
            {isFetching && !isLoading && (
              <RefreshCw className="h-3.5 w-3.5 text-slate-400 animate-spin" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, filter, and track billing records across customers
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => handleNav('/invoices/new')}
          leftIcon={<Plus className="h-4 w-4" />}
          className="shadow-sm self-start sm:self-auto"
        >
          Create Invoice
        </Button>
      </div>

      {/* Filter Controls */}
      <InvoiceFilters
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        status={status}
        onStatusChange={handleStatusChange}
        fromDate={fromDate}
        toDate={toDate}
        onDateRangeChange={handleDateRangeChange}
        onReset={handleResetFilters}
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
          <Spinner size="lg" className="mx-auto text-brand-600 mb-3" />
          <p className="text-sm font-medium text-slate-700">Loading invoices...</p>
          <p className="text-xs text-slate-400 mt-1">Retrieving latest records</p>
        </div>
      ) : isError ? (
        /* Error State */
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Failed to Load Invoices
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {error?.message || 'An error occurred while communicating with the server.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Retry
          </Button>
        </div>
      ) : (
        /* Data Views */
        <div className="space-y-4">
          <InvoiceTable
            invoices={invoices}
            sortBy={sortBy}
            ordering={ordering}
            onSortChange={handleSortChange}
            onSelectInvoice={(id) => handleNav(`/invoices/${id}`)}
            onCreateNew={() => handleNav('/invoices/new')}
          />

          <InvoiceCardList
            invoices={invoices}
            onSelectInvoice={(id) => handleNav(`/invoices/${id}`)}
          />

          {total > 0 && (
            <InvoicePagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceListPage;
