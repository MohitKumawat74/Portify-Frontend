'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { templateService } from '@/services/templateService';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { CardSkeleton } from '@/components/dashboard/Skeleton';
import { toast } from '@/store/toastStore';
import type { Template } from '@/types';
import { PlusCircle, ToggleLeft, ToggleRight, Layout, Trash2, Pencil } from 'lucide-react';

const TEMPLATE_GRADIENTS = [
  'from-violet-600 to-indigo-600',
  'from-blue-600 to-cyan-600',
  'from-slate-700 to-gray-800',
  'from-emerald-600 to-teal-600',
  'from-amber-500 to-orange-500',
  'from-pink-600 to-rose-600',
];

export default function AdminTemplatesPage() {
  const { token } = useAuthStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create/Edit modal
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Template | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    thumbnail: '',
    category: 'minimal',
    isPremium: false,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await templateService.getAll(1, 50);
      setTemplates(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load templates.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  function openAddModal() {
    setForm({ name: '', description: '', thumbnail: '', category: 'minimal', isPremium: false, isActive: true });
    setEditTarget(null);
    setAddOpen(true);
  }

  function openEditModal(t: Template) {
    setForm({
      name: t.name,
      description: t.description,
      thumbnail: t.thumbnail ?? '',
      category: t.category,
      isPremium: t.isPremium,
      isActive: t.isActive,
    });
    setEditTarget(t);
    setAddOpen(true);
  }

  async function handleSave() {
    if (!token || !form.name) return;
    setSaving(true);
    try {
      if (editTarget) {
        const res = await templateService.update(editTarget.id, form, token);
        setTemplates((prev) => prev.map((t) => (t.id === editTarget.id ? res.data : t)));
        toast.success('Template updated.');
      } else {
        const res = await templateService.create(form, token);
        setTemplates((prev) => [...prev, res.data]);
        toast.success('Template created.');
      }
      setAddOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(t: Template) {
    if (!token) return;
    setTogglingId(t.id);
    try {
      const res = await templateService.toggleActive(t.id, token);
      setTemplates((prev) => prev.map((tmpl) => (tmpl.id === t.id ? { ...tmpl, isActive: res.data.isActive } : tmpl)));
      toast.success(`Template "${t.name}" ${res.data.isActive ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle template.');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      await templateService.delete(deleteTarget.id, token);
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success(`Template "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete template.');
    } finally {
      setDeleting(false);
    }
  }

  const activeCount = templates.filter((t) => t.isActive).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Templates"
        subtitle={`${activeCount} active · ${templates.length} total`}
        actions={
          <Button size="sm" className="gap-1.5" onClick={openAddModal}>
            <PlusCircle size={14} /> Add Template
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : templates.length === 0 ? (
        <DashboardCard>
          <div className="py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
              <Layout size={20} className="text-[var(--color-primary)]" />
            </div>
            <p className="mb-1 text-sm font-semibold text-[var(--color-text)]">No templates yet</p>
            <p className="mb-4 text-xs text-[var(--color-text-muted)]">Create the first template to get started.</p>
            <Button size="sm" onClick={openAddModal}>Add Template</Button>
          </div>
        </DashboardCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, i) => {
            const gradient = TEMPLATE_GRADIENTS[i % TEMPLATE_GRADIENTS.length];
            return (
              <div
                key={t.id}
                className={`relative overflow-hidden rounded-2xl border bg-[var(--color-bg-card)] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${
                  t.isActive ? 'border-[var(--color-border)]' : 'border-[var(--color-border)]/50 opacity-60'
                }`}
              >
                <div className={`flex h-28 items-center justify-center bg-gradient-to-br ${gradient} text-4xl`}>
                  {t.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.thumbnail} alt={t.name} className="h-full w-full object-cover" />
                  ) : (
                    <Layout size={36} className="text-white/60" />
                  )}
                </div>

                <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  t.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-[var(--color-text-muted)]'
                }`}>
                  {t.isActive ? '● Active' : '○ Inactive'}
                </span>

                {t.isPremium && (
                  <span className="absolute left-3 top-3 rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
                    Premium
                  </span>
                )}

                <div className="p-4">
                  <h3 className="mb-0.5 text-sm font-semibold text-[var(--color-text)]">{t.name}</h3>
                  <p className="mb-1 text-xs text-[var(--color-text-muted)]">{t.description}</p>
                  <p className="mb-4 text-xs text-[var(--color-text-muted)]">
                    Category: <span className="font-medium text-[var(--color-text)] capitalize">{t.category}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 flex-1 justify-center"
                      onClick={() => openEditModal(t)}
                    >
                      <Pencil size={11} /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={t.isActive ? 'ghost' : 'primary'}
                      className="gap-1 flex-1 justify-center"
                      isLoading={togglingId === t.id}
                      onClick={() => handleToggle(t)}
                    >
                      {t.isActive ? <><ToggleLeft size={13} /> Deactivate</> : <><ToggleRight size={13} /> Activate</>}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => setDeleteTarget(t)}
                      title="Delete template"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title={editTarget ? 'Edit Template' : 'Add New Template'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Template Name"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Minimal Dark"
          />
          <Input
            label="Description"
            fullWidth
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description of the template"
          />
          <Input
            label="Thumbnail URL"
            fullWidth
            value={form.thumbnail}
            onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            placeholder="https://cdn.portify.dev/thumbnails/..."
            hint="Optional preview image URL"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text)]">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/60"
              >
                {['minimal', 'creative', 'professional', 'dark', 'colorful'].map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPremium}
                  onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-text)]">Premium template</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-text)]">Active (visible to users)</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button isLoading={saving} onClick={handleSave}>
              {editTarget ? 'Save Changes' : 'Create Template'}
            </Button>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Template" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-[var(--color-text)]">{""}{deleteTarget?.name}{""}</span>?
            This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="danger" isLoading={deleting} onClick={handleDelete}>Delete Template</Button>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
