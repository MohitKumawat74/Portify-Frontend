import { api } from './api';
import type { AdminTheme, Analytics, ApiResponse, UserAnalytics } from '@/types';

export type CreateThemePayload = Omit<AdminTheme, 'id' | 'isDefault'>;
export type UpdateThemePayload = Partial<Omit<AdminTheme, 'id'>>;

export const adminService = {
  getAnalytics: (token: string) =>
    api.get<ApiResponse<Analytics>>('/admin/analytics', token),

  getUserAnalytics: (token: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<ApiResponse<UserAnalytics>>(`/admin/analytics/users${query}`, token);
  },

  getThemes: (token: string) =>
    api.get<ApiResponse<AdminTheme[]>>('/admin/themes', token),

  createTheme: (payload: CreateThemePayload, token: string) =>
    api.post<ApiResponse<AdminTheme>>('/admin/themes', payload, token),

  updateTheme: (id: string, payload: UpdateThemePayload, token: string) =>
    api.put<ApiResponse<AdminTheme>>(`/admin/themes/${id}`, payload, token),

  deleteTheme: (id: string, token: string) =>
    api.delete<ApiResponse<null>>(`/admin/themes/${id}`, token),
};
