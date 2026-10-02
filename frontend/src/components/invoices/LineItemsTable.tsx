import React from 'react';
import { InvoiceItem } from '../../types/invoice.types';
import { formatCurrency } from '../../utils/formatters';

export interface LineItemsTableProps {
  items: InvoiceItem[];
  currencySymbol?: string;
}

export const LineItemsTable: React.FC<LineItemsTableProps> = ({
  items,
  currencySymbol = 'AU$',
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px]">
            <th className="py-3 px-4 font-semibold w-12 text-center">#</th>
            <th className="py-3 px-4 font-semibold">Item Description</th>
            <th className="py-3 px-4 font-semibold text-center w-24">Quantity</th>
            <th className="py-3 px-4 font-semibold text-right w-32">Rate</th>
            <th className="py-3 px-4 font-semibold text-right w-36">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-slate-400">
                No line items associated with this invoice
              </td>
            </tr>
          ) : (
            items.map((item, index) => {
              const lineTotal = Number(item.quantity) * Number(item.rate);
              return (
                <tr key={item.id || `item-${index}`} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                    {index + 1}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {formatCurrency(item.rate, currencySymbol)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(lineTotal, currencySymbol)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
