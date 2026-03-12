'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuthStore } from '@/store/authStore';
import { portfolioService } from '@/services/portfolioService';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { StatCardSkeleton, CardSkeleton } from '@/components/dashboard/Skeleton';
import { ROUTES } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';
import { cn } from '@/utils/cn';
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
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { token } = useAuthStore();
  const { portfolios, fetchPortfolios, isLoading } = usePortfolio();
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [viewsLoading, setViewsLoading] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Aggregate total views across all published portfolios
  useEffect(() => {
    const published = portfolios.filter((p) => p.isPublished);
    if (!token || published.length === 0) {
      setTotalViews(0);
      return;
    }
    setViewsLoading(true);
    const requests = published.map((p) =>
      portfolioService.getAnalytics(p.id, token).then((r) => r.data.totalViews).catch(() => 0)
    );
    Promise.all(requests)
      .then((views) => setTotalViews(views.reduce((a, b) => a + b, 0)))
      .finally(() => setViewsLoading(false));
  }, [portfolios, token]);

  const published = portfolios.filter((p) => p.isPublished);
  const drafts = portfolios.filter((p) => !p.isPublished);
  const recent = [...portfolios]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const templateGradient = (id: string) =>
    id === 'template1' ? 'from-violet-500 to-purple-500' :
    id === 'template2' ? 'from-slate-600 to-gray-500' :
    'from-blue-500 to-cyan-500';

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ─────────────────────────────────────── */}
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] ?? 'there'} 👋`}
        subtitle="Here's what's happening with your portfolios today."
        actions={
          <Link href={ROUTES.CREATE_PORTFOLIO}>
            <Button size="sm" className="gap-1.5">
              <PlusCircle size={14} />
              <span className="hidden sm:inline">New Portfolio</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        }
      />

      {/* ── Stats ──────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Portfolios"
              value={portfolios.length}
              icon={<FolderOpen />}
              gradient="from-violet-600 to-purple-600"
              change="All time"
              trend="neutral"
            />
            <StatCard
              label="Published"
              value={published.length}
              icon={<Globe />}
              gradient="from-emerald-600 to-teal-600"
              change={published.length > 0 ? 'Live & visible' : 'None live yet'}
              trend={published.length > 0 ? 'up' : 'neutral'}
            />
            <StatCard
              label="Drafts"
              value={drafts.length}
              icon={<FileText />}
              gradient="from-amber-500 to-orange-500"
              change={drafts.length > 0 ? 'In progress' : 'No drafts'}
              trend="neutral"
            />
            <StatCard
              label="Total Views"
              value={viewsLoading || isLoading ? '—' : (totalViews ?? 0).toLocaleString()}
              icon={<Eye />}
              gradient="from-blue-600 to-cyan-600"
              change={published.length > 0 ? 'Across all portfolios' : 'Publish to track'}
              trend={totalViews && totalViews > 0 ? 'up' : 'neutral'}
            />
          </>
        )}
      </div>

      {/* ── Quick Actions ──────────────────────────────── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Create Portfolio', href: ROUTES.CREATE_PORTFOLIO, icon: <PlusCircle size={16} />, color: 'from-violet-600 to-purple-600' },
          { label: 'My Portfolios',    href: ROUTES.PORTFOLIOS,        icon: <FolderOpen  size={16} />, color: 'from-blue-600 to-cyan-600' },
          { label: 'Browse Templates', href: ROUTES.TEMPLATES,         icon: <Layout      size={16} />, color: 'from-emerald-600 to-teal-600' },
          { label: 'Analytics',        href: ROUTES.ANALYTICS,         icon: <BarChart3   size={16} />, color: 'from-rose-500 to-pink-500' },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <div className="group flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-3 sm:px-4 sm:py-3.5 transition-all duration-200 hover:border-[var(--color-primary)]/40 hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:-translate-y-0.5">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${a.color} text-white`}>
                {a.icon}
              </div>
              <span className="text-xs sm:text-sm font-medium text-[var(--color-text)] truncate">{a.label}</span>
              <ArrowRight size={14} className="ml-auto shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
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
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
                  <FolderOpen size={24} className="text-[var(--color-primary)]" />
                </div>
                <p className="mb-1 text-sm font-medium text-[var(--color-text)]">No portfolios yet</p>
                <p className="mb-4 text-xs text-[var(--color-text-muted)]">Create your first portfolio to get started.</p>
                <Link href={ROUTES.CREATE_PORTFOLIO}>
                  <Button size="sm">
                    <PlusCircle size={14} className="mr-1.5" />
                    Create Portfolio
                  </Button>
                </Link>
              </div>
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
  );
}
