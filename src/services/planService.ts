import { api } from './api';
import type { ApiResponse, Plan, Subscription, CheckoutSession } from '@/types';

export interface CheckoutPayload {
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CancelSubscriptionResponse {
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string;
}

export interface UpgradePlanResponse {
  planId: string;
  planName: string;
  status: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
}

export const planService = {
  getPlans: () =>
    api.get<ApiResponse<Plan[]>>('/plans'),

  upgradeToPro: (token: string) =>
    api.post<ApiResponse<UpgradePlanResponse>>('/plan/upgrade', {}, token),

  createCheckout: (payload: CheckoutPayload, token: string) =>
    api.post<ApiResponse<CheckoutSession>>('/subscriptions/checkout', payload, token),

  getCurrentSubscription: (token: string) =>
    api.get<ApiResponse<Subscription>>('/subscriptions/current', token),

  cancelSubscription: (token: string) =>
    api.post<ApiResponse<CancelSubscriptionResponse>>('/subscriptions/cancel', {}, token),
};
