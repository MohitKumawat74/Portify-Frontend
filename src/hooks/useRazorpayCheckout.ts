'use client';

import { useCallback, useMemo, useState } from 'react';
import { paymentService } from '@/services/paymentService';
import type {
  RazorpayCheckoutSuccessResponse,
  RazorpayPaymentFailureResponse,
  RazorpayCheckoutOptions,
} from '@/types/razorpay';

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptLoaderPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only be loaded in the browser.'));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (scriptLoaderPromise) {
    return scriptLoaderPromise;
  }

  scriptLoaderPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay SDK.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK.'));
    document.body.appendChild(script);
  });

  return scriptLoaderPromise;
}

interface StartCheckoutParams {
  token: string;
  planId?: string;
  billingCycle?: 'monthly' | 'annual';
  prefill?: RazorpayCheckoutOptions['prefill'];
  notes?: Record<string, string>;
  onVerified?: () => Promise<void> | void;
  onVerificationFailed?: (error: unknown, payload: RazorpayCheckoutSuccessResponse | null) => void;
  onPaymentFailed?: (error: RazorpayPaymentFailureResponse) => void;
  onDismiss?: () => void;
}

export function useRazorpayCheckout() {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingVerificationPayload, setPendingVerificationPayload] = useState<RazorpayCheckoutSuccessResponse | null>(null);

  const verifyPayload = useCallback(
    async (
      token: string,
      payload: RazorpayCheckoutSuccessResponse,
      onVerified?: () => Promise<void> | void,
      onVerificationFailed?: (error: unknown, retryPayload: RazorpayCheckoutSuccessResponse | null) => void,
    ) => {
      setIsVerifying(true);
      try {
        const verifyResponse = await paymentService.verifyPayment(payload, token);
        if (!verifyResponse.data?.verified) {
          throw new Error('Payment verification failed.');
        }

        setPendingVerificationPayload(null);
        await onVerified?.();
      } catch (error) {
        setPendingVerificationPayload(payload);
        onVerificationFailed?.(error, payload);
      } finally {
        setIsVerifying(false);
      }
    },
    [],
  );

  const startCheckout = useCallback(
    async ({
      token,
      planId = 'plan_pro',
      billingCycle = 'monthly',
      prefill,
      notes,
      onVerified,
      onVerificationFailed,
      onPaymentFailed,
      onDismiss,
    }: StartCheckoutParams) => {
      setIsCreatingOrder(true);
      try {
        await loadRazorpayScript();

        if (!window.Razorpay) {
          throw new Error('Razorpay SDK is unavailable.');
        }

        const orderResponse = await paymentService.createOrder({ planId, billingCycle }, token);
        const order = orderResponse.data?.order;

        if (!order?.id) {
          throw new Error('Could not start checkout. Missing order details.');
        }

        const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? orderResponse.data?.key;
        if (!key) {
          throw new Error('Razorpay key is missing. Set NEXT_PUBLIC_RAZORPAY_KEY.');
        }

        const options: RazorpayCheckoutOptions = {
          key,
          amount: orderResponse.data?.amount ?? order.amount,
          currency: orderResponse.data?.currency ?? order.currency ?? 'INR',
          name: orderResponse.data?.name ?? 'Portify',
          description: orderResponse.data?.description ?? 'Upgrade to Pro Plan',
          order_id: order.id,
          prefill,
          notes,
          theme: { color: '#7c3aed' },
          modal: {
            ondismiss: onDismiss,
          },
          handler: async (response) => {
            await verifyPayload(token, response, onVerified, onVerificationFailed);
          },
        };

        const checkout = new window.Razorpay(options);

        checkout.on('payment.failed', (response) => {
          onPaymentFailed?.(response);
        });

        checkout.open();
      } finally {
        setIsCreatingOrder(false);
      }
    },
    [verifyPayload],
  );

  const retryVerification = useCallback(
    async (token: string, onVerified?: () => Promise<void> | void, onVerificationFailed?: (error: unknown, retryPayload: RazorpayCheckoutSuccessResponse | null) => void) => {
      if (!pendingVerificationPayload) {
        return;
      }

      await verifyPayload(token, pendingVerificationPayload, onVerified, onVerificationFailed);
    },
    [pendingVerificationPayload, verifyPayload],
  );

  const resetRetryState = useCallback(() => {
    setPendingVerificationPayload(null);
  }, []);

  const isLoading = useMemo(() => isCreatingOrder || isVerifying, [isCreatingOrder, isVerifying]);

  return {
    startCheckout,
    retryVerification,
    resetRetryState,
    hasRetryVerification: pendingVerificationPayload !== null,
    isCreatingOrder,
    isVerifying,
    isLoading,
  };
}
