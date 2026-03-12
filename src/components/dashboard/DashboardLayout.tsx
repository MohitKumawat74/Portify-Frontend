import { type ReactNode } from 'react';
import { DashboardSidebar, type NavItem } from './DashboardSidebar';
import { TopNavbar } from './TopNavbar';

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  sidebarTitle?: string;
  sidebarVariant?: 'user' | 'admin';
  navTitle: string;
  navSubtitle?: string;
  navActions?: ReactNode;
}

export function DashboardLayout({
  children,
  navItems,
  sidebarTitle,
  sidebarVariant = 'user',
  navTitle,
  navSubtitle,
  navActions,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <DashboardSidebar navItems={navItems} title={sidebarTitle} variant={sidebarVariant} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNavbar title={navTitle} subtitle={navSubtitle} actions={navActions} />
        <main className="flex-1 overflow-y-auto">
          {/* Mobile page title — shown below the mobile top bar */}
          <div className="px-4 pt-4 pb-0 lg:hidden">
            <h1 className="text-lg font-bold text-[var(--color-text)]">{navTitle}</h1>
            {navSubtitle && <p className="text-xs text-[var(--color-text-muted)]">{navSubtitle}</p>}
          </div>
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
