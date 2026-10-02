import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Calendar, Filter, RotateCcw } from 'lucide-react';
import { debounce } from 'lodash-es';
import { InvoiceStatus } from '../../types/invoice.types';
import { Button } from '../ui/Button';

export interface InvoiceFiltersProps {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  status?: InvoiceStatus | 'All';
  onStatusChange: (status: InvoiceStatus | 'All') => void;
  fromDate?: string;
  toDate?: string;
  onDateRangeChange: (fromDate?: string, toDate?: string) => void;
  onReset: () => void;
}

const statusOptions: Array<{ label: string; value: InvoiceStatus | 'All'; badgeClass: string }> = [
  { label: 'All', value: 'All', badgeClass: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  { label: 'Draft', value: 'Draft', badgeClass: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  { label: 'Pending', value: 'Pending', badgeClass: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
  { label: 'Paid', value: 'Paid', badgeClass: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  { label: 'Overdue', value: 'Overdue', badgeClass: 'bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold' },
];

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  keyword,
  onKeywordChange,
  status = 'All',
  onStatusChange,
  fromDate,
  toDate,
  onDateRangeChange,
  onReset,
}) => {
  const [localSearch, setLocalSearch] = useState(keyword);

  // Synchronize local search if parent keyword changes externally
  useEffect(() => {
    setLocalSearch(keyword);
  }, [keyword]);

  // Debounced search caller
  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        onKeywordChange(val);
      }, 350),
    [onKeywordChange],
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setLocalSearch(nextVal);
    debouncedSearch(nextVal);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onKeywordChange('');
    debouncedSearch.cancel();
  };

  const hasActiveFilters =
    Boolean(keyword) ||
    status !== 'All' ||
    Boolean(fromDate) ||
    Boolean(toDate);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Search Input & Date Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchInput}
            placeholder="Search by invoice # or customer name..."
            className="block w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Date Ranges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">From:</span>
            <input
              type="date"
              value={fromDate || ''}
              onChange={(e) => onDateRangeChange(e.target.value || undefined, toDate)}
              className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">To:</span>
            <input
              type="date"
              value={toDate || ''}
              onChange={(e) => onDateRangeChange(fromDate, e.target.value || undefined)}
              className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer"
            />
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="h-3 w-3" /> Status:
        </span>
        {statusOptions.map((opt) => {
          const isSelected = status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusChange(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : `border-slate-200 text-slate-600 bg-white hover:bg-slate-50`
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
