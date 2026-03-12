import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Cookie Policy | Portify' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
