import { api } from './api';
import type { ApiResponse } from '@/types';
import type { RazorpayCheckoutSuccessResponse } from '@/types/razorpay';

export interface CreateOrderPayload {
  planId: 'plan_pro';
  billingCycle?: 'monthly' | 'month';
  clientRequestId?: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
}

export interface CreateOrderResponse {
  order: RazorpayOrder;
  key?: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  planId?: string;
  planName?: string;
}

export const paymentService = {
  createOrder: (payload: CreateOrderPayload, token: string) =>
    api.post<ApiResponse<CreateOrderResponse>>('/payment/create-order', payload, token),

  verifyPayment: (payload: RazorpayCheckoutSuccessResponse, token: string) =>
    api.post<ApiResponse<VerifyPaymentResponse>>('/payment/verify', payload, token),
};
