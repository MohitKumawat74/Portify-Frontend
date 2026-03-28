'use client';

import { useEffect } from 'react';
import { AppErrorFallback } from '@/components/ui/AppErrorFallback';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Keep runtime errors visible in logs for production diagnostics.
    console.error(error);
  }, [error]);

  return <AppErrorFallback onRetry={reset} />;
}
