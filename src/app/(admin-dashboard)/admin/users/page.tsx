'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { TableRowSkeleton } from '@/components/dashboard/Skeleton';
import { toast } from '@/store/toastStore';
import { formatDate } from '@/utils/helpers';
import type { User } from '@/types';
import {
  Search,
  Users,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  AlertCircle,
  Eye,
} from 'lucide-react';

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search')?.trim() ?? '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search')?.trim() ?? '');
  const [isLoading, setIsLoading] = useState(true);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit user
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // View user
  const [viewTarget, setViewTarget] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await userService.getAll(token, page, PAGE_SIZE, search || undefined, 'user');
      setUsers(res.data.filter((u) => u.role !== 'admin'));
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const next = searchParams.get('search')?.trim() ?? '';
    setSearchInput(next);
    setSearch(next);
    setPage(1);
  }, [searchParams]);

  function handleSearchSubmit() {
    const next = searchInput.trim();
    setSearch(next);
    setPage(1);
    const query = next ? `?search=${encodeURIComponent(next)}` : '';
    router.replace(`${pathname}${query}`);
  }

  async function handleDelete() {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      await userService.delete(deleteTarget.id, token);
      toast.success(`User "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleEditSave() {
    if (!editTarget || !token) return;
    setSaving(true);
    try {
      const res = await userService.update(editTarget.id, { name: editName }, token);
      setUsers((prev) => prev.map((u) => (u.id === editTarget.id ? res.data : u)));
      toast.success('User updated.');
      setEditTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Users"
        subtitle={`${total} registered users total`}
        actions={
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <Users size={13} /> {total} total · {users.length} users on this page
          </div>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-2 max-w-xs">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search users…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] py-2.5 pl-9 pr-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)]/60 focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
          />
        </div>
        <Button size="sm" onClick={handleSearchSubmit}>Search</Button>
        {search && (
          <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); router.replace(pathname); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <DashboardCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {['User', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
                      <AlertCircle size={20} className="text-[var(--color-text-muted)]" />
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {u.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-xs font-bold text-white">
                            {u.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                        )}
                        <span className="font-medium text-[var(--color-text)]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[var(--color-text-muted)]">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        u.role === 'admin'
                          ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                          : 'bg-white/5 text-[var(--color-text-muted)]'
                      }`}>
                        {u.role === 'admin' ? '⚡ Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[var(--color-text-muted)]">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-xs"
                          onClick={() => { setEditTarget(u); setEditName(u.name); }}
                          title="Edit user"
                        >
                          <Pencil size={11} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-xs"
                          onClick={() => setViewTarget(u)}
                          title="View user"
                        >
                          <Eye size={11} />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => setDeleteTarget(u)}
                          title="Delete user"
                        >
                          <Trash2 size={11} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--color-border)] px-5 py-3">
            <p className="text-xs text-[var(--color-text-muted)]">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </DashboardCard>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-[var(--color-text)]">{""}{deleteTarget?.name}{""}</span>?
            All their portfolios will be removed. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="danger" isLoading={deleting} onClick={handleDelete}>Delete User</Button>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Edit user modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit User">
        <div className="space-y-4">
          <Input
            label="Full Name"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
            <p className="text-xs text-[var(--color-text-muted)]">Email</p>
            <p className="text-sm text-[var(--color-text)]">{editTarget?.email}</p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button isLoading={saving} onClick={handleEditSave}>Save Changes</Button>
            <Button variant="ghost" onClick={() => setEditTarget(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* View user modal */}
      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="User Details">
        <div className="space-y-3">
          <Info label="Name" value={viewTarget?.name ?? '-'} />
          <Info label="Email" value={viewTarget?.email ?? '-'} />
          <Info label="Role" value={viewTarget?.role ?? '-'} />
          <Info label="Joined" value={viewTarget ? formatDate(viewTarget.createdAt) : '-'} />
          <Info label="Plan" value={viewTarget?.subscription?.planName ?? 'Free'} />
          <div className="pt-1">
            <Button variant="ghost" onClick={() => setViewTarget(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5">
      <p className="text-[11px] text-[var(--color-text-muted)]">{label}</p>
      <p className="text-sm font-medium text-[var(--color-text)]">{value}</p>
    </div>
  );
}
