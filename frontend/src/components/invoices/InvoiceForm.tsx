import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Sparkles,
  Tag,
  User,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import {
  CreateInvoiceInput,
  createInvoiceSchema,
  Invoice,
} from '../../types/invoice.types';
import { useCreateInvoiceMutation } from '../../services/invoices/invoices.queries';

export interface InvoiceFormValues {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
  invoiceNumber: string;
  invoiceReference: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  currencySymbol: string;
  description: string;
  itemName: string;
  itemQuantity: number | string;
  itemRate: number | string;
  tax: number | string;
  discount: number | string;
}

export interface InvoiceFormProps {
  initialValues?: Partial<InvoiceFormValues>;
  onValuesChange?: (values: InvoiceFormValues) => void;
  onSuccess?: (createdInvoice: Invoice) => void;
  onCancel?: () => void;
}

const getTodayString = () => new Date().toISOString().slice(0, 10);
const getFutureDateString = (daysAhead: number = 30) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
};

const defaultFormValues: InvoiceFormValues = {
  customerName: '',
  customerEmail: '',
  customerMobile: '',
  customerAddress: '',
  invoiceNumber: '',
  invoiceReference: '',
  invoiceDate: getTodayString(),
  dueDate: getFutureDateString(30),
  currency: 'AUD',
  currencySymbol: 'AU$',
  description: '',
  itemName: '',
  itemQuantity: 1,
  itemRate: '',
  tax: 10,
  discount: 0,
};

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialValues,
  onValuesChange,
  onSuccess,
  onCancel,
}) => {
  const [values, setValues] = useState<InvoiceFormValues>(() => ({
    ...defaultFormValues,
    ...initialValues,
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const createMutation = useCreateInvoiceMutation();

  // Notify parent of initial values once on mount
  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    field: keyof InvoiceFormValues,
    val: string | number,
  ) => {
    setValues((prev) => {
      const updated = { ...prev, [field]: val };

      // Auto update currency symbol when currency code changes
      if (field === 'currency') {
        const symbolMap: Record<string, string> = {
          AUD: 'AU$',
          USD: '$',
          EUR: '€',
          GBP: '£',
          SGD: 'S$',
        };
        updated.currencySymbol = symbolMap[String(val)] || '$';
      }

      if (onValuesChange) {
        onValuesChange(updated);
      }

      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const parseResult = createInvoiceSchema.safeParse(values);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const key = issue.path[0] as string;
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    try {
      const parseResult = createInvoiceSchema.parse(values);
      const created = await createMutation.mutateAsync(parseResult);
      if (onSuccess) {
        onSuccess(created);
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to create invoice. Please check your input.';
      setApiError(Array.isArray(message) ? message.join(', ') : String(message));
    }
  };

  const handleFillSample = () => {
    const timestamp = Date.now().toString().slice(-6);
    const sample: InvoiceFormValues = {
      customerName: 'Paul',
      customerEmail: 'paul@101digital.io',
      customerMobile: '947717364111',
      customerAddress: 'Singapore',
      invoiceNumber: `IV178048${timestamp}`,
      invoiceReference: '#5721662',
      invoiceDate: '2026-06-03',
      dueDate: '2026-07-03',
      currency: 'AUD',
      currencySymbol: 'AU$',
      description: 'Invoice is issued to Paul for Honda RC150 maintenance',
      itemName: 'Honda RC150',
      itemQuantity: 2,
      itemRate: 1000,
      tax: 10,
      discount: 20,
    };
    setValues(sample);
    if (onValuesChange) {
      onValuesChange(sample);
    }
    setErrors({});
    setApiError(null);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Quick Fill Toolbar */}
      <div className="flex items-center justify-between p-3.5 bg-brand-50/70 border border-brand-100 rounded-xl">
        <div className="flex items-center space-x-2 text-xs text-brand-900 font-medium">
          <Sparkles className="h-4 w-4 text-brand-600 flex-shrink-0" />
          <span>Need sample data for rapid testing?</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFillSample}
          className="bg-white hover:bg-brand-50 border-brand-200 text-brand-700 text-xs py-1"
        >
          Fill Sample Invoice (Appendix A)
        </Button>
      </div>

      {/* Global API Error Alert */}
      {apiError && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-start space-x-3 text-rose-800 text-sm"
        >
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-900">Creation Error</h4>
            <p className="mt-0.5 text-xs text-rose-700">{apiError}</p>
          </div>
        </div>
      )}

      {/* Section 1: Customer Information */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <User className="h-4 w-4 text-brand-600" />
            1. Customer Information
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Recipient details for billing and notification
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Customer Name"
            name="customerName"
            id="customerName"
            required
            placeholder="e.g. Paul"
            value={values.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            error={errors.customerName}
            leftIcon={<User className="h-4 w-4" />}
          />

          <Input
            label="Customer Email"
            name="customerEmail"
            id="customerEmail"
            type="email"
            required
            placeholder="e.g. paul@101digital.io"
            value={values.customerEmail}
            onChange={(e) => handleChange('customerEmail', e.target.value)}
            error={errors.customerEmail}
            leftIcon={<Mail className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mobile Number"
            name="customerMobile"
            id="customerMobile"
            placeholder="e.g. 947717364111"
            value={values.customerMobile}
            onChange={(e) => handleChange('customerMobile', e.target.value)}
            error={errors.customerMobile}
            leftIcon={<Phone className="h-4 w-4" />}
          />

          <Input
            label="Billing Address"
            name="customerAddress"
            id="customerAddress"
            placeholder="e.g. Singapore"
            value={values.customerAddress}
            onChange={(e) => handleChange('customerAddress', e.target.value)}
            error={errors.customerAddress}
            leftIcon={<MapPin className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Section 2: Invoice Metadata */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600" />
            2. Invoice Metadata
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Identifier, reference number, and issue timeline
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Invoice Number"
            name="invoiceNumber"
            id="invoiceNumber"
            required
            placeholder="e.g. IV1780488206995"
            value={values.invoiceNumber}
            onChange={(e) => handleChange('invoiceNumber', e.target.value)}
            error={errors.invoiceNumber}
            helperText="Must be unique across all invoices"
            leftIcon={<Tag className="h-4 w-4" />}
          />

          <Input
            label="External Reference"
            name="invoiceReference"
            id="invoiceReference"
            placeholder="e.g. #5721662"
            value={values.invoiceReference}
            onChange={(e) => handleChange('invoiceReference', e.target.value)}
            error={errors.invoiceReference}
            leftIcon={<FileText className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Invoice Date"
            name="invoiceDate"
            id="invoiceDate"
            type="date"
            required
            value={values.invoiceDate}
            onChange={(e) => handleChange('invoiceDate', e.target.value)}
            error={errors.invoiceDate}
            leftIcon={<Calendar className="h-4 w-4" />}
          />

          <Input
            label="Due Date"
            name="dueDate"
            id="dueDate"
            type="date"
            required
            value={values.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            error={errors.dueDate}
            helperText="Must be on or after invoice date"
            leftIcon={<Calendar className="h-4 w-4" />}
          />

          <Select
            label="Currency"
            name="currency"
            id="currency"
            value={values.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            options={[
              { label: 'AUD (AU$)', value: 'AUD' },
              { label: 'USD ($)', value: 'USD' },
              { label: 'EUR (€)', value: 'EUR' },
              { label: 'GBP (£)', value: 'GBP' },
              { label: 'SGD (S$)', value: 'SGD' },
            ]}
          />
        </div>
      </div>

      {/* Section 3: Line Item Details */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-brand-600" />
            3. Line Item &amp; Pricing
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliverable description, quantity, and unit price
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6">
            <Input
              label="Item Description"
              name="itemName"
              id="itemName"
              required
              placeholder="e.g. Honda RC150"
              value={values.itemName}
              onChange={(e) => handleChange('itemName', e.target.value)}
              error={errors.itemName}
            />
          </div>

          <div className="sm:col-span-3">
            <Input
              label="Quantity"
              name="itemQuantity"
              id="itemQuantity"
              type="number"
              min={1}
              step={1}
              required
              value={values.itemQuantity}
              onChange={(e) => handleChange('itemQuantity', e.target.value)}
              error={errors.itemQuantity}
            />
          </div>

          <div className="sm:col-span-3">
            <Input
              label={`Rate (${values.currencySymbol})`}
              name="itemRate"
              id="itemRate"
              type="number"
              min={0.01}
              step={0.01}
              required
              placeholder="1000.00"
              value={values.itemRate}
              onChange={(e) => handleChange('itemRate', e.target.value)}
              error={errors.itemRate}
            />
          </div>
        </div>

        {/* Taxes & Discounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Input
            label="Tax Rate (%)"
            name="tax"
            id="tax"
            type="number"
            min={0}
            step={0.1}
            placeholder="10"
            value={values.tax}
            onChange={(e) => handleChange('tax', e.target.value)}
            error={errors.tax}
            helperText="Percentage added to subtotal"
          />

          <Input
            label={`Discount Amount (${values.currencySymbol})`}
            name="discount"
            id="discount"
            type="number"
            min={0}
            step={0.01}
            placeholder="0.00"
            value={values.discount}
            onChange={(e) => handleChange('discount', e.target.value)}
            error={errors.discount}
            helperText="Deducted from subtotal + tax"
          />
        </div>

        {/* Memo / Notes */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Invoice Notes / Memo
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Add any payment instructions, notes, or terms..."
            value={values.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="block w-full rounded-lg border border-slate-300 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white placeholder-slate-400"
          />
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={createMutation.isPending}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Create Invoice
        </Button>
      </div>
    </form>
  );
};
