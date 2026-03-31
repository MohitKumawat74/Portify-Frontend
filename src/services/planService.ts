import { api } from './api';
import type { ApiResponse, Plan, Subscription, CheckoutSession } from '@/types';

type PlanApiShape = Partial<Plan> & {
  _id?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  interval?: string;
};

type SubscriptionApiShape = Partial<Subscription> & {
  _id?: string;
  plan?: {
    id?: string;
    _id?: string;
    name?: string;
  };
};

function normalizePlan(plan: PlanApiShape): Plan {
  return {
    ...plan,
    id: plan.id ?? plan._id ?? '',
    name: plan.name ?? 'Plan',
    price: plan.price ?? plan.monthlyPrice ?? 0,
    currency: plan.currency ?? 'USD',
    billingPeriod: plan.billingPeriod ?? plan.interval ?? 'month',
    description: plan.description ?? '',
    features: plan.features ?? [],
    isPopular: Boolean(plan.isPopular),
    isActive: plan.isActive ?? true,
    interval: plan.interval,
  };
}

function normalizeSubscription(subscription: SubscriptionApiShape): Subscription {
  return {
    id: subscription.id ?? subscription._id ?? '',
    planId: subscription.planId ?? subscription.plan?.id ?? subscription.plan?._id ?? 'plan_free',
    planName: subscription.planName ?? subscription.plan?.name ?? 'Free',
    status: subscription.status ?? 'inactive',
    currentPeriodStart: subscription.currentPeriodStart ?? '',
    currentPeriodEnd: subscription.currentPeriodEnd ?? '',
    cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
  };
}

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

export type CreatePlanPayload = Omit<Plan, 'id'>;
export type UpdatePlanPayload = Partial<Omit<Plan, 'id'>>;

export const planService = {
  getPlans: () =>
    api
      .get<ApiResponse<PlanApiShape[]>>('/plans')
      .then((response) => ({
        ...response,
        data: (response.data ?? []).map(normalizePlan),
      })),

  createPlan: (payload: CreatePlanPayload, token: string) =>
    api
      .post<ApiResponse<PlanApiShape>>('/plans', payload, token)
      .then((response) => ({
        ...response,
        data: normalizePlan(response.data),
      })),

  updatePlan: (id: string, payload: UpdatePlanPayload, token: string) =>
    api
      .put<ApiResponse<PlanApiShape>>(`/plans/${id}`, payload, token)
      .then((response) => ({
        ...response,
        data: normalizePlan(response.data),
      })),

  deletePlan: (id: string, token: string) =>
    api.delete<ApiResponse<null>>(`/plans/${id}`, token),

  upgradeToPro: (token: string) =>
    api.post<ApiResponse<UpgradePlanResponse>>('/plan/upgrade', {}, token),

  createCheckout: (payload: CheckoutPayload, token: string) =>
    api.post<ApiResponse<CheckoutSession>>('/subscriptions/checkout', payload, token),

  getCurrentSubscription: (token: string) =>
    api
      .get<ApiResponse<SubscriptionApiShape>>('/subscriptions/current', token)
      .then((response) => ({
        ...response,
        data: normalizeSubscription(response.data),
      })),

  cancelSubscription: (token: string) =>
    api.post<ApiResponse<CancelSubscriptionResponse>>('/subscriptions/cancel', {}, token),
};
