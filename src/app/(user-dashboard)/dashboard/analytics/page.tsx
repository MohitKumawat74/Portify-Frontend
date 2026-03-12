'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuthStore } from '@/store/authStore';
import { portfolioService } from '@/services/portfolioService';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { StatCardSkeleton, Skeleton } from '@/components/dashboard/Skeleton';
import { Button } from '@/components/ui/Button';
import type { PortfolioAnalytics } from '@/types';
import { BarChart3, Eye, Users, Clock, Globe, TrendingUp, RefreshCw, ExternalLink, PlusCircle } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/constants';

type DateRange = '7d' | '30d' | '90d' | 'custom';

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
  'custom': 'Custom',
};

function getFromDate(range: DateRange): string {
  const now = new Date();
  if (range === '7d') now.setDate(now.getDate() - 7);
  else if (range === '30d') now.setDate(now.getDate() - 30);
  else if (range === '90d') now.setDate(now.getDate() - 90);
  else return '';
  return now.toISOString().split('T')[0];
}

export default function AnalyticsPage() {
  const { token } = useAuthStore();
  const { portfolios, fetchPortfolios, isLoading: portfoliosLoading } = usePortfolio();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [refreshKey, setRefreshKey] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  useEffect(() => {
    const param = searchParams?.get('portfolio');
    if (param) { setSelectedId(param); return; }
    const published = portfolios.find((p) => p.isPublished);
    if (published && !selectedId) setSelectedId(published.id);
  }, [portfolios, selectedId, searchParams]);

  useEffect(() => {
    if (!selectedId) return;
    const exists = portfolios.some((p) => p.id === selectedId && p.isPublished);
    if (!exists) setSelectedId(null);
  }, [portfolios, selectedId]);

  useEffect(() => {
    const entries = Array.from(searchParams?.entries?.() ?? []);
    const params = new URLSearchParams(entries);
    if (selectedId) params.set('portfolio', selectedId);
    else params.delete('portfolio');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, pathname]);

  useEffect(() => {
    if (!selectedId || !token) return;
    setAnalyticsLoading(true);
    setAnalyticsError('');
    const from = getFromDate(dateRange);
    const to = new Date().toISOString().split('T')[0];
    portfolioService
      .getAnalytics(selectedId, token, from || undefined, to)
      .then((res) => setAnalytics(res.data))
      .catch((err: unknown) => {
        setAnalyticsError(err instanceof Error ? err.message : 'Failed to load analytics.');
        setAnalytics(null);
      })
      .finally(() => setAnalyticsLoading(false));
  }, [selectedId, token, dateRange, refreshKey]);

  const published = portfolios.filter((p) => p.isPublished);
  const selectedPortfolio = portfolios.find((p) => p.id === selectedId);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Analytics"
        subtitle="Track views, visitors, and performance for your published portfolios."
        actions={
          <div className="flex items-center gap-2">
            {published.length > 0 && (
              <>
                {/* Portfolio selector */}
                <select
                  aria-label="Select portfolio"
                  value={selectedId ?? ''}
                  onChange={(e) => setSelectedId(e.target.value || null)}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-xs sm:text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/60 transition-all cursor-pointer max-w-40 sm:max-w-none"
                >
                  <option value="">Select portfolio…</option>
                  {published.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>

                {/* Refresh */}
                <button
                  onClick={() => setRefreshKey((k) => k + 1)}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/40 transition-all"
                  title="Refresh analytics"
                >
                  <RefreshCw size={14} />
                </button>
              </>
            )}
          </div>
        }
      />

      {/* No published portfolios */}
      {!portfoliosLoading && published.length === 0 && (
        <DashboardCard>
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
              <BarChart3 size={24} className="text-[var(--color-primary)]" />
            </div>
            <p className="mb-1 text-sm font-semibold text-[var(--color-text)]">No analytics available</p>
            <p className="mb-5 text-xs text-[var(--color-text-muted)]">
              Publish a portfolio to start tracking views and visitor statistics.
            </p>
            <Link href={ROUTES.PORTFOLIOS}>
              <Button size="sm" className="gap-1.5">
                <PlusCircle size={14} /> Go to My Portfolios
              </Button>
            </Link>
          </div>
        </DashboardCard>
      )}

      {/* Date range selector */}
      {published.length > 0 && selectedId && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">Range:</span>
          {(['7d', '30d', '90d'] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
                dateRange === r
                  ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_12px_rgba(124,58,237,0.35)]'
                  : 'border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-text)]',
              )}
            >
              {DATE_RANGE_LABELS[r]}
            </button>
          ))}
          {selectedPortfolio?.isPublished && (
            <Link href={`/portfolio/${selectedPortfolio.slug}`} target="_blank" className="ml-auto">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <ExternalLink size={12} /> View Live
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      {(portfoliosLoading || (published.length > 0 && analyticsLoading)) ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : analyticsError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400">
          <p className="font-medium">Failed to load analytics</p>
          <p className="mt-1 text-xs opacity-80">{analyticsError}</p>
        </div>
      ) : analytics ? (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Views"
              value={analytics.totalViews.toLocaleString()}
              icon={<Eye />}
              gradient="from-violet-600 to-purple-600"
              change={`Last ${DATE_RANGE_LABELS[dateRange]}`}
              trend="up"
            />
            <StatCard
              label="Unique Visitors"
              value={analytics.uniqueVisitors.toLocaleString()}
              icon={<Users />}
              gradient="from-blue-600 to-cyan-600"
              change={`${Math.round((analytics.uniqueVisitors / Math.max(analytics.totalViews, 1)) * 100)}% of views`}
              trend="up"
            />
            <StatCard
              label="Avg. Time"
              value={`${analytics.avgTimeOnPage}s`}
              icon={<Clock />}
              gradient="from-emerald-600 to-teal-600"
              change="Per session"
              trend="neutral"
            />
            <StatCard
              label="Countries"
              value={analytics.topCountries.length}
              icon={<Globe />}
              gradient="from-amber-500 to-orange-500"
              change={analytics.topCountries[0]?.country ?? 'No data yet'}
              trend="neutral"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Views chart */}
            <DashboardCard
              title="Views Over Time"
              subtitle={`Daily views · Last ${DATE_RANGE_LABELS[dateRange]}`}
              actions={<TrendingUp size={15} className="text-[var(--color-text-muted)]" />}
            >
              <ViewsChart data={analytics.viewsByDay} />
            </DashboardCard>

            {/* Top Countries */}
            <DashboardCard
              title="Top Countries"
              subtitle="Where your visitors are from"
              actions={<Globe size={15} className="text-[var(--color-text-muted)]" />}
            >
              <div className="space-y-3">
                {analytics.topCountries.length === 0 ? (
                  <p className="py-8 text-center text-xs text-[var(--color-text-muted)]">No country data yet.</p>
                ) : (
                  analytics.topCountries.slice(0, 6).map((c, i) => {
                    const max = analytics.topCountries[0]?.views ?? 1;
                    const pct = Math.round((c.views / max) * 100);
                    return (
                      <div key={c.country}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-4 text-center text-[10px] font-bold text-[var(--color-text-muted)]">
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium text-[var(--color-text)]">{c.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[var(--color-text)]">
                              {c.views.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-muted)]">{pct}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </DashboardCard>
          </div>

          {/* Engagement summary */}
          <DashboardCard title="Engagement Summary">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: 'Views / Visitor',
                  value: analytics.uniqueVisitors > 0
                    ? (analytics.totalViews / analytics.uniqueVisitors).toFixed(1)
                    : '0',
                  desc: 'Average pages per session',
                },
                {
                  label: 'Avg. Session',
                  value: `${analytics.avgTimeOnPage}s`,
                  desc: 'Time spent per visit',
                },
                {
                  label: 'Top Source',
                  value: analytics.topCountries[0]?.country ?? 'N/A',
                  desc: 'Largest visitor country',
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{item.label}</p>
                  <p className="mt-2 text-xl font-bold text-[var(--color-text)]">{item.value}</p>
                  <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </DashboardCard>
        </>
      ) : published.length > 0 && !selectedId ? (
        <DashboardCard>
          <div className="py-12 text-center">
            <BarChart3 size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
            <p className="text-sm text-[var(--color-text-muted)]">Select a portfolio above to view its analytics.</p>
          </div>
        </DashboardCard>
      ) : null}
    </div>
  );
}

function ViewsChart({ data }: { data: Array<{ date: string; views: number }> }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-[var(--color-text-muted)]">No view data in this date range.</p>
    );
  }

  try {
    const slice = data.slice(-30);
    const max = Math.max(...slice.map((d) => Number(d?.views) || 0), 1);
    const totalViews = slice.reduce((s, d) => s + (Number(d?.views) || 0), 0);
    const avgViews = totalViews / slice.length;

    return (
      <div className="space-y-3">
        <div className="flex h-40 items-end gap-0.5 sm:gap-1">
          {slice.map((d) => {
            const views = Number(d?.views) || 0;
            const heightPct = Math.max(Math.round((views / max) * 100), 1);
            const isAboveAvg = views > avgViews;
            const dateStr = typeof d?.date === 'string' ? d.date : String(d?.date ?? '');
            return (
              <div key={dateStr} className="group relative flex flex-1 flex-col items-center gap-1">
                <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2 py-1.5 text-[10px] text-[var(--color-text)] shadow-lg group-hover:block whitespace-nowrap z-10">
                  <span className="font-semibold">{views.toLocaleString()} views</span>
                  <br />
                  <span className="text-[var(--color-text-muted)]">{formatDate(dateStr)}</span>
                </div>
                <div
                  className={cn(
                    'w-full min-h-[2px] rounded-t-sm transition-all duration-300 group-hover:opacity-100',
                    isAboveAvg
                      ? 'bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-secondary)] opacity-90'
                      : 'bg-gradient-to-t from-[var(--color-primary)]/50 to-[var(--color-secondary)]/50 opacity-60',
                  )}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>
        {/* X axis labels */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {formatDate(slice[0]?.date ?? '')}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">
            Avg: {Math.round(avgViews)} views/day
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {formatDate(slice[slice.length - 1]?.date ?? '')}
          </span>
        </div>
      </div>
    );
  } catch {
    return (
      <p className="py-8 text-center text-xs text-[var(--color-text-muted)]">Unable to display chart.</p>
    );
  }
}
