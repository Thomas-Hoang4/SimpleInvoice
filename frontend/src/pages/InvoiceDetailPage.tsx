import React from 'react';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Mail,
  MapPin,
  Phone,
  Printer,
  User,
  AlertCircle,
  Clock,
  Tag,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { LineItemsTable } from '../components/invoices/LineItemsTable';
import { InvoiceSummaryCard } from '../components/invoices/InvoiceSummaryCard';
import { useInvoiceDetailQuery } from '../services/invoices/invoices.queries';
import { formatDate } from '../utils/formatters';

export interface InvoiceDetailPageProps {
  invoiceId: string;
  onNavigate?: (path: string) => void;
}

export const InvoiceDetailPage: React.FC<InvoiceDetailPageProps> = ({
  invoiceId,
  onNavigate,
}) => {
  const { data: invoice, isLoading, isError, error } =
    useInvoiceDetailQuery(invoiceId);

  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs max-w-4xl mx-auto my-8">
        <Spinner size="lg" className="mx-auto text-brand-600 mb-3" />
        <p className="text-sm font-medium text-slate-800">Loading invoice details...</p>
        <p className="text-xs text-slate-400 mt-1">Retrieving invoice #{invoiceId}</p>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-10 text-center shadow-xs max-w-xl mx-auto my-8 space-y-4">
        <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Invoice Not Found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {error?.message ||
              `Unable to locate an invoice with identifier '${invoiceId}'. It may have been removed or does not exist.`}
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleNav('/invoices')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <button
          type="button"
          onClick={() => handleNav('/invoices')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Invoices</span>
        </button>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="h-3.5 w-3.5" />}
          >
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Main Printable Invoice Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Header Section: Title, Status, Number */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-3 mb-1.5">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                {invoice.invoiceNumber}
              </span>
              <Badge status={invoice.status} />
            </div>
            {invoice.invoiceReference && (
              <p className="text-xs text-slate-500 font-mono">
                External Ref: <span className="font-semibold text-slate-700">{invoice.invoiceReference}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Issued in {invoice.currency} ({invoice.currencySymbol})
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1.5 text-xs">
            <div className="flex sm:justify-end items-center space-x-2 text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-400">Issue Date:</span>
              <span className="font-semibold text-slate-800">
                {formatDate(invoice.invoiceDate)}
              </span>
            </div>
            <div className="flex sm:justify-end items-center space-x-2 text-slate-600">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-400">Due Date:</span>
              <span className="font-semibold text-slate-800">
                {formatDate(invoice.dueDate)}
              </span>
            </div>
            {invoice.createdAt && (
              <p className="text-[10px] text-slate-400">
                Created: {formatDate(invoice.createdAt)}
              </p>
            )}
          </div>
        </div>

        {/* Customer & Billing Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-slate-50/70 rounded-2xl border border-slate-100">
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Billed To
            </h4>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 text-sm">
                {invoice.customer?.fullname || 'Customer'}
              </p>
              <p className="text-slate-600 flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-slate-400" />
                {invoice.customer?.email}
              </p>
              {invoice.customer?.mobileNumber && (
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-slate-400" />
                  {invoice.customer.mobileNumber}
                </p>
              )}
              {invoice.customer?.address && (
                <p className="text-slate-600 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {invoice.customer.address}
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Payment Status
            </h4>
            <div className="space-y-1 text-xs text-slate-600">
              <p>
                Status: <span className="font-semibold text-slate-800">{invoice.status}</span>
              </p>
              <p>
                Total Paid: <span className="font-mono font-semibold text-emerald-600">{invoice.currencySymbol} {Number(invoice.totalPaid).toFixed(2)}</span>
              </p>
              <p>
                Outstanding Balance: <span className="font-mono font-semibold text-rose-600">{invoice.currencySymbol} {Number(invoice.balanceAmount).toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-brand-600" />
            Itemized Line Items
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <LineItemsTable
              items={invoice.items || []}
              currencySymbol={invoice.currencySymbol}
            />
          </div>
        </div>

        {/* Financial Summary Breakdown & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start pt-2">
          {/* Notes on left side */}
          <div className="sm:col-span-7 space-y-4">
            {invoice.description && (
              <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4 text-xs text-amber-950">
                <h5 className="font-semibold text-[11px] uppercase tracking-wider text-amber-800 mb-1">
                  Invoice Notes &amp; Terms
                </h5>
                <p className="whitespace-pre-wrap text-slate-700">
                  {invoice.description}
                </p>
              </div>
            )}
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p>Thank you for your business!</p>
              <p>All payments are subject to standard invoicing terms and conditions.</p>
            </div>
          </div>

          {/* Financial summary card on right side */}
          <div className="sm:col-span-5">
            <InvoiceSummaryCard
              invoiceSubTotal={invoice.invoiceSubTotal}
              totalTax={invoice.totalTax}
              totalDiscount={invoice.totalDiscount}
              totalAmount={invoice.totalAmount}
              totalPaid={invoice.totalPaid}
              balanceAmount={invoice.balanceAmount}
              currencySymbol={invoice.currencySymbol}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
