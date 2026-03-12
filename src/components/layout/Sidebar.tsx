'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface SidebarProps extends HTMLAttributes<HTMLElement> {
  navItems: NavItem[];
  title?: string;
  footer?: ReactNode;
}

export function Sidebar({ navItems, title, footer, className = '' }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (
    <ul className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              {item.icon && <span className="h-5 w-5 flex-shrink-0">{item.icon}</span>}
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile top bar — hidden on lg+ */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        {title && <span className="text-base font-bold text-indigo-600">{title}</span>}
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:static lg:translate-x-0',
          className,
        )}
      >
        {/* Header */}
        <div className="flex min-h-[56px] items-center justify-between border-b border-gray-100 px-6">
          {title && <span className="text-lg font-bold text-indigo-600">{title}</span>}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navLinks}
        </nav>

        {footer && (
          <div className="border-t border-gray-100 p-4">{footer}</div>
        )}
      </aside>
    </>
  );
}
