'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  /** When true, also checks that the logged-in user has the 'admin' role. */
  requireAdmin?: boolean;
}

/**
 * Client-side auth guard — second layer after Next.js middleware.
 * Shows a spinner until Zustand has rehydrated and auth is verified.
 */
export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (requireAdmin && user?.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    setReady(true);
  }, [isAuthenticated, user, requireAdmin, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
          <p className="text-sm text-[var(--color-text-muted)]">Verifying access…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
