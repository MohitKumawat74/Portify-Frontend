'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
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

function isValidVerifyPayload(payload: RazorpayCheckoutSuccessResponse | null): payload is RazorpayCheckoutSuccessResponse {
  if (!payload) return false;

  const orderId = payload.razorpay_order_id?.trim();
  const paymentId = payload.razorpay_payment_id?.trim();
  const signature = payload.razorpay_signature?.trim();

  return Boolean(orderId && paymentId && signature);
}

function normalizeCheckoutRequest(billingCycle?: 'monthly' | 'annual') {
  return {
    // Backend now validates planId strictly; lock it here to avoid accidental bad payloads.
    planId: 'plan_pro' as const,
    // Backend accepts monthly/month only.
    billingCycle: billingCycle === 'annual' ? 'monthly' : (billingCycle ?? 'monthly'),
  };
}

export function useRazorpayCheckout() {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingVerificationPayload, setPendingVerificationPayload] = useState<RazorpayCheckoutSuccessResponse | null>(null);
  const checkoutInFlightRef = useRef(false);
  const lastVerifiedPaymentIdRef = useRef<string | null>(null);

  const verifyPayload = useCallback(
    async (
      token: string,
      payload: RazorpayCheckoutSuccessResponse,
      onVerified?: () => Promise<void> | void,
      onVerificationFailed?: (error: unknown, retryPayload: RazorpayCheckoutSuccessResponse | null) => void,
    ) => {
      if (!isValidVerifyPayload(payload)) {
        const invalidError = new Error('Invalid payment verification payload from checkout.');
        setPendingVerificationPayload(null);
        onVerificationFailed?.(invalidError, null);
        return;
      }

      if (lastVerifiedPaymentIdRef.current === payload.razorpay_payment_id) {
        // Ignore repeated verification calls for the same payment id.
        return;
      }

      setIsVerifying(true);
      try {
        const verifyResponse = await paymentService.verifyPayment(payload, token);

        // Backend may return different shapes:
        // - ApiResponse<VerifyPaymentResponse> with data.verified === true
        // - Top-level { success: true, message: '...' }
        // - ApiResponse with data.success === true
        const rawVerify = verifyResponse as unknown as Record<string, unknown>;
        const dataField = (rawVerify?.data as Record<string, unknown> | undefined) ?? undefined;

        const verified =
          (dataField && dataField['verified'] === true) ||
          rawVerify['success'] === true ||
          (dataField && dataField['success'] === true) ||
          (typeof rawVerify['message'] === 'string' && /verified/i.test(String(rawVerify['message']))) ||
          (dataField && typeof dataField['message'] === 'string' && /verified/i.test(String(dataField['message'])));

        if (!verified) {
          throw new Error('Payment verification failed.');
        }

        lastVerifiedPaymentIdRef.current = payload.razorpay_payment_id;
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
      billingCycle = 'monthly',
      prefill,
      notes,
      onVerified,
      onVerificationFailed,
      onPaymentFailed,
      onDismiss,
    }: StartCheckoutParams) => {
      if (checkoutInFlightRef.current) {
        return;
      }

      checkoutInFlightRef.current = true;
      setIsCreatingOrder(true);
      try {
        await loadRazorpayScript();

        if (!window.Razorpay) {
          throw new Error('Razorpay SDK is unavailable.');
        }

        const request = normalizeCheckoutRequest(billingCycle);
        const orderResponse = await paymentService.createOrder(
          {
            ...request,
            clientRequestId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          },
          token,
        );

        // Backend may return either { data: { order } } (ApiResponse) or { order } directly.
        const rawResponse = orderResponse as unknown as Record<string, unknown>;
        const payload = (rawResponse?.data as Record<string, unknown> | undefined) ?? rawResponse;
        const order = (payload?.order as Record<string, unknown> | undefined) ?? (rawResponse?.order as Record<string, unknown> | undefined);

        if (!order?.id) {
          throw new Error('Could not start checkout. Missing order details.');
        }

        const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? payload?.key ?? rawResponse?.key;
        if (!key) {
          throw new Error('Razorpay key is missing. Set NEXT_PUBLIC_RAZORPAY_KEY.');
        }

        const options: RazorpayCheckoutOptions = {
          key,
          amount: payload?.amount ?? order.amount,
          currency: payload?.currency ?? order.currency ?? 'INR',
          name: payload?.name ?? 'Portify',
          description: payload?.description ?? 'Upgrade to Pro Plan',
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
      } catch (error) {
        // Surface backend duplicate/constraint failures with a clearer message.
        if (error instanceof Error && /CONFLICT_ERROR|PaymentId already exists|E11000|duplicate key/i.test(error.message)) {
          throw new Error('A previous payment attempt is still pending verification. Please complete verification or try again in a moment.');
        }
        throw error;
      } finally {
        setIsCreatingOrder(false);
        checkoutInFlightRef.current = false;
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
    lastVerifiedPaymentIdRef.current = null;
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
