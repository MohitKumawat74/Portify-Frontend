'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { Modal } from '@/components/ui/Modal';
import { portfolioService } from '@/services/portfolioService';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import type { Portfolio } from '@/types';
import { Search, Trash2, Globe, EyeOff, Loader2, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

export default function AdminPortfoliosPage() {
  const { token } = useAuthStore();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    portfolioService
      .getAll(token, page, PAGE_SIZE)
      .then((res) => {
        setPortfolios(res.data ?? []);
        setTotalPages(res.totalPages ?? 1);
      })
      .catch(() => toast.error('Failed to load portfolios'))
      .finally(() => setLoading(false));
  }, [token, page]);

  const filtered = query
    ? portfolios.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.slug.toLowerCase().includes(query.toLowerCase()),
      )
    : portfolios;

  async function togglePublish(p: Portfolio) {
    if (!token) return;
    setTogglingId(p.id);
    try {
      if (p.isPublished) {
        await portfolioService.unpublish(p.id, token);
        setPortfolios((prev) => prev.map((x) => (x.id === p.id ? { ...x, isPublished: false } : x)));
        toast.success('Portfolio unpublished');
      } else {
        await portfolioService.publish(p.id, token);
        setPortfolios((prev) => prev.map((x) => (x.id === p.id ? { ...x, isPublished: true } : x)));
        toast.success('Portfolio published');
      }
    } catch {
      toast.error('Failed to update portfolio status');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      await portfolioService.delete(deleteTarget.id, token);
      setPortfolios((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success('Portfolio deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete portfolio');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="All Portfolios" subtitle="View and moderate portfolios across the platform." />

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setQuery(search)}
            placeholder="Search by title or slug…"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] py-2 pl-9 pr-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
          />
        </div>
        <Button size="sm" variant="outline" onClick={() => setQuery(search)}>
          Search
        </Button>
        {query && (
          <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setQuery(''); }}>
            Clear
          </Button>
        )}
      </div>

      <DashboardCard title="" subtitle="">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <FolderOpen size={40} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
            <p className="text-sm text-[var(--color-text-muted)]">No portfolios found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {['Title', 'Slug', 'Template', 'Status', 'Created', ''].map((h) => (
                    <th
                      key={h}
                      className={`pb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] ${h ? 'text-left' : 'text-right'}`}
                    >
                      {h || 'Actions'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="py-3 font-medium text-[var(--color-text)]">{p.title}</td>
                    <td className="py-3 font-mono text-xs text-[var(--color-text-muted)]">{p.slug}</td>
                    <td className="py-3 text-xs text-[var(--color-text-muted)]">{p.templateId}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          p.isPublished
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-slate-500/15 text-slate-400'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${p.isPublished ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                        {p.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-[var(--color-text-muted)]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={
                            p.isPublished
                              ? 'hover:bg-amber-500/10 hover:text-amber-400'
                              : 'hover:bg-emerald-500/10 hover:text-emerald-400'
                          }
                          onClick={() => togglePublish(p)}
                          disabled={togglingId === p.id}
                          title={p.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {togglingId === p.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : p.isPublished ? (
                            <EyeOff size={13} />
                          ) : (
                            <Globe size={13} />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:bg-red-500/10 hover:text-red-400"
                          onClick={() => setDeleteTarget(p)}
                          title="Delete portfolio"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
            <p className="text-xs text-[var(--color-text-muted)]">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={13} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}
      </DashboardCard>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Portfolio">
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          Permanently delete{' '}
          <span className="font-semibold text-[var(--color-text)]">{deleteTarget?.title}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting} className="gap-2">
            {deleting && <Loader2 size={13} className="animate-spin" />}
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
