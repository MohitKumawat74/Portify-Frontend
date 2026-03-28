'use client';

import { AuthGuard } from '@/components/dashboard/AuthGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  return <AuthGuard requireAdmin={requireAdmin}>{children}</AuthGuard>;
}
