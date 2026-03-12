'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuthStore } from '@/store/authStore';
import { portfolioService } from '@/services/portfolioService';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { CardSkeleton } from '@/components/dashboard/Skeleton';
import { toast } from '@/store/toastStore';
import { ROUTES } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import {
  FolderOpen, PlusCircle, Pencil, Trash2, ExternalLink,
  Search, Globe, EyeOff, ChevronDown, Filter, BarChart3,
} from 'lucide-react';

type Filter = 'all' | 'published' | 'draft';
type SortKey = 'updated' | 'created' | 'title';

const TEMPLATE_GRADIENTS: Record<string, string> = {
  template1: 'from-violet-500 to-purple-500',
  template2: 'from-slate-600 to-gray-500',
  template3: 'from-blue-500 to-cyan-500',
};
const TEMPLATE_NAMES: Record<string, string> = {
  template1: 'Modern Minimal',
  template2: 'Dark Creative',
  template3: 'Professional',
};

export default function PortfoliosPage() {
  const { portfolios, fetchPortfolios, deletePortfolio, isLoading, updatePortfolio } = usePortfolio();
  const { token } = useAuthStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const filtered = portfolios
    .filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase());
      const matchFilter = filter === 'all' || (filter === 'published' ? p.isPublished : !p.isPublished);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortKey === 'title') return a.title.localeCompare(b.title);
      if (sortKey === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deletePortfolio(deleteTarget);
      toast.success('Portfolio deleted.');
    } catch {
      toast.error('Failed to delete portfolio.');
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handlePublishToggle(id: string, isPublished: boolean) {
    if (!token) return;
    setTogglingId(id);
    try {
      if (isPublished) {
        const res = await portfolioService.unpublish(id, token);
        updatePortfolio(id, { isPublished: false, updatedAt: res.data.updatedAt });
        toast.success('Portfolio unpublished.');
      } else {
        const res = await portfolioService.publish(id, token);
        updatePortfolio(id, { isPublished: true, updatedAt: res.data.updatedAt });
        toast.success('Portfolio published!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  }

  const published = portfolios.filter((p) => p.isPublished).length;
  const drafts = portfolios.filter((p) => !p.isPublished).length;

  return (
    <div className="space-y-5 pb-8">
      <PageHeader
        title="My Portfolios"
        subtitle={
          portfolios.length > 0
            ? `${portfolios.length} total · ${published} published · ${drafts} draft`
            : 'Create and manage your portfolios'
        }
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

      {/* Summary pills */}
      {!isLoading && portfolios.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all' as Filter, label: `All (${portfolios.length})` },
            { key: 'published' as Filter, label: `Published (${published})`, color: 'text-emerald-400' },
            { key: 'draft' as Filter, label: `Draft (${drafts})`, color: 'text-amber-400' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
                filter === key
                  ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_12px_rgba(124,58,237,0.35)]'
                  : cn(
                      'border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary)]/40',
                      color ?? 'text-[var(--color-text-muted)]',
                    ),
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search by title or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] py-2.5 pl-9 pr-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)]/60 focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
          />
        </div>

        <div className="relative">
          <Filter size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] py-2.5 pl-8 pr-8 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/60 transition-all cursor-pointer"
          >
            <option value="updated">Last updated</option>
            <option value="created">Date created</option>
            <option value="title">Name (A–Z)</option>
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        </div>
      </div>

      {/* Portfolio Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <DashboardCard>
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
              <FolderOpen size={24} className="text-[var(--color-primary)]" />
            </div>
            <p className="mb-1 text-sm font-semibold text-[var(--color-text)]">
              {search || filter !== 'all' ? 'No results found' : 'No portfolios yet'}
            </p>
            <p className="mb-5 text-xs text-[var(--color-text-muted)]">
              {search || filter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Create your first portfolio to get started.'}
            </p>
            {!search && filter === 'all' && (
              <Link href={ROUTES.CREATE_PORTFOLIO}>
                <Button size="sm" className="gap-1.5">
                  <PlusCircle size={14} /> Create Portfolio
                </Button>
              </Link>
            )}
          </div>
        </DashboardCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const gradient = TEMPLATE_GRADIENTS[p.templateId] ?? 'from-violet-500 to-purple-500';
            const templateName = TEMPLATE_NAMES[p.templateId] ?? p.templateId;
            return (
              <div
                key={p.id}
                className="group relative flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden transition-all duration-200 hover:border-[var(--color-primary)]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
              >
                {/* Template preview header */}
                <div className={cn('relative h-24 bg-gradient-to-br', gradient)}>
                  {/* Decorative dots */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute left-4 top-4 h-8 w-8 rounded-full bg-white/30" />
                    <div className="absolute right-6 bottom-4 h-6 w-6 rounded-full bg-white/20" />
                    <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
                  </div>
                  {/* Status badge */}
                  <span className={cn(
                    'absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm',
                    p.isPublished
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-black/20 text-white/70 border border-white/10',
                  )}>
                    {p.isPublished ? '● Live' : '○ Draft'}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-0.5 text-sm font-semibold text-[var(--color-text)] line-clamp-1">{p.title}</h3>
                  <p className="mb-0.5 font-mono text-[11px] text-[var(--color-text-muted)]">/{p.slug}</p>
                  <p className="mb-4 text-[11px] text-[var(--color-text-muted)]">
                    {templateName} · Updated {formatDate(p.updatedAt)}
                  </p>

                  {/* Actions */}
                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    <Link href={`/dashboard/portfolios/edit/${p.id}`}>
                      <Button variant="outline" size="sm" className="gap-1 h-7 text-xs">
                        <Pencil size={11} /> Edit
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-7 text-xs"
                      isLoading={togglingId === p.id}
                      onClick={() => handlePublishToggle(p.id, p.isPublished)}
                    >
                      {p.isPublished ? <EyeOff size={11} /> : <Globe size={11} />}
                      {p.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>

                    {p.isPublished && (
                      <>
                        <Link href={`/portfolio/${p.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
                            <ExternalLink size={11} /> View
                          </Button>
                        </Link>
                        <Link href={`${ROUTES.ANALYTICS}?portfolio=${p.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
                            <BarChart3 size={11} /> Stats
                          </Button>
                        </Link>
                      </>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => { setDeleteTarget(p.id); setDeleteName(p.title); }}
                      title="Delete portfolio"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Portfolio" size="sm">
        <div className="space-y-5">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-[var(--color-text)]">"{deleteName}"</span>?
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              This action cannot be undone. All data including sections and analytics will be lost.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleDelete}>Delete Portfolio</Button>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
