'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { dashboardService } from '@/services/dashboardService';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/utils/constants';
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgraded?: () => Promise<void> | void;
  redirectOnSuccess?: boolean;
}

export function UpgradeModal({ isOpen, onClose, onUpgraded, redirectOnSuccess = true }: UpgradeModalProps) {
  const router = useRouter();
  const { token, user, setPlanUsage, updateUser } = useAuthStore();
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const {
    startCheckout,
    retryVerification,
    hasRetryVerification,
    isLoading,
    isVerifying,
    resetRetryState,
  } = useRazorpayCheckout();

  const refreshPlanState = async () => {
    if (!token) return;

    const stats = await dashboardService.getStats(token);
    setPlanUsage(stats);
    updateUser({
      subscription: {
        ...(user?.subscription ?? {}),
        planId: stats.planId,
        planName: stats.planName,
      },
    });
  };

  const handleUpgrade = async () => {
    if (!token) {
      toast.error('Please log in to upgrade your plan.');
      return;
    }

    try {
      setVerificationError(null);
      resetRetryState();

      await startCheckout({
        token,
        planId: 'plan_pro',
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        notes: {
          product: 'Portify Pro',
          source: 'upgrade-modal',
        },
        onVerified: async () => {
          await refreshPlanState();
          await onUpgraded?.();
          toast.success('Payment successful. Pro features are now unlocked.');
          onClose();
          if (redirectOnSuccess) {
            router.push(ROUTES.DASHBOARD);
          }
        },
        onVerificationFailed: (error) => {
          const message = error instanceof Error ? error.message : 'Payment verification failed. Please retry.';
          setVerificationError(message);
          toast.error(message);
        },
        onPaymentFailed: (failure) => {
          const message = failure.error?.description ?? 'Payment failed. Please try again.';
          toast.error(message);
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upgrade failed. Please try again.');
    }
  };

  const handleRetryVerification = async () => {
    if (!token) {
      toast.error('Please log in to retry verification.');
      return;
    }

    setVerificationError(null);
    await retryVerification(
      token,
      async () => {
        await refreshPlanState();
        await onUpgraded?.();
        toast.success('Verification completed. Pro features are unlocked.');
        onClose();
        if (redirectOnSuccess) {
          router.push(ROUTES.DASHBOARD);
        }
      },
      (error) => {
        const message = error instanceof Error ? error.message : 'Verification retry failed. Please try again.';
        setVerificationError(message);
        toast.error(message);
      },
    );
  };

  const handleClose = () => {
    setVerificationError(null);
    resetRetryState();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upgrade to Pro" size="sm">
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-[var(--color-text)]">
            <Crown size={16} className="text-amber-400" />
            <p className="text-sm font-semibold">Unlock premium features</p>
          </div>
          <ul className="space-y-1 text-xs text-[var(--color-text-muted)]">
            <li className="flex items-center gap-2"><Sparkles size={12} className="text-[var(--color-primary)]" />Premium templates</li>
            <li className="flex items-center gap-2"><Lock size={12} className="text-[var(--color-primary)]" />Higher portfolio and project limits</li>
            <li className="flex items-center gap-2"><Sparkles size={12} className="text-[var(--color-primary)]" />Advanced customization access</li>
          </ul>
        </div>

        {hasRetryVerification && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
            <p className="text-xs font-medium text-amber-200">
              We received your payment but could not verify it yet.
            </p>
            {verificationError && (
              <p className="mt-1 text-[11px] text-amber-100/80">{verificationError}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryVerification}
              isLoading={isVerifying}
              className="mt-3 w-full border-amber-300/35 text-amber-100 hover:bg-amber-500/20"
            >
              Retry verification
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleUpgrade} isLoading={isLoading} className="gap-1.5">
            <Crown size={13} /> Upgrade Now
          </Button>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Maybe later
          </Button>
        </div>
      </div>
    </Modal>
  );
}
