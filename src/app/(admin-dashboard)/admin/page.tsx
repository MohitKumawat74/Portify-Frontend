'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { ROUTES } from '@/utils/constants';
import { Users, FolderOpen, Layout, Globe, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import type { Analytics } from '@/types';

// Recent activity is a placeholder — no dedicated API endpoint exists yet
const recentActivity = [
  { user: 'alice@example.com', action: 'Published portfolio', time: '2 min ago',  color: 'bg-emerald-500' },
  { user: 'bob@example.com',   action: 'Created portfolio',   time: '14 min ago', color: 'bg-blue-500' },
  { user: 'carol@example.com', action: 'Registered',          time: '1 hr ago',   color: 'bg-violet-500' },
  { user: 'david@example.com', action: 'Changed template',    time: '2 hr ago',   color: 'bg-amber-500' },
  { user: 'eve@example.com',   action: 'Published portfolio', time: '3 hr ago',   color: 'bg-emerald-500' },
];

const shortcuts = [
  { label: 'Manage Users',     href: ROUTES.ADMIN_USERS,     icon: <Users      size={16} />, color: 'from-violet-600 to-purple-600' },
  { label: 'Manage Templates', href: ROUTES.ADMIN_TEMPLATES, icon: <Layout     size={16} />, color: 'from-blue-600 to-cyan-600' },
  { label: 'View Analytics',   href: ROUTES.ADMIN_ANALYTICS, icon: <TrendingUp size={16} />, color: 'from-emerald-600 to-teal-600' },
];

export default function AdminPage() {
  const { token } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminService
      .getAnalytics(token)
      .then((res) => { if (res.data) setAnalytics(res.data); })
      .catch(() => toast.error('Failed to load overview stats'))
      .finally(() => setLoading(false));
  }, [token]);

  const stats = analytics
    ? [
        {
          label: 'Total Users',
          value: analytics.totalUsers.toLocaleString(),
          change: `${analytics.recentSignups} new (7d)`,
          trend: 'up' as const,
          icon: <Users />,
          gradient: 'from-violet-600 to-purple-600',
        },
        {
          label: 'Total Portfolios',
          value: analytics.totalPortfolios.toLocaleString(),
          change: `${analytics.activePortfolios} published`,
          trend: 'up' as const,
          icon: <FolderOpen />,
          gradient: 'from-blue-600 to-cyan-600',
        },
        {
          label: 'Active Templates',
          value: analytics.totalTemplates.toLocaleString(),
          change: 'Platform templates',
          trend: 'neutral' as const,
          icon: <Layout />,
          gradient: 'from-emerald-600 to-teal-600',
        },
        {
          label: 'Published Portfolios',
          value: analytics.activePortfolios.toLocaleString(),
          change: `${Math.round((analytics.activePortfolios / Math.max(analytics.totalPortfolios, 1)) * 100)}% publication rate`,
          trend: 'up' as const,
          icon: <Globe />,
          gradient: 'from-amber-500 to-orange-500',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" subtitle="Platform-wide overview and management." />

      {/* Stats */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Quick Actions</h2>
          {shortcuts.map((sc) => (
            <Link key={sc.href} href={sc.href}>
              <div className="group flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/40 hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${sc.color} text-white`}>
                  {sc.icon}
                </div>
                <span className="text-sm font-medium text-[var(--color-text)]">{sc.label}</span>
                <ArrowRight size={14} className="ml-auto text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <DashboardCard
            title="Recent Activity"
            subtitle="Latest actions on the platform"
            actions={<Activity size={15} className="text-[var(--color-text-muted)]" />}
          >
            <ul className="divide-y divide-[var(--color-border)]">
              {recentActivity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${a.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[var(--color-text)]">{a.user}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{a.action}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-[var(--color-text-muted)]">{a.time}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-right">
              <Link href={ROUTES.ADMIN_ANALYTICS}>
                <Button variant="ghost" size="sm" className="gap-1">
                  View analytics <ArrowRight size={12} />
                </Button>
              </Link>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

