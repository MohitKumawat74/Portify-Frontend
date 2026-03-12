import { api } from './api';
import type { ApiResponse, PaginatedResponse, Portfolio, PortfolioAnalytics, Theme } from '@/types';

export interface CreatePortfolioPayload {
  title: string;
  templateId: string;
  theme?: Partial<Theme>;
}

export const portfolioService = {
  getAll: (token: string, page = 1, limit = 10) =>
    api.get<PaginatedResponse<Portfolio>>(
      `/portfolios?page=${page}&limit=${limit}`,
      token,
    ),

  getById: (id: string, token: string) =>
    api.get<ApiResponse<Portfolio>>(`/portfolios/${id}`, token),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<Portfolio>>(`/portfolios/public/${slug}`),

  create: (payload: CreatePortfolioPayload, token: string) =>
    api.post<ApiResponse<Portfolio>>('/portfolios', payload, token),

  update: (id: string, payload: Partial<Portfolio>, token: string) =>
    api.put<ApiResponse<Portfolio>>(`/portfolios/${id}`, payload, token),

  delete: (id: string, token: string) =>
    api.delete<ApiResponse<null>>(`/portfolios/${id}`, token),

  publish: (id: string, token: string) =>
    api.patch<ApiResponse<Portfolio>>(`/portfolios/${id}/publish`, {}, token),

  unpublish: (id: string, token: string) =>
    api.patch<ApiResponse<Portfolio>>(`/portfolios/${id}/unpublish`, {}, token),

  getAnalytics: (id: string, token: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<ApiResponse<PortfolioAnalytics>>(`/portfolios/${id}/analytics${query}`, token);
  },
};
