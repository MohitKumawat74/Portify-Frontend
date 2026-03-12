'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PageHeader, DashboardCard } from '@/components/dashboard/DashboardCard';
import { Modal } from '@/components/ui/Modal';
import { adminService } from '@/services/adminService';
import type { CreateThemePayload } from '@/services/adminService';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import type { AdminTheme } from '@/types';
import { Palette, Plus, Trash2, Pencil, Loader2 } from 'lucide-react';

const FONT_OPTIONS = [
  'Inter, sans-serif',
  'Georgia, serif',
  "'Playfair Display', serif",
  "'Helvetica Neue', sans-serif",
  "'Roboto', sans-serif",
  "'Source Code Pro', monospace",
];

type ThemeForm = Omit<AdminTheme, 'id' | 'isDefault'>;

const EMPTY_FORM: ThemeForm = {
  name: '',
  primaryColor: '#7c3aed',
  secondaryColor: '#0ea5e9',
  backgroundColor: '#0f172a',
  textColor: '#f8fafc',
  fontFamily: 'Inter, sans-serif',
};

const COLOR_FIELDS: Array<[keyof ThemeForm, string]> = [
  ['primaryColor', 'Primary Color'],
  ['secondaryColor', 'Secondary Color'],
  ['backgroundColor', 'Background Color'],
  ['textColor', 'Text Color'],
];

export default function AdminThemesPage() {
  const { token } = useAuthStore();
  const [themes, setThemes] = useState<AdminTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminTheme | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminTheme | null>(null);
  const [form, setForm] = useState<ThemeForm>(EMPTY_FORM);

  useEffect(() => {
    if (!token) return;
    adminService
      .getThemes(token)
      .then((res) => { if (res.data) setThemes(res.data); })
      .catch(() => toast.error('Failed to load themes'))
      .finally(() => setLoading(false));
  }, [token]);

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(theme: AdminTheme) {
    setEditTarget(theme);
    setForm({
      name: theme.name,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      fontFamily: theme.fontFamily,
    });
    setFormOpen(true);
  }

  async function handleSave() {
    if (!token || !form.name.trim()) return;
    setSaving(true);
    try {
      if (editTarget) {
        const res = await adminService.updateTheme(editTarget.id, form, token);
        if (res.data) {
          setThemes((prev) => prev.map((t) => (t.id === editTarget.id ? res.data! : t)));
          toast.success('Theme updated');
        }
      } else {
        const res = await adminService.createTheme(form as CreateThemePayload, token);
        if (res.data) {
          setThemes((prev) => [...prev, res.data!]);
          toast.success('Theme created');
        }
      }
      setFormOpen(false);
    } catch {
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || !token) return;
    setDeletingId(deleteTarget.id);
    try {
      await adminService.deleteTheme(deleteTarget.id, token);
      setThemes((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success('Theme deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete theme');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Themes"
        subtitle="Platform-wide colour presets available to users when building portfolios."
        actions={
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus size={14} /> New Theme
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-60 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]" />
          ))}
        </div>
      ) : themes.length === 0 ? (
        <DashboardCard title="">
          <div className="py-12 text-center">
            <Palette size={40} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
            <p className="text-sm text-[var(--color-text-muted)]">No themes yet. Create the first one.</p>
          </div>
        </DashboardCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {themes.map((t) => (
            <div
              key={t.id}
              className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            >
              <div className="h-16 w-full" style={{ backgroundColor: t.primaryColor }} />
              <div className="flex h-6 border-t border-[var(--color-border)]">
                {[t.secondaryColor, t.backgroundColor, t.textColor].map((c) => (
                  <div key={c} className="flex-1" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="p-4">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">{t.name}</h3>
                  {t.isDefault && (
                    <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-400">
                      Default
                    </span>
                  )}
                </div>
                <p className="mb-3 text-xs text-[var(--color-text-muted)]" style={{ fontFamily: t.fontFamily }}>
                  {t.fontFamily.split(',')[0]}
                </p>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {[t.primaryColor, t.secondaryColor].map((c) => (
                    <span
                      key={c}
                      className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-mono text-[var(--color-text-muted)]"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
                      {c}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 justify-center gap-1" onClick={() => openEdit(t)}>
                    <Pencil size={11} /> Edit
                  </Button>
                  {!t.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => setDeleteTarget(t)}
                      disabled={!!deletingId}
                      title="Delete theme"
                    >
                      {deletingId === t.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editTarget ? 'Edit Theme' : 'Create Theme'}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Theme Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Ocean Blue"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {COLOR_FIELDS.map(([key, label]) => (
              <div key={key}>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">{label}</label>
                <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                  <input
                    type="color"
                    value={form[key] as string}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="h-5 w-5 cursor-pointer rounded border-none bg-transparent p-0 outline-none"
                  />
                  <span className="flex-1 font-mono text-xs text-[var(--color-text)]">{form[key] as string}</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Font Family</label>
            <select
              value={form.fontFamily}
              onChange={(e) => setForm((p) => ({ ...p, fontFamily: e.target.value }))}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f.split(',')[0]}</option>
              ))}
            </select>
          </div>

          {/* Live preview */}
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
            <div className="h-10 w-full" style={{ backgroundColor: form.primaryColor }} />
            <div className="flex h-4">
              <div className="flex-1" style={{ backgroundColor: form.secondaryColor }} />
              <div className="flex-1" style={{ backgroundColor: form.backgroundColor }} />
              <div className="flex-1" style={{ backgroundColor: form.textColor }} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="gap-2">
              {saving && <Loader2 size={13} className="animate-spin" />}
              {editTarget ? 'Save Changes' : 'Create Theme'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Theme">
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-[var(--color-text)]">{deleteTarget?.name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={!!deletingId} className="gap-2">
            {deletingId && <Loader2 size={13} className="animate-spin" />}
            Delete Theme
          </Button>
        </div>
      </Modal>
    </div>
  );
}
