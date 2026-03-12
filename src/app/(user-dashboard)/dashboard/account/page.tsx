'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { planService } from '@/services/planService';
import { Button } from '@/components/ui/Button';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { StatCardSkeleton, Skeleton } from '@/components/dashboard/Skeleton';
import { toast } from '@/store/toastStore';
import type { Plan, Subscription } from '@/types';
import {
  CreditCard, CheckCircle2, Sparkles, Calendar, AlertCircle,
  ExternalLink, Crown, Zap, Users, ArrowRight,
} from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/cn';

export default function AccountPage() {
  const { token } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    planService.getPlans()
      .then((res) => setPlans(res.data))
      .catch(() => {})
      .finally(() => setPlansLoading(false));

    if (token) {
      planService.getCurrentSubscription(token)
        .then((res) => setSubscription(res.data))
        .catch(() => setSubscription(null))
        .finally(() => setSubLoading(false));
    } else {
      setSubLoading(false);
    }
  }, [token]);

  async function handleCheckout(planId: string) {
    if (!token) return;
    setCheckingOut(planId);
    try {
      const res = await planService.createCheckout(
        {
          planId,
          successUrl: `${window.location.origin}${ROUTES.ACCOUNT}?upgrade=success`,
          cancelUrl: `${window.location.origin}${ROUTES.ACCOUNT}`,
        },
        token,
      );
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setCheckingOut(null);
    }
  }

  async function handleCancel() {
    if (!token) return;
    setCancelling(true);
    try {
      await planService.cancelSubscription(token);
      toast.success('Subscription will cancel at end of billing period.');
      setSubscription((prev) => prev ? { ...prev, cancelAtPeriodEnd: true } : prev);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  }

  const currentPlanId = subscription?.planId ?? 'plan_free';
  const activePlans = plans.filter((p) => p.isActive);

  const planIcon = (planId: string) => {
    if (planId === 'plan_free') return <Zap size={16} />;
    if (planId === 'plan_pro') return <Crown size={16} />;
    return <Users size={16} />;
  };

  const planGradient = (planId: string) => {
    if (planId === 'plan_free') return 'from-slate-500 to-gray-500';
    if (planId === 'plan_pro') return 'from-violet-600 to-purple-600';
    return 'from-blue-600 to-cyan-600';
  };

  return (
    <div className="space-y-6 max-w-4xl pb-8">
      <PageHeader
        title="Account & Billing"
        subtitle="Manage your subscription plan and billing details."
      />

      {/* Current Subscription */}
      <DashboardCard
        title="Current Subscription"
        subtitle="Your active plan details"
        actions={<CreditCard size={16} className="text-[var(--color-text-muted)]" />}
      >
        {subLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : subscription ? (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                planGradient(subscription.planId),
              )}>
                {planIcon(subscription.planId)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-bold text-[var(--color-text)]">{subscription.planName}</span>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    subscription.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-amber-500/15 text-amber-400',
                  )}>
                    {subscription.status}
                  </span>
                  {subscription.cancelAtPeriodEnd && (
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                      Cancelling
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    Started {formatDate(subscription.currentPeriodStart)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {subscription.cancelAtPeriodEnd
                      ? `Cancels ${formatDate(subscription.currentPeriodEnd)}`
                      : `Renews ${formatDate(subscription.currentPeriodEnd)}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {subscription.cancelAtPeriodEnd ? (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-400">
                  <AlertCircle size={13} />
                  Cancellation scheduled
                </div>
              ) : subscription.planId !== 'plan_free' ? (
                <Button variant="outline" size="sm" isLoading={cancelling} onClick={handleCancel}>
                  Cancel Plan
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 text-white">
              <Zap size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">Free Plan</p>
              <p className="text-xs text-[var(--color-text-muted)]">Upgrade below to unlock premium features.</p>
            </div>
          </div>
        )}
      </DashboardCard>

      {/* Available Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Available Plans</h2>
          {currentPlanId !== 'plan_free' && (
            <span className="text-xs text-[var(--color-text-muted)]">Upgrade or downgrade at any time</span>
          )}
        </div>

        {plansLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {activePlans.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const isUpgrade = !isCurrent && plan.price > 0;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'relative overflow-hidden rounded-2xl border p-5 transition-all duration-200',
                    plan.isPopular
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-[0_0_0_1px_rgba(124,58,237,0.2)]'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-card)]',
                    isCurrent && 'ring-2 ring-emerald-500/30',
                  )}
                >
                  {plan.isPopular && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
                      <Sparkles size={9} /> Popular
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <CheckCircle2 size={9} /> Current
                    </span>
                  )}

                  {/* Plan icon */}
                  <div className={cn(
                    'mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                    planGradient(plan.id),
                    (plan.isPopular || isCurrent) && 'mt-5',
                  )}>
                    {planIcon(plan.id)}
                  </div>

                  <h3 className="mb-0.5 text-base font-bold text-[var(--color-text)]">{plan.name}</h3>
                  <p className="mb-3 text-xs text-[var(--color-text-muted)] leading-relaxed">{plan.description}</p>

                  <div className="mb-4 flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-[var(--color-text)]">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="mb-1 text-xs text-[var(--color-text-muted)]">/{plan.billingPeriod}</span>
                    )}
                  </div>

                  <ul className="mb-5 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
                        <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="outline" size="sm" fullWidth disabled className="opacity-60">
                      Current Plan
                    </Button>
                  ) : plan.price === 0 ? (
                    <Button variant="ghost" size="sm" fullWidth disabled>
                      Free Plan
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      fullWidth
                      isLoading={checkingOut === plan.id}
                      onClick={() => handleCheckout(plan.id)}
                      className="gap-1.5"
                    >
                      <ExternalLink size={13} />
                      {isUpgrade ? 'Upgrade' : 'Switch'} to {plan.name}
                      <ArrowRight size={13} />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Billing note */}
      <DashboardCard>
        <div className="flex items-start gap-3">
          <CreditCard size={16} className="mt-0.5 shrink-0 text-[var(--color-text-muted)]" />
          <div className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            <p>Payments are processed securely via <strong className="text-[var(--color-text)]">Stripe</strong>. You can cancel your subscription at any time.</p>
            <p className="mt-1">
              Questions?{' '}
              <a href="mailto:support@portify.dev" className="text-[var(--color-primary)] hover:underline">
                support@portify.dev
              </a>
            </p>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
