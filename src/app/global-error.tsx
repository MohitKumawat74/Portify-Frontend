'use client';

import { useEffect } from 'react';
import { AppErrorFallback } from '@/components/ui/AppErrorFallback';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[var(--color-bg)] text-[var(--color-text)]">
        <AppErrorFallback
          title="We hit an unexpected error"
          description="Please retry. If this continues, refresh the page."
          onRetry={reset}
        />
      </body>
    </html>
  );
}
