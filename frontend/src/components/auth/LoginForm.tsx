import React, { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ReviewerQuickFill } from './ReviewerQuickFill';
import { useLoginMutation } from '../../services/auth/auth.queries';
import { loginSchema } from '../../types/auth.types';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const loginMutation = useLoginMutation();

  const validate = (): boolean => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as 'email' | 'password';
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
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

    if (!validate()) return;

    try {
      await loginMutation.mutateAsync({ email, password });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify your credentials.';
      setApiError(
        Array.isArray(message) ? message.join(', ') : String(message),
      );
    }
  };

  const handleQuickFill = (creds: { email: string; pass: string }) => {
    setEmail(creds.email);
    setPassword(creds.pass);
    setErrors({});
    setApiError(null);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {apiError && (
        <div
          role="alert"
          className="rounded-lg bg-rose-50 border border-rose-200 p-3 flex items-start space-x-2 text-rose-800 text-xs"
        >
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      <div>
        <Input
          label="Email Address"
          type="email"
          id="email"
          name="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          required
          autoComplete="email"
        />
      </div>

      <div>
        <Input
          label="Password"
          type="password"
          id="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password)
              setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          leftIcon={<Lock className="h-4 w-4" />}
          required
          autoComplete="current-password"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full justify-center"
          isLoading={loginMutation.isPending}
        >
          Sign In
        </Button>
      </div>

      <ReviewerQuickFill onFill={handleQuickFill} />
    </form>
  );
};
