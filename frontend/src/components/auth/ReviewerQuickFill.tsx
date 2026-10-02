import React from 'react';
import { KeyRound, Sparkles } from 'lucide-react';

interface ReviewerQuickFillProps {
  onFill: (credentials: { email: string; pass: string }) => void;
}

export const ReviewerQuickFill: React.FC<ReviewerQuickFillProps> = ({
  onFill,
}) => {
  const handleQuickFill = () => {
    onFill({
      email: 'reviewer@simpleinvoice.dev',
      pass: 'Password123!',
    });
  };

  return (
    <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <KeyRound className="h-4 w-4 text-indigo-600 flex-shrink-0" />
          <h4 className="text-xs font-semibold text-indigo-900">
            Reviewer Demo Access
          </h4>
        </div>
        <button
          type="button"
          onClick={handleQuickFill}
          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Sparkles className="h-3 w-3" />
          <span>Quick Fill</span>
        </button>
      </div>
      <div className="mt-2 text-[11px] text-indigo-700 space-y-0.5">
        <p>
          <span className="font-semibold text-indigo-900">Email:</span>{' '}
          <code className="bg-indigo-100/70 px-1 py-0.5 rounded text-indigo-950">
            reviewer@simpleinvoice.dev
          </code>
        </p>
        <p>
          <span className="font-semibold text-indigo-900">Password:</span>{' '}
          <code className="bg-indigo-100/70 px-1 py-0.5 rounded text-indigo-950">
            Password123!
          </code>
        </p>
      </div>
    </div>
  );
};
