import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export interface InvoiceSummaryCardProps {
  invoiceSubTotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
  totalPaid: number;
  balanceAmount: number;
  currencySymbol?: string;
  className?: string;
}

export const InvoiceSummaryCard: React.FC<InvoiceSummaryCardProps> = ({
  invoiceSubTotal,
  totalTax,
  totalDiscount,
  totalAmount,
  totalPaid,
  balanceAmount,
  currencySymbol = 'AU$',
  className = '',
}) => {
  return (
    <div
      className={`bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-3 text-xs ${className}`}
    >
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200">
        Financial Breakdown
      </h4>

      <div className="flex justify-between text-slate-600">
        <span>Invoice Subtotal</span>
        <span className="font-mono font-medium text-slate-900">
          {formatCurrency(invoiceSubTotal, currencySymbol)}
        </span>
      </div>

      <div className="flex justify-between text-slate-600">
        <span>Total Tax</span>
        <span className="font-mono font-medium text-slate-900">
          {formatCurrency(totalTax, currencySymbol)}
        </span>
      </div>

      {totalDiscount > 0 && (
        <div className="flex justify-between text-emerald-600">
          <span>Discount</span>
          <span className="font-mono font-medium">
            - {formatCurrency(totalDiscount, currencySymbol)}
          </span>
        </div>
      )}

      <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
        <span className="text-sm font-bold text-slate-900">Total Amount</span>
        <span className="text-lg font-extrabold text-brand-600 font-mono">
          {formatCurrency(totalAmount, currencySymbol)}
        </span>
      </div>

      <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200/60">
        <span>Total Paid</span>
        <span className="font-mono font-medium text-emerald-600">
          {formatCurrency(totalPaid, currencySymbol)}
        </span>
      </div>

      <div className="flex justify-between items-baseline pt-1">
        <span className="text-xs font-bold text-slate-800">Balance Due</span>
        <span
          className={`text-sm font-bold font-mono ${
            balanceAmount > 0 ? 'text-rose-600' : 'text-slate-700'
          }`}
        >
          {formatCurrency(balanceAmount, currencySymbol)}
        </span>
      </div>
    </div>
  );
};
