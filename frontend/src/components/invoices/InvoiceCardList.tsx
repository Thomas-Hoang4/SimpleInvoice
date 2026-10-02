import React from 'react';
import { Calendar, ChevronRight, FileText, User } from 'lucide-react';
import { Invoice } from '../../types/invoice.types';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export interface InvoiceCardListProps {
  invoices: Invoice[];
  onSelectInvoice: (invoiceId: string) => void;
}

export const InvoiceCardList: React.FC<InvoiceCardListProps> = ({
  invoices,
  onSelectInvoice,
}) => {
  if (invoices.length === 0) {
    return null; // InvoiceTable handles empty message or parent controls it
  }

  return (
    <div className="space-y-3 md:hidden">
      {invoices.map((inv) => (
        <div
          key={inv.invoiceId}
          onClick={() => onSelectInvoice(inv.invoiceId)}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs active:bg-slate-50 transition-colors cursor-pointer space-y-3"
        >
          {/* Header row: invoice number & status */}
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono font-bold text-sm text-brand-600 block">
                {inv.invoiceNumber}
              </span>
              {inv.invoiceReference && (
                <span className="text-[10px] text-slate-400 font-mono">
                  Ref: {inv.invoiceReference}
                </span>
              )}
            </div>
            <Badge status={inv.status} />
          </div>

          {/* Customer */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-700">
            <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-semibold truncate">
              {inv.customer?.fullname || 'Customer'}
            </span>
            <span className="text-slate-400 truncate">({inv.customer?.email})</span>
          </div>

          {/* Dates & Amount */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="space-y-0.5 text-slate-500 text-[11px]">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span>Due: {formatDate(inv.dueDate)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 block font-medium">
                Total
              </span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {formatCurrency(inv.totalAmount, inv.currencySymbol)}
              </span>
            </div>
          </div>

          {/* View Details CTA */}
          <div className="pt-2 border-t border-slate-50 flex justify-end">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
              View Details <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
