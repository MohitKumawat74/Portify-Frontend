'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { Users, FolderOpen, Globe, UserPlus } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import type { Analytics, UserAnalytics } from '@/types';

const BAR_GRADIENTS = [
  'from-violet-600 to-indigo-600',
  'from-blue-600 to-cyan-600',
  'from-emerald-600 to-teal-600',
  'from-amber-600 to-orange-600',
];

function SignupsChart({ data }: { data: Analytics['signupsByDay'] }) {
  const visible = data.slice(-14);
  const max = Math.max(...visible.map((d) => d.signups), 1);
  return (
    <div className="flex h-32 items-end gap-1">
      {visible.map((d, i) => (
        <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
          <div
            className="w-full rounded-t-sm bg-gradient-to-t from-violet-700 to-violet-400 transition-all duration-500"
            style={{ height: `${Math.max((d.signups / max) * 100, d.signups > 0 ? 4 : 1)}%` }}
          />
          <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-[10px] text-[var(--color-text)] shadow-xl group-hover:block">
            {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: <strong>{d.signups}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { token } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([adminService.getAnalytics(token), adminService.getUserAnalytics(token)])
      .then(([aRes, uRes]) => {
        if (aRes.data) setAnalytics(aRes.data);
        if (uRes.data) setUserAnalytics(uRes.data);
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [token]);

  const stats = analytics
    ? [
        {
          label: 'Total Users',
          value: analytics.totalUsers.toLocaleString(),
          change: `${analytics.recentSignups} new sign-ups (7d)`,
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
          label: 'Published Portfolios',
          value: analytics.activePortfolios.toLocaleString(),
          change: `${Math.round((analytics.activePortfolios / Math.max(analytics.totalPortfolios, 1)) * 100)}% publication rate`,
          trend: 'up' as const,
          icon: <Globe />,
          gradient: 'from-emerald-600 to-teal-600',
        },
        {
          label: 'New Sign-ups (7d)',
          value: analytics.recentSignups.toLocaleString(),
          change: 'Recent registrations',
          trend: 'up' as const,
          icon: <UserPlus />,
          gradient: 'from-amber-500 to-orange-500',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Platform performance overview and key metrics." />

      {/* KPIs */}
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

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Sign-ups Chart */}
        <DashboardCard title="New Sign-ups" subtitle="Daily sign-ups over the last 14 days">
          {loading ? (
            <div className="h-32 animate-pulse rounded-xl bg-white/5" />
          ) : analytics?.signupsByDay?.length ? (
            <SignupsChart data={analytics.signupsByDay} />
          ) : (
            <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">No signup data available</p>
          )}
        </DashboardCard>

        {/* Top Templates */}
        <DashboardCard title="Template Usage" subtitle="Most popular templates by adoption">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : analytics?.topTemplates?.length ? (
            <div className="space-y-5">
              {analytics.topTemplates.map((t, i) => {
                const maxCount = analytics.topTemplates[0]?.count || 1;
                const pct = Math.round((t.count / maxCount) * 100);
                return (
                  <div key={t.templateId}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)]">#{i + 1}</span>
                        <span className="text-sm font-medium text-[var(--color-text)]">{t.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-[var(--color-text)]">{t.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${BAR_GRADIENTS[i % BAR_GRADIENTS.length]} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">No template usage data</p>
          )}
        </DashboardCard>
      </div>

      {/* User Analytics */}
      {userAnalytics && (
        <div className="grid gap-5 lg:grid-cols-2">
          <DashboardCard title="Users by Plan" subtitle="Subscription distribution across tiers">
            <div className="space-y-4">
              {Object.entries(userAnalytics.usersByPlan).map(([plan, count]) => {
                const total = Object.values(userAnalytics.usersByPlan).reduce((a, b) => a + b, 0);
                const pct = total ? Math.round(((count as number) / total) * 100) : 0;
                const colorMap: Record<string, string> = {
                  free: 'from-slate-500 to-slate-400',
                  pro: 'from-violet-600 to-purple-500',
                  team: 'from-blue-600 to-cyan-500',
                };
                return (
                  <div key={plan}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-medium capitalize text-[var(--color-text)]">{plan}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{(count as number).toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${colorMap[plan] ?? 'from-gray-600 to-gray-400'} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardCard>

          <DashboardCard title="User Retention" subtitle="Engagement and churn metrics">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'New Users', value: userAnalytics.newUsers, color: 'text-violet-400' },
                { label: 'Active Users', value: userAnalytics.activeUsers, color: 'text-blue-400' },
                { label: 'Churned Users', value: userAnalytics.churnedUsers, color: 'text-red-400' },
                { label: 'Retention Rate', value: `${userAnalytics.retentionRate}%`, color: 'text-emerald-400' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">{item.label}</p>
                  <p className={`my-2 text-2xl font-bold ${item.color}`}>
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </p>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Revenue */}
      {analytics && (
        <DashboardCard title="Revenue" subtitle="Current and previous month comparison">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Revenue This Month</p>
              <p className="my-2 text-2xl font-bold text-emerald-400">${analytics.revenueThisMonth.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Revenue Last Month</p>
              <p className="my-2 text-2xl font-bold text-[var(--color-text)]">${analytics.revenueLastMonth.toLocaleString()}</p>
              {analytics.revenueLastMonth > 0 && (
                <p className={`text-[11px] ${analytics.revenueThisMonth >= analytics.revenueLastMonth ? 'text-emerald-400' : 'text-red-400'}`}>
                  {analytics.revenueThisMonth >= analytics.revenueLastMonth ? '▲' : '▼'}{' '}
                  {Math.abs(Math.round(((analytics.revenueThisMonth - analytics.revenueLastMonth) / analytics.revenueLastMonth) * 100))}% vs last month
                </p>
              )}
            </div>
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
