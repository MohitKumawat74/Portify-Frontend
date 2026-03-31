'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { Modal } from '@/components/ui/Modal';
import { planService, type CreatePlanPayload, type UpdatePlanPayload } from '@/services/planService';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import type { Plan } from '@/types';
import { Plus, Pencil, Trash2, CreditCard, Loader2 } from 'lucide-react';

type PlanForm = Omit<Plan, 'id'>;

const EMPTY_FORM: PlanForm = {
  name: '',
  price: 0,
  currency: 'INR',
  billingPeriod: 'month',
  description: '',
  features: [],
  isPopular: false,
  isActive: true,
  interval: 'month',
};

export default function AdminPlansPage() {
  const { token } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Plan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [featuresInput, setFeaturesInput] = useState('');
  const [form, setForm] = useState<PlanForm>(EMPTY_FORM);

  useEffect(() => {
    planService
      .getPlans()
      .then((res) => setPlans(res.data ?? []))
      .catch(() => toast.error('Failed to load plans'))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFeaturesInput('');
    setFormOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditTarget(plan);
    setForm({
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      billingPeriod: plan.billingPeriod,
      description: plan.description,
      features: plan.features,
      isPopular: plan.isPopular,
      isActive: plan.isActive,
      interval: plan.interval ?? plan.billingPeriod,
    });
    setFeaturesInput(plan.features.join('\n'));
    setFormOpen(true);
  }

  async function handleSave() {
    if (!token || !form.name.trim()) return;

    const payload: CreatePlanPayload | UpdatePlanPayload = {
      ...form,
      name: form.name.trim(),
      features: featuresInput.split('\n').map((f) => f.trim()).filter(Boolean),
      billingPeriod: form.billingPeriod || 'month',
      interval: form.interval || form.billingPeriod || 'month',
    };

    setSaving(true);
    try {
      if (editTarget) {
        const res = await planService.updatePlan(editTarget.id, payload, token);
        setPlans((prev) => prev.map((p) => (p.id === editTarget.id ? res.data : p)));
        toast.success('Plan updated');
      } else {
        const res = await planService.createPlan(payload as CreatePlanPayload, token);
        setPlans((prev) => [...prev, res.data]);
        toast.success('Plan created');
      }
      setFormOpen(false);
    } catch {
      toast.error('Failed to save plan');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || !token) return;

    setDeletingId(deleteTarget.id);
    try {
      await planService.deletePlan(deleteTarget.id, token);
      setPlans((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Plan deleted');
    } catch {
      toast.error('Failed to delete plan');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Plans"
        subtitle="Create, update, and control pricing plans available on the platform."
        actions={
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus size={14} /> New Plan
          </Button>
        }
      />

      <DashboardCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {['Plan', 'Price', 'Cycle', 'Status', 'Popular', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-6 animate-pulse rounded bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <CreditCard size={26} className="mx-auto mb-2 text-[var(--color-text-muted)]" />
                    <p className="text-sm text-[var(--color-text-muted)]">No plans found</p>
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-[var(--color-text)]">{plan.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{plan.description || 'No description'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[var(--color-text-muted)]">
                      {plan.currency} {plan.price}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--color-text-muted)]">{plan.billingPeriod}</td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${plan.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${plan.isPopular ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'bg-white/5 text-[var(--color-text-muted)]'}`}>
                        {plan.isPopular ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(plan)} title="Edit plan">
                          <Pencil size={12} />
                        </Button>
                        <Button size="sm" variant="ghost" className="hover:bg-red-500/10 hover:text-red-400" onClick={() => setDeleteTarget(plan)} title="Delete plan" disabled={!!deletingId}>
                          {deletingId === plan.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editTarget ? 'Edit Plan' : 'Create Plan'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Plan Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Pro"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Price</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Currency</label>
              <input
                value={form.currency}
                onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Billing Cycle</label>
              <select
                value={form.billingPeriod}
                onChange={(e) => setForm((p) => ({ ...p, billingPeriod: e.target.value, interval: e.target.value }))}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Features (one per line)</label>
            <textarea
              rows={5}
              value={featuresInput}
              onChange={(e) => setFeaturesInput(e.target.value)}
              placeholder={'Unlimited portfolios\nCustom domain\nPriority support'}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              Active plan
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <input
                type="checkbox"
                checked={form.isPopular}
                onChange={(e) => setForm((p) => ({ ...p, isPopular: e.target.checked }))}
              />
              Mark as popular
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saving} disabled={!form.name.trim()}>
              {editTarget ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Plan" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Delete <span className="font-semibold text-[var(--color-text)]">{deleteTarget?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleDelete} isLoading={!!deletingId}>Delete</Button>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
