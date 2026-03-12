'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, ChevronDown, User, Settings, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/cn';

interface TopNavbarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function TopNavbar({ title, subtitle, actions }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 px-4 backdrop-blur-md sm:px-6">
      {/* ── Page title (desktop) ───────────────────────── */}
      <div className="hidden min-w-0 lg:block">
        <h1 className="truncate text-lg font-bold text-[var(--color-text)] leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--color-text-muted)] truncate">{subtitle}</p>}
      </div>

      <div className="flex-1" />

      {/* ── Search bar ─────────────────────────────────── */}
      <div className={cn(
        'hidden relative sm:flex items-center rounded-xl border bg-[var(--color-bg-card)] px-3 py-2 transition-all duration-200',
        searchFocused
          ? 'border-[var(--color-primary)]/60 shadow-[0_0_0_3px_rgba(124,58,237,0.12)] w-56'
          : 'border-[var(--color-border)] w-44',
      )}>
        <Search size={14} className="shrink-0 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search…"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="ml-2 w-full bg-transparent text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
        />
      </div>

      {/* ── Extra actions slot ─────────────────────────── */}
      {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

      {/* ── Notifications ──────────────────────────────── */}
      <button className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/40">
        <Bell size={16} />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
      </button>

      {/* ── Profile dropdown ───────────────────────────── */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] py-1.5 pl-1.5 pr-3 transition-all duration-200 hover:border-[var(--color-primary)]/40"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-xs font-bold text-white">
            {initials}
          </div>
          <span className="hidden text-xs font-medium text-[var(--color-text)] sm:block max-w-24 truncate">
            {user?.name ?? 'User'}
          </span>
          <ChevronDown
            size={14}
            className={cn('text-[var(--color-text-muted)] transition-transform duration-200', dropdownOpen && 'rotate-180')}
          />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] py-1 shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* User info */}
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <p className="text-xs font-semibold text-[var(--color-text)] truncate">{user?.name}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <DropdownItem icon={<User size={14} />} href={ROUTES.SETTINGS} onClick={() => setDropdownOpen(false)}>
                  Profile Settings
                </DropdownItem>
                <DropdownItem icon={<Settings size={14} />} href={ROUTES.SETTINGS} onClick={() => setDropdownOpen(false)}>
                  Account Settings
                </DropdownItem>
                <DropdownItem icon={<ExternalLink size={14} />} href={ROUTES.HOME} onClick={() => setDropdownOpen(false)}>
                  View Website
                </DropdownItem>
              </div>

              <div className="border-t border-[var(--color-border)] py-1">
                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function DropdownItem({
  icon,
  href,
  onClick,
  children,
}: {
  icon: ReactNode;
  href: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-xs text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text)]"
    >
      {icon}
      {children}
    </Link>
  );
}
