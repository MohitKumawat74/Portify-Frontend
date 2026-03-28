import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog | Portify',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
