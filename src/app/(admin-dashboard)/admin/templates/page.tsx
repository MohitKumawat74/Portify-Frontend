'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { templateService } from '@/services/templateService';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { CardSkeleton } from '@/components/dashboard/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/store/toastStore';
import type { Template } from '@/types';
import { cn } from '@/utils/cn';
import { PlusCircle, ToggleLeft, ToggleRight, Layout, Trash2, Pencil, Eye, Check, ChevronRight, Sparkles } from 'lucide-react';

const TEMPLATE_GRADIENTS = [
  'from-violet-600 to-indigo-600',
  'from-blue-600 to-cyan-600',
  'from-slate-700 to-gray-800',
  'from-emerald-600 to-teal-600',
  'from-amber-500 to-orange-500',
  'from-pink-600 to-rose-600',
];

const TEMPLATE_LAYOUT_PRESETS = [
  {
    id: 'minimal',
    name: 'Template 1',
    subtitle: 'Minimal clean layout',
    category: 'minimal',
    gradient: 'from-violet-600 to-indigo-600',
  },
  {
    id: 'creative',
    name: 'Template 2',
    subtitle: 'Creative storytelling',
    category: 'creative',
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'professional',
    name: 'Template 3',
    subtitle: 'Professional business layout',
    category: 'professional',
    gradient: 'from-slate-700 to-gray-800',
  },
  {
    id: 'immersive',
    name: 'Template 4',
    subtitle: 'Immersive visual-first layout',
    category: 'immersive',
    gradient: 'from-emerald-600 to-teal-600',
  },
] as const;

function resolveTemplatePreviewKey(template: Template): 'template1' | 'template2' | 'template3' | 'template4' {
  const id = template.id.toLowerCase();
  const name = template.name.toLowerCase();
  const category = (template.category || '').toLowerCase();

  if (id === 'template1' || id === 'template2' || id === 'template3' || id === 'template4') {
    return id;
  }
  if (/3d|immersive|interactive/.test(name) || /3d|immersive|interactive/.test(category)) {
    return 'template4';
  }
  if (/creative|agency|photographer|saas/.test(name) || /creative|agency|photographer|saas/.test(category)) {
    return 'template2';
  }
  if (/professional|classic|corporate/.test(name) || /professional|corporate/.test(category)) {
    return 'template3';
  }
  return 'template1';
}

export default function AdminTemplatesPage() {
  const searchParams = useSearchParams();
  const { token } = useAuthStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create/Edit modal
  const [addOpen, setAddOpen] = useState(false);
  const [templateStep, setTemplateStep] = useState<1 | 2 | 3>(1);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('minimal');
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
  const searchQuery = searchParams.get('search')?.trim().toLowerCase() ?? '';

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
    setTemplateStep(1);
    setSelectedPresetId('minimal');
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
    setTemplateStep(2);
    setSelectedPresetId(t.category || 'minimal');
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
  const selectedPreset = TEMPLATE_LAYOUT_PRESETS.find((preset) => preset.id === selectedPresetId) ?? TEMPLATE_LAYOUT_PRESETS[0];
  const checks = [
    { label: 'Template layout selected', ok: Boolean(selectedPresetId) },
    { label: 'Template name added', ok: form.name.trim().length > 0 },
    { label: 'Description added', ok: form.description.trim().length > 0 },
    { label: 'Category selected', ok: form.category.trim().length > 0 },
  ];
  const filteredTemplates = searchQuery
    ? templates.filter((t) =>
      `${t.name} ${t.description} ${t.category}`.toLowerCase().includes(searchQuery),
    )
    : templates;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Templates"
        subtitle={`${activeCount} active · ${filteredTemplates.length} shown · ${templates.length} total`}
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
      ) : filteredTemplates.length === 0 ? (
        <DashboardCard>
          <EmptyState
            icon={Layout}
            title={searchQuery ? 'No templates found' : 'No templates yet'}
            description={searchQuery ? 'Try a different search term.' : 'Create the first template to get started.'}
            ctaLabel="Add Template"
            onCtaClick={openAddModal}
            className="py-14"
          />
        </DashboardCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((t, i) => {
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
                    <Link href={`/preview/${resolveTemplatePreviewKey(t)}?source=${encodeURIComponent(t.id)}`} className="flex-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 w-full justify-center"
                      >
                        <Eye size={12} /> Preview
                      </Button>
                    </Link>
                    <Link href={`/admin/templates/builder?templateId=${encodeURIComponent(t.id)}`} className="flex-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 w-full justify-center"
                      >
                        <Sparkles size={12} /> Builder
                      </Button>
                    </Link>
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
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { step: 1, label: 'Choose Layout' },
              { step: 2, label: 'Add Content' },
              { step: 3, label: 'Review/Publish' },
            ].map((item) => (
              <button
                key={item.step}
                type="button"
                onClick={() => {
                  if (item.step === 1 || templateStep >= item.step) setTemplateStep(item.step as 1 | 2 | 3);
                }}
                className={cn(
                  'rounded-xl border px-3 py-2 text-left text-xs transition-colors',
                  templateStep === item.step
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                    : templateStep > item.step
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)]',
                )}
              >
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px]">
                    {templateStep > item.step ? <Check size={10} /> : item.step}
                  </span>
                  <span>Step {item.step}</span>
                </div>
                <p className="font-medium">{item.label}</p>
              </button>
            ))}
          </div>

          {templateStep === 1 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Choose a Template Layout</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {TEMPLATE_LAYOUT_PRESETS.map((preset) => {
                  const active = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        setForm((prev) => ({ ...prev, category: preset.category }));
                      }}
                      className={cn(
                        'overflow-hidden rounded-xl border text-left transition-all',
                        active
                          ? 'border-[var(--color-primary)] shadow-[0_0_0_2px_rgba(124,58,237,0.2)]'
                          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/40',
                      )}
                    >
                      <div className={cn('h-20 bg-gradient-to-br', preset.gradient)} />
                      <div className="p-3">
                        <p className="text-xs font-semibold text-[var(--color-text)]">{preset.name}</p>
                        <p className="text-[11px] text-[var(--color-text-muted)]">{preset.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {templateStep === 2 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                <p className="text-xs text-[var(--color-text-muted)]">Template content setup</p>
                <button type="button" className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/15 px-2 py-1 text-[11px] font-semibold text-[var(--color-primary)]">
                  <Sparkles size={12} /> Use AI Assistant
                </button>
              </div>
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
                    {['minimal', 'creative', 'professional', 'immersive', 'dark', 'colorful'].map((c) => (
                      <option key={c} value={c} className="capitalize">{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isPremium}
                      onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
                      className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                    />
                    <span className="text-sm text-[var(--color-text)]">Premium template</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
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
            </div>
          ) : null}

          {templateStep === 3 ? (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Review Required Fields</h4>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {checks.map((check) => (
                    <p key={check.label} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                      <span className={cn('inline-flex h-4 w-4 items-center justify-center rounded-sm text-white', check.ok ? 'bg-emerald-500' : 'bg-rose-500/75')}>
                        <Check size={11} />
                      </span>
                      {check.label}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                <p className="text-xs text-[var(--color-text-muted)]">Selected layout</p>
                <div className={cn('mt-2 h-24 rounded-lg bg-gradient-to-br', selectedPreset.gradient)} />
                <p className="mt-2 text-xs font-semibold text-[var(--color-text)]">{selectedPreset.name}</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">{selectedPreset.subtitle}</p>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2 pt-1">
            <div>
              {templateStep > 1 ? (
                <Button variant="ghost" onClick={() => setTemplateStep((templateStep - 1) as 1 | 2 | 3)}>
                  Previous
                </Button>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
              {templateStep < 3 ? (
                <Button
                  onClick={() => setTemplateStep((templateStep + 1) as 1 | 2 | 3)}
                  disabled={templateStep === 2 && (!form.name.trim() || !form.description.trim())}
                  className="gap-1"
                >
                  Next <ChevronRight size={14} />
                </Button>
              ) : (
                <Button isLoading={saving} onClick={handleSave} disabled={!form.name.trim() || !form.description.trim()}>
                  {editTarget ? 'Save Changes' : 'Publish Template'}
                </Button>
              )}
            </div>
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
