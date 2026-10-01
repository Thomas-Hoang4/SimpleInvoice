import React from 'react';
import { InvoiceStatus } from '../../types/invoice.types';

export interface BadgeProps {
  status?: InvoiceStatus | string;
  children?: React.ReactNode;
  variant?: 'draft' | 'pending' | 'paid' | 'overdue' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  children,
  variant,
  className = '',
}) => {
  const normalized = (variant || status || 'default').toLowerCase();

  const variantStyles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    overdue: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotStyles: Record<string, string> = {
    draft: 'bg-slate-400',
    pending: 'bg-amber-500',
    paid: 'bg-emerald-500',
    overdue: 'bg-rose-500',
    default: 'bg-slate-400',
  };

  const activeStyle = variantStyles[normalized] || variantStyles.default;
  const activeDot = dotStyles[normalized] || dotStyles.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${activeStyle} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${activeDot}`} />
      <span>{children || status}</span>
    </span>
  );
};
