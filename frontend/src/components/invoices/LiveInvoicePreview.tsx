import React from 'react';
import {
  Calendar,
  FileText,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { computeLiveInvoiceTotals } from '../../utils/calculations';
import { formatCurrency, formatDate } from '../../utils/formatters';

export interface LiveInvoicePreviewData {
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  customerAddress?: string;
  invoiceNumber?: string;
  invoiceReference?: string;
  invoiceDate?: string;
  dueDate?: string;
  currency?: string;
  currencySymbol?: string;
  description?: string;
  itemName?: string;
  itemQuantity?: number | string;
  itemRate?: number | string;
  tax?: number | string;
  discount?: number | string;
}

export interface LiveInvoicePreviewProps {
  data: LiveInvoicePreviewData;
  className?: string;
}

export const LiveInvoicePreview: React.FC<LiveInvoicePreviewProps> = ({
  data,
  className = '',
}) => {
  const currencySymbol = data.currencySymbol?.trim() || 'AU$';
  const currencyCode = data.currency?.trim() || 'AUD';

  const quantity = Number(data.itemQuantity) || 0;
  const rate = Number(data.itemRate) || 0;
  const taxPercent = data.tax !== undefined && data.tax !== '' ? Number(data.tax) : 10;
  const discountAmount = Number(data.discount) || 0;

  const totals = computeLiveInvoiceTotals(
    quantity,
    rate,
    taxPercent,
    discountAmount,
    0, // totalPaid = 0 for new invoices
  );

  return (
    <div
      data-testid="live-invoice-preview"
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Banner with live calculation indicator */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-200">
            Invoice Preview
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Live Calculation</span>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1">
        {/* Invoice Header details */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-slate-900 tracking-tight font-mono">
                {data.invoiceNumber?.trim() || 'INV-######'}
              </span>
              <Badge variant="draft">Draft</Badge>
            </div>
            {data.invoiceReference?.trim() && (
              <p className="text-xs text-slate-500 mt-1">
                Ref:{' '}
                <span className="font-mono font-medium text-slate-700">
                  {data.invoiceReference.trim()}
                </span>
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-0.5">
              Currency: {currencyCode} ({currencySymbol})
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs">
            <div className="flex sm:justify-end items-center space-x-1.5 text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-400">Issue Date:</span>
              <span className="font-medium text-slate-800">
                {formatDate(data.invoiceDate)}
              </span>
            </div>
            <div className="flex sm:justify-end items-center space-x-1.5 text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-400">Due Date:</span>
              <span className="font-medium text-slate-800">
                {formatDate(data.dueDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Billed To Customer Card */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Billed To
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-900">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>{data.customerName?.trim() || 'Customer Name'}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{data.customerEmail?.trim() || 'customer@example.com'}</span>
            </div>
            {data.customerMobile?.trim() && (
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{data.customerMobile.trim()}</span>
              </div>
            )}
            {data.customerAddress?.trim() && (
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{data.customerAddress.trim()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="pb-2 font-semibold">Description</th>
                <th className="pb-2 text-center font-semibold">Qty</th>
                <th className="pb-2 text-right font-semibold">Rate</th>
                <th className="pb-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 text-slate-800 font-medium max-w-[180px] truncate">
                  {data.itemName?.trim() || 'Item or Service Description'}
                </td>
                <td className="py-3 text-center text-slate-600 font-mono">
                  {quantity}
                </td>
                <td className="py-3 text-right text-slate-600 font-mono">
                  {formatCurrency(rate, currencySymbol)}
                </td>
                <td className="py-3 text-right text-slate-900 font-mono font-semibold">
                  {formatCurrency(totals.subTotal, currencySymbol)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Summary Breakdown */}
        <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-mono text-slate-800">
              {formatCurrency(totals.subTotal, currencySymbol)}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Tax ({taxPercent}%)</span>
            <span className="font-mono text-slate-800">
              {formatCurrency(totals.taxAmount, currencySymbol)}
            </span>
          </div>

          {totals.discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span className="font-mono">
                - {formatCurrency(totals.discount, currencySymbol)}
              </span>
            </div>
          )}

          <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Total Amount</span>
            <span className="text-lg font-extrabold text-brand-600 font-mono">
              {formatCurrency(totals.totalAmount, currencySymbol)}
            </span>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 pt-1">
            <span>Balance Due</span>
            <span className="font-mono font-semibold text-slate-700">
              {formatCurrency(totals.balanceAmount, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Memo / Description */}
        {data.description?.trim() && (
          <div className="bg-amber-50/60 border border-amber-100 rounded-lg p-3 text-xs text-amber-900">
            <p className="font-semibold text-[11px] text-amber-800 uppercase tracking-wider mb-0.5">
              Note
            </p>
            <p className="text-slate-700 whitespace-pre-wrap">{data.description.trim()}</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1 text-slate-400">
          <Sparkles className="h-3 w-3 text-brand-500" />
          Preview updates with every keystroke
        </span>
        <span className="text-slate-400 font-mono">Status: Draft</span>
      </div>
    </div>
  );
};
