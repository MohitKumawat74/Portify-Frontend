'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useAuthStore } from '@/store/authStore';
import { portfolioService } from '@/services/portfolioService';
import { dashboardService } from '@/services/dashboardService';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { StatCardSkeleton, CardSkeleton } from '@/components/dashboard/Skeleton';
import { UpgradeModal } from '@/components/dashboard/UpgradeModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ROUTES } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { DashboardPlanStats } from '@/types';
import { canCreateByUsage, usageLabel } from '@/utils/plan';
import { MOCK_PORTFOLIOS, MOCK_PORTFOLIO_ANALYTICS } from '@/data/mockUser';
import {
  FolderOpen,
  Globe,
  FileText,
  PlusCircle,
  ArrowRight,
  Settings,
  ExternalLink,
  Pencil,
  Eye,
  TrendingUp,
  Zap,
  BarChart3,
  Layout,
  CreditCard,
  Crown,
} from 'lucide-react';

/** Flip to false when connecting to the real API */
const USE_MOCK = false;

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { token, planId, planName, setPlanUsage } = useAuthStore();
  const { portfolios, fetchPortfolios, isLoading } = usePortfolio();
  const { setPortfolios, setLoading } = usePortfolioStore();
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [planStats, setPlanStats] = useState<DashboardPlanStats | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    if (USE_MOCK) {
      setPortfolios(MOCK_PORTFOLIOS);
      setLoading(false);
      return;
    }
    fetchPortfolios();
  }, [fetchPortfolios, setPortfolios, setLoading]);

  useEffect(() => {
    if (!token) return;

    dashboardService
      .getStats(token)
      .then((stats) => {
        setPlanStats(stats);
        setPlanUsage(stats);
      });
  }, [token, setPlanUsage]);

  // Aggregate total views across all published portfolios
  useEffect(() => {
    if (USE_MOCK) {
      const total = Object.values(MOCK_PORTFOLIO_ANALYTICS).reduce(
        (sum, a) => sum + a.totalViews,
        0,
      );
      const mockTotalTimer = window.setTimeout(() => setTotalViews(total), 0);
      return () => window.clearTimeout(mockTotalTimer);
    }
    const published = portfolios.filter((p) => p.isPublished);
    if (!token || published.length === 0) {
      const zeroTimer = window.setTimeout(() => setTotalViews(0), 0);
      return () => window.clearTimeout(zeroTimer);
    }
    const requests = published.map((p) =>
      portfolioService.getAnalytics(p.id, token).then((r) => r.data.totalViews).catch(() => 0)
    );
    Promise.all(requests)
      .then((views) => setTotalViews(views.reduce((a, b) => a + b, 0)));
  }, [portfolios, token]);

  const published = portfolios.filter((p) => p.isPublished);
  const drafts = portfolios.filter((p) => !p.isPublished);
  const recent = [...portfolios]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const activeStats = planStats;
  const planStatsLoading = token ? activeStats === null : false;
  const canCreatePortfolio = activeStats
    ? canCreateByUsage(activeStats.portfolioUsage.used, activeStats.portfolioUsage.limit)
    : true;
  const isFreeTier = activeStats ? !activeStats.isPro : planId === 'plan_free';

  const templateGradient = (id: string) =>
    id === 'template1' ? 'from-violet-500 to-purple-500' :
    id === 'template2' ? 'from-slate-600 to-gray-500' :
    'from-blue-500 to-cyan-500';

  return (
    <>
      <div className="space-y-6 pb-8">
      {/* ── Header ─────────────────────────────────────── */}
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] ?? 'there'} 👋`}
        subtitle="Here's what's happening with your portfolios today."
        actions={
          <>
            {isFreeTier && (
              <Button size="sm" variant="glow" className="gap-1.5" onClick={() => setUpgradeOpen(true)}>
                <Crown size={14} /> Upgrade to Pro
              </Button>
            )}
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                if (canCreatePortfolio) {
                  router.push(ROUTES.CREATE_PORTFOLIO);
                  return;
                }
                setUpgradeOpen(true);
              }}
              disabled={!canCreatePortfolio}
              title={!canCreatePortfolio ? 'Limit reached. Upgrade to Pro' : undefined}
            >
              <PlusCircle size={14} />
              <span className="hidden sm:inline">New Portfolio</span>
              <span className="sm:hidden">New</span>
            </Button>
          </>
        }
      />

      {/* Plan usage */}
      <DashboardCard
        title="Plan & Usage"
        subtitle={planStatsLoading ? 'Loading usage...' : `${planName} plan status and limits`}
        actions={
          isFreeTier ? (
            <Button size="sm" variant="outline" onClick={() => setUpgradeOpen(true)} className="gap-1">
              <CreditCard size={13} /> Upgrade
            </Button>
          ) : (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
              PRO
            </span>
          )
        }
      >
        {planStatsLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
          </div>
        ) : activeStats ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--color-text)]">Current Plan</span>
              <span className="rounded-full bg-[var(--color-primary)]/15 px-2 py-0.5 font-semibold text-[var(--color-primary)]">
                {activeStats.planName}
              </span>
            </div>

            {[
              {
                label: 'Portfolio usage',
                used: activeStats.portfolioUsage.used,
                limit: activeStats.portfolioUsage.limit,
                pct: activeStats.portfolioUsage.percentage,
              },
              {
                label: 'Project usage',
                used: activeStats.projectUsage.used,
                limit: activeStats.projectUsage.limit,
                pct: activeStats.projectUsage.percentage,
              },
            ].map((meter) => (
              <div key={meter.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-muted)]">{meter.label}</span>
                  <span className="font-semibold text-[var(--color-text)]">{usageLabel(meter.used, meter.limit)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(2, meter.pct)}%` }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--color-text-muted)]">Usage stats unavailable right now.</p>
        )}
      </DashboardCard>

      {/* ── Stats ──────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <StatCard
                label="Total Portfolios"
                value={portfolios.length}
                icon={<FolderOpen />}
                gradient="from-violet-600 to-purple-600"
                change="All time"
                trend="neutral"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
              <StatCard
                label="Published"
                value={published.length}
                icon={<Globe />}
                gradient="from-emerald-600 to-teal-600"
                change={published.length > 0 ? 'Live & visible' : 'None live yet'}
                trend={published.length > 0 ? 'up' : 'neutral'}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
              <StatCard
                label="Drafts"
                value={drafts.length}
                icon={<FileText />}
                gradient="from-amber-500 to-orange-500"
                change={drafts.length > 0 ? 'In progress' : 'No drafts'}
                trend="neutral"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
              <StatCard
                label="Total Views"
                value={isLoading || totalViews === null ? '—' : totalViews.toLocaleString()}
                icon={<Eye />}
                gradient="from-blue-600 to-cyan-600"
                change={published.length > 0 ? 'Across all portfolios' : 'Publish to track'}
                trend={totalViews && totalViews > 0 ? 'up' : 'neutral'}
              />
            </motion.div>
          </>
        )}
      </div>

      {/* ── Quick Actions ──────────────────────────────── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Create Portfolio', href: ROUTES.CREATE_PORTFOLIO, icon: <PlusCircle size={16} />, color: 'from-violet-600 to-purple-600', guarded: true },
          { label: 'My Portfolios',    href: ROUTES.PORTFOLIOS,        icon: <FolderOpen  size={16} />, color: 'from-blue-600 to-cyan-600' },
          { label: 'Browse Templates', href: ROUTES.TEMPLATES,         icon: <Layout      size={16} />, color: 'from-emerald-600 to-teal-600' },
          { label: 'Analytics',        href: ROUTES.ANALYTICS,         icon: <BarChart3   size={16} />, color: 'from-rose-500 to-pink-500' },
          ...(isFreeTier
            ? [{ label: 'Upgrade to Pro', href: ROUTES.PRICING_PAGE, icon: <Crown size={16} />, color: 'from-amber-500 to-orange-500', guarded: false, openUpgrade: true as const }]
            : []),
        ].map((a) => (
          <button
            key={a.href}
            type="button"
            onClick={() => {
              if (a.openUpgrade) {
                setUpgradeOpen(true);
                return;
              }
              if (a.guarded && !canCreatePortfolio) {
                setUpgradeOpen(true);
                return;
              }
              router.push(a.href);
            }}
            className={cn('text-left', a.guarded && !canCreatePortfolio && 'cursor-not-allowed')}
            title={a.guarded && !canCreatePortfolio ? 'Limit reached. Upgrade to Pro' : undefined}
          >
            <div className={cn(
              'group flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-3 sm:px-4 sm:py-3.5 transition-all duration-200 hover:border-[var(--color-primary)]/40 hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:-translate-y-0.5',
              a.guarded && !canCreatePortfolio && 'opacity-60 hover:-translate-y-0',
            )}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${a.color} text-white`}>
                {a.icon}
              </div>
              <span className="text-xs sm:text-sm font-medium text-[var(--color-text)] truncate">{a.label}</span>
              <ArrowRight size={14} className="ml-auto shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>

      {/* ── Main Content Grid ──────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Recent Portfolios - takes 2 cols */}
        <div className="xl:col-span-2">
          <DashboardCard
            title="Recent Portfolios"
            subtitle="Your latest portfolio projects"
            actions={
              <Link href={ROUTES.PORTFOLIOS}>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all <ArrowRight size={12} />
                </Button>
              </Link>
            }
          >
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : recent.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="No portfolios yet"
                description="Create your first portfolio to get started."
                ctaLabel="Create Portfolio"
                ctaHref={ROUTES.CREATE_PORTFOLIO}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {recent.map((p) => (
                  <div
                    key={p.id}
                    className="group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 transition-all duration-200 hover:border-[var(--color-primary)]/30 hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
                  >
                    {/* Template color bar */}
                    <div className={`mb-3 h-1 w-10 rounded-full bg-gradient-to-r ${templateGradient(p.templateId)}`} />
                    <span
                      className={cn(
                        'absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        p.isPublished ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-[var(--color-text-muted)]'
                      )}
                    >
                      {p.isPublished ? '● Live' : '○ Draft'}
                    </span>
                    <h3 className="mb-0.5 pr-14 text-sm font-semibold text-[var(--color-text)] line-clamp-1">{p.title}</h3>
                    <p className="mb-0.5 text-[11px] text-[var(--color-text-muted)] font-mono">/{p.slug}</p>
                    <p className="mb-3 text-[11px] text-[var(--color-text-muted)]">
                      Updated {formatDate(p.updatedAt)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/portfolios/edit/${p.id}`}>
                        <Button variant="outline" size="sm" className="gap-1 h-7 text-xs px-2.5">
                          <Pencil size={11} /> Edit
                        </Button>
                      </Link>
                      {p.isPublished && (
                        <Link href={`/portfolio/${p.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs px-2.5">
                            <ExternalLink size={11} /> View
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Getting Started / Tips */}
          <DashboardCard title="Getting Started" subtitle="Complete your profile">
            <div className="space-y-3">
              {[
                {
                  done: portfolios.length > 0,
                  label: 'Create your first portfolio',
                  href: ROUTES.CREATE_PORTFOLIO,
                  icon: <FolderOpen size={14} />,
                },
                {
                  done: published.length > 0,
                  label: 'Publish a portfolio',
                  href: ROUTES.PORTFOLIOS,
                  icon: <Globe size={14} />,
                },
                {
                  done: false,
                  label: 'Customize your theme',
                  href: ROUTES.PORTFOLIOS,
                  icon: <Zap size={14} />,
                },
                {
                  done: false,
                  label: 'View your analytics',
                  href: ROUTES.ANALYTICS,
                  icon: <TrendingUp size={14} />,
                },
              ].map((step, i) => (
                <Link key={i} href={step.done ? '#' : step.href} className={cn(step.done && 'pointer-events-none')}>
                  <div className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150',
                    step.done
                      ? 'opacity-50'
                      : 'hover:bg-[var(--color-primary)]/5 cursor-pointer'
                  )}>
                    <div className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                      step.done
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    )}>
                      {step.done ? <span className="text-[10px]">✓</span> : step.icon}
                    </div>
                    <span className={cn(
                      'text-xs font-medium',
                      step.done ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'
                    )}>
                      {step.label}
                    </span>
                    {!step.done && <ArrowRight size={12} className="ml-auto text-[var(--color-text-muted)]" />}
                  </div>
                </Link>
              ))}
            </div>
          </DashboardCard>

          {/* Account links */}
          <DashboardCard title="Account">
            <div className="space-y-1">
              {[
                { label: 'Billing & Plans', href: ROUTES.ACCOUNT, icon: <CreditCard size={14} /> },
                { label: 'Profile Settings', href: ROUTES.SETTINGS, icon: <Settings size={14} /> },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--color-primary)]/5 transition-colors">
                    <span className="text-[var(--color-text-muted)]">{item.icon}</span>
                    <span className="text-xs font-medium text-[var(--color-text)]">{item.label}</span>
                    <ArrowRight size={12} className="ml-auto text-[var(--color-text-muted)]" />
                  </div>
                </Link>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
      </div>
      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onUpgraded={async () => {
          if (!token) return;
          const stats = await dashboardService.getStats(token);
          setPlanStats(stats);
          setPlanUsage(stats);
        }}
      />
    </>
  );
}
