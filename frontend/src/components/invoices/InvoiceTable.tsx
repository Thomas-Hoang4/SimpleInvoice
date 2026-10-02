import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  FileText,
  Plus,
} from 'lucide-react';
import { Invoice } from '../../types/invoice.types';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';

export interface InvoiceTableProps {
  invoices: Invoice[];
  sortBy?: 'invoiceDate' | 'dueDate' | 'totalAmount';
  ordering?: 'ASC' | 'DESC';
  onSortChange: (column: 'invoiceDate' | 'dueDate' | 'totalAmount') => void;
  onSelectInvoice: (invoiceId: string) => void;
  onCreateNew?: () => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  sortBy,
  ordering,
  onSortChange,
  onSelectInvoice,
  onCreateNew,
}) => {
  const renderSortIcon = (column: 'invoiceDate' | 'dueDate' | 'totalAmount') => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-60 ml-1 inline" />;
    }
    if (ordering === 'ASC') {
      return <ArrowUp className="h-3 w-3 text-brand-600 ml-1 inline" />;
    }
    return <ArrowDown className="h-3 w-3 text-brand-600 ml-1 inline" />;
  };

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">
          No Invoices Found
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No invoices matched your current search filters, or no records exist in the system yet.
        </p>
        {onCreateNew && (
          <div className="mt-5">
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateNew}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Create New Invoice
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] select-none">
              <th className="py-3.5 px-4 sm:px-6 font-semibold">Invoice #</th>
              <th className="py-3.5 px-4 sm:px-6 font-semibold">Customer</th>
              <th
                onClick={() => onSortChange('invoiceDate')}
                className="py-3.5 px-4 sm:px-6 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
              >
                <span>Issue Date</span>
                {renderSortIcon('invoiceDate')}
              </th>
              <th
                onClick={() => onSortChange('dueDate')}
                className="py-3.5 px-4 sm:px-6 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
              >
                <span>Due Date</span>
                {renderSortIcon('dueDate')}
              </th>
              <th
                onClick={() => onSortChange('totalAmount')}
                className="py-3.5 px-4 sm:px-6 font-semibold text-right cursor-pointer hover:text-slate-900 transition-colors"
              >
                <span>Total Amount</span>
                {renderSortIcon('totalAmount')}
              </th>
              <th className="py-3.5 px-4 sm:px-6 font-semibold text-center">Status</th>
              <th className="py-3.5 px-4 sm:px-6 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr
                key={inv.invoiceId}
                onClick={() => onSelectInvoice(inv.invoiceId)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                {/* Invoice Number */}
                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                  <div className="font-mono font-bold text-brand-600 group-hover:text-brand-700">
                    {inv.invoiceNumber}
                  </div>
                  {inv.invoiceReference && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Ref: {inv.invoiceReference}
                    </div>
                  )}
                </td>

                {/* Customer */}
                <td className="py-3.5 px-4 sm:px-6">
                  <div className="font-semibold text-slate-900 max-w-[180px] truncate">
                    {inv.customer?.fullname || 'Unknown'}
                  </div>
                  <div className="text-[11px] text-slate-500 max-w-[180px] truncate">
                    {inv.customer?.email}
                  </div>
                </td>

                {/* Issue Date */}
                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-600">
                  {formatDate(inv.invoiceDate)}
                </td>

                {/* Due Date */}
                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-600">
                  {formatDate(inv.dueDate)}
                </td>

                {/* Total Amount */}
                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                  {formatCurrency(inv.totalAmount, inv.currencySymbol)}
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-center">
                  <Badge status={inv.status} />
                </td>

                {/* Action Link */}
                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectInvoice(inv.invoiceId);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                  >
                    <span>View</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
