import React, { useState, useCallback } from 'react';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  InvoiceForm,
  InvoiceFormValues,
} from '../components/invoices/InvoiceForm';
import {
  LiveInvoicePreview,
  LiveInvoicePreviewData,
} from '../components/invoices/LiveInvoicePreview';
import { Invoice } from '../types/invoice.types';

interface CreateInvoicePageProps {
  onNavigate?: (path: string) => void;
}

export const CreateInvoicePage: React.FC<CreateInvoicePageProps> = ({
  onNavigate,
}) => {
  const [previewData, setPreviewData] = useState<LiveInvoicePreviewData>({
    currency: 'AUD',
    currencySymbol: 'AU$',
    tax: 10,
    discount: 0,
    itemQuantity: 1,
  });

  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
  };

  const handleFormChange = useCallback((values: InvoiceFormValues) => {
    setPreviewData({
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerMobile: values.customerMobile,
      customerAddress: values.customerAddress,
      invoiceNumber: values.invoiceNumber,
      invoiceReference: values.invoiceReference,
      invoiceDate: values.invoiceDate,
      dueDate: values.dueDate,
      currency: values.currency,
      currencySymbol: values.currencySymbol,
      description: values.description,
      itemName: values.itemName,
      itemQuantity: values.itemQuantity,
      itemRate: values.itemRate,
      tax: values.tax,
      discount: values.discount,
    });
  }, []);

  const handleSuccess = (invoice: Invoice) => {
    setCreatedInvoice(invoice);
    // After brief notification delay, navigate to invoice listing
    setTimeout(() => {
      handleNav('/invoices');
    }, 1800);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => handleNav('/invoices')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Invoices</span>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create New Invoice
          </h1>
          <p className="text-xs text-slate-500">
            Issue an invoice with automatic server-side calculations and real-time live preview
          </p>
        </div>
      </div>

      {/* Success Notification Banner / Toast */}
      {createdInvoice && (
        <div
          role="status"
          className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 shadow-sm flex items-start space-x-3 text-emerald-900 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-emerald-950 text-sm">
              Invoice #{createdInvoice.invoiceNumber} Created Successfully!
            </h4>
            <p className="mt-0.5 text-xs text-emerald-700">
              Draft invoice for{' '}
              <span className="font-semibold">
                {createdInvoice.customer?.fullname || 'Customer'}
              </span>{' '}
              with total of{' '}
              <span className="font-semibold font-mono">
                {createdInvoice.currencySymbol || 'AU$'}{' '}
                {createdInvoice.totalAmount.toFixed(2)}
              </span>{' '}
              has been recorded. Redirecting to invoices list...
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNav('/invoices')}
            className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100"
          >
            View List Now
          </Button>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8">
            <InvoiceForm
              onValuesChange={handleFormChange}
              onSuccess={handleSuccess}
              onCancel={() => handleNav('/invoices')}
            />
          </Card>
        </div>

        {/* Right Column: Sticky Live Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <LiveInvoicePreview data={previewData} />
        </div>
      </div>
    </div>
  );
};

export default CreateInvoicePage;
