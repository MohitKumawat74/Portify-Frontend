'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AppErrorFallbackProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function AppErrorFallback({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
}: AppErrorFallbackProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">{title}</h2>
        <p className="mb-5 text-sm text-[var(--color-text-muted)]">{description}</p>
        {onRetry && (
          <Button onClick={onRetry} size="sm">
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
