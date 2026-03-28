'use client';

import { usePathname } from 'next/navigation';
import { LenisProvider } from '@/components/motion/LenisProvider';
import { PageTransition } from '@/components/motion/PageTransition';
import { PageLoader } from '@/components/ui/PageLoader';
import { Navbar } from '@/components/layout/Navbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  // Dashboard/admin layouts manage their own navbar/scroll containers.
  if (isDashboardRoute) {
    return <>{children}</>;
  }

  return (
    <LenisProvider>
      <PageLoader />
      <Navbar />
      <PageTransition>{children}</PageTransition>
    </LenisProvider>
  );
}