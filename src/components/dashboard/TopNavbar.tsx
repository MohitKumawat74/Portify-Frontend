'use client';

import { useState, useRef, useEffect, type ReactNode, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, ChevronDown, User, Settings, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';
import { templateService } from '@/services/templateService';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/cn';

interface TopNavbarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

type SearchSuggestion = {
  id: string;
  label: string;
  subLabel?: string;
  type: 'user' | 'template';
  href: string;
  badge?: string;
};

export function TopNavbar({ title, subtitle, actions }: TopNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { token } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const searchDebounceRef = useRef<number | null>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = pathname.startsWith('/admin');

  function resolveAdminSearchRoute(query: string): string {
    const q = query.toLowerCase();
    if (/dashboard|overview|home/.test(q)) return ROUTES.ADMIN;
    if (/user|member|account/.test(q)) return `${ROUTES.ADMIN_USERS}?search=${encodeURIComponent(query)}`;
    if (/plan|billing|price|subscription/.test(q)) return ROUTES.ADMIN_PLANS;
    if (/portfolio|site/.test(q)) return ROUTES.ADMIN_PORTFOLIOS;
    if (/template|layout/.test(q)) return ROUTES.ADMIN_TEMPLATES;
    if (/theme|color|font/.test(q)) return ROUTES.ADMIN_THEMES;
    if (/analytics|report|metric|stats/.test(q)) return ROUTES.ADMIN_ANALYTICS;
    if (/setting|profile|admin/.test(q)) return ROUTES.ADMIN_SETTINGS;
    return `${ROUTES.ADMIN_USERS}?search=${encodeURIComponent(query)}`;
  }

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query || !isAdmin) return;
    router.push(resolveAdminSearchRoute(query));
  }

  useEffect(() => {
    // Live admin search suggestions for users + templates.
    if (!isAdmin || !token) return;

    const q = searchInput.trim();
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    if (q.length < 2) {
      return;
    }

    // debounce
    searchDebounceRef.current = window.setTimeout(async () => {
      try {
        const [usersRes, templatesRes] = await Promise.all([
          userService.getAll(token, 1, 5, q),
          templateService.search(q, 5),
        ]);

        const userSuggestions: SearchSuggestion[] = usersRes.data
          .filter((u) => u.role !== 'admin')
          .map((u) => ({
            id: `user-${u.id}`,
            label: u.name,
            subLabel: u.email,
            type: 'user',
            href: `${ROUTES.ADMIN_USERS}?search=${encodeURIComponent(u.email || u.name)}`,
            badge: 'User',
          }));

        const templateSuggestions: SearchSuggestion[] = templatesRes.map((t) => ({
          id: `template-${t.id}`,
          label: t.name,
          subLabel: t.description,
          type: 'template',
          href: `${ROUTES.ADMIN_TEMPLATES}?search=${encodeURIComponent(t.name)}`,
          badge: t.isPremium ? 'Premium' : 'Template',
        }));

        setSearchResults([...userSuggestions, ...templateSuggestions].slice(0, 8));
      } catch {
        setSearchResults([]);
      }
    }, 260);

    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    };
  }, [isAdmin, searchInput, token]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    setConfirmLogoutOpen(false);
  };

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
      <form
        onSubmit={handleSearchSubmit}
        className={cn(
          'hidden relative sm:flex items-center rounded-xl border bg-[var(--color-bg-card)] px-3 py-2 transition-all duration-200',
          searchFocused
            ? 'border-[var(--color-primary)]/60 shadow-[0_0_0_3px_rgba(124,58,237,0.12)] w-56'
            : 'border-[var(--color-border)] w-44',
        )}
      >
        <Search size={14} className="shrink-0 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder={isAdmin ? 'Search admin…' : 'Search…'}
          value={searchInput}
          onChange={(e) => {
            const next = e.target.value;
            setSearchInput(next);
            if (next.trim().length < 2) {
              setSearchResults([]);
            }
          }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            if (blurTimeoutRef.current) window.clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = window.setTimeout(() => setSearchFocused(false), 140);
          }}
          className="ml-2 w-full bg-transparent text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
        />
        {/* Admin suggestions dropdown */}
        {isAdmin && searchResults.length > 0 && searchFocused && (
          <div className="absolute left-0 top-full z-50 mt-2 w-80 max-h-64 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-2 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
            {searchResults.map((t) => (
              <Link
                key={t.id}
                href={t.href}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSearchInput('');
                  setSearchFocused(false);
                  setSearchResults([]);
                }}
                className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-white/5"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-[var(--color-text)] truncate">{t.label}</div>
                    {t.badge && <div className="text-[10px] rounded px-2 py-0.5 bg-white/10 text-[var(--color-text)]">{t.badge}</div>}
                  </div>
                  {t.subLabel && <div className="mt-1 text-xs text-[var(--color-text-muted)] truncate">{t.subLabel}</div>}
                </div>
              </Link>
            ))}
            <div className="mt-2 border-t border-[var(--color-border)] pt-2">
              <Link href={`${ROUTES.ADMIN_TEMPLATES}?search=${encodeURIComponent(searchInput)}`} className="block text-xs text-[var(--color-primary)]">View all results</Link>
            </div>
          </div>
        )}
      </form>

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
                <DropdownItem icon={<User size={14} />} href={isAdmin ? ROUTES.ADMIN_SETTINGS : ROUTES.SETTINGS} onClick={() => setDropdownOpen(false)}>
                  Profile Settings
                </DropdownItem>
                <DropdownItem icon={<Settings size={14} />} href={isAdmin ? ROUTES.ADMIN_SETTINGS : ROUTES.SETTINGS} onClick={() => setDropdownOpen(false)}>
                  Account Settings
                </DropdownItem>
                <DropdownItem icon={<ExternalLink size={14} />} href={ROUTES.HOME} onClick={() => setDropdownOpen(false)}>
                  View Website
                </DropdownItem>
              </div>

              <div className="border-t border-[var(--color-border)] py-1">
                <button
                  onClick={() => setConfirmLogoutOpen(true)}
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

      <ConfirmDialog
        isOpen={confirmLogoutOpen}
        title="Log Out"
        description="Are you sure you want to log out from your account?"
        confirmLabel="Log Out"
        tone="danger"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
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
