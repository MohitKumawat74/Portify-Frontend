import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Portify',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
