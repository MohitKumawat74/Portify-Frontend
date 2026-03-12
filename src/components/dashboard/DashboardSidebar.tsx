'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  PlusSquare,
  Layout,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Palette,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  LineChart,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { APP_NAME, ROUTES } from '@/utils/constants';
import { useAuth } from '@/hooks/useAuth';

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string | number;
}

interface DashboardSidebarProps {
  /** Optional – if omitted the component picks the right nav from `variant`. */
  navItems?: NavItem[];
  title?: string;
  variant?: 'user' | 'admin';
}

export const USER_NAV: NavItem[] = [
  { label: 'Overview',        href: ROUTES.DASHBOARD,         icon: <LayoutDashboard size={18} /> },
  { label: 'My Portfolios',   href: ROUTES.PORTFOLIOS,        icon: <FolderOpen size={18} /> },
  { label: 'Create Portfolio',href: ROUTES.CREATE_PORTFOLIO,  icon: <PlusSquare size={18} /> },
  { label: 'Templates',       href: ROUTES.TEMPLATES,         icon: <Layout size={18} /> },
  { label: 'Analytics',       href: ROUTES.ANALYTICS,         icon: <LineChart size={18} /> },
  { label: 'Account',         href: ROUTES.ACCOUNT,           icon: <CreditCard size={18} /> },
  { label: 'Settings',        href: ROUTES.SETTINGS,          icon: <Settings size={18} /> },
];

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',   href: ROUTES.ADMIN,             icon: <LayoutDashboard size={18} /> },
  { label: 'Users',       href: ROUTES.ADMIN_USERS,       icon: <Users size={18} /> },
  { label: 'Portfolios',  href: ROUTES.ADMIN_PORTFOLIOS,  icon: <FolderOpen size={18} /> },
  { label: 'Templates',   href: ROUTES.ADMIN_TEMPLATES,   icon: <Layout size={18} /> },
  { label: 'Themes',      href: ROUTES.ADMIN_THEMES,      icon: <Palette size={18} /> },
  { label: 'Analytics',   href: ROUTES.ADMIN_ANALYTICS,   icon: <BarChart3 size={18} /> },
];

export function DashboardSidebar({ navItems: navItemsProp, title, variant = 'user' }: DashboardSidebarProps) {
  // Resolve nav list here (inside the client component) so no JSX/function values
  // are ever serialized across the server → client RSC boundary.
  const navItems = navItemsProp ?? (variant === 'admin' ? ADMIN_NAV : USER_NAV);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== ROUTES.DASHBOARD && href !== ROUTES.ADMIN && pathname.startsWith(href + '/'));

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* ── Brand ─────────────────────────────────────── */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-5">
        <div className="relative h-7 w-7 shrink-0">
          <Image src="/portfolio.png" alt={APP_NAME} fill className="object-contain" />
        </div>
        <span className="gradient-text text-base font-bold truncate">
          {title ?? APP_NAME}
        </span>
      
      </div>

      {/* ── Nav items ─────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 no-scrollbar">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]',
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--color-primary)]" />
              )}
              <span className={cn('shrink-0 transition-colors', active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]')}>
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className="ml-auto rounded-full bg-[var(--color-primary)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
              {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* ── User footer ───────────────────────────────── */}
      <div className="shrink-0 border-t border-[var(--color-border)] p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[var(--color-text)]">{user?.name ?? 'User'}</p>
            <p className="truncate text-[10px] text-[var(--color-text-muted)]">{user?.email ?? ''}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="shrink-0 rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile top bar ────────────────────────────── */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-glass)] px-4 backdrop-blur-md lg:hidden">
        <Link href={variant === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD} className="flex items-center gap-2">
          <div className="relative h-6 w-6">
            <Image src="/portfolio.png" alt={APP_NAME} fill className="object-contain" />
          </div>
          <span className="gradient-text text-sm font-bold">{APP_NAME}</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile backdrop ───────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar drawer ────────────────────────────── */}
      <AnimatePresence>
        {(mobileOpen) && (
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--color-border)] bg-[var(--color-bg)] lg:hidden"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-white/5"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop static sidebar ────────────────────── */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)]">
        <SidebarContent />
      </aside>
    </>
  );
}
