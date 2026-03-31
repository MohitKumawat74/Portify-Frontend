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
    api
      .get<ApiResponse<any[]>>('/admin/themes', token)
      .then((res) => ({
        ...res,
        data: (res.data ?? []).map((t: any) => ({
          id: t.id ?? t._id ?? '',
          name: t.name,
          primaryColor: t.primaryColor ?? t.colors?.primaryColor,
          secondaryColor: t.secondaryColor ?? t.colors?.secondaryColor,
          backgroundColor: t.backgroundColor ?? t.colors?.backgroundColor,
          textColor: t.textColor ?? t.colors?.textColor,
          fontFamily: t.fontFamily ?? t.typography?.fontFamily ?? 'Inter, sans-serif',
          isDefault: !!t.isDefault,
        })) as AdminTheme[],
      })),

  createTheme: (payload: CreateThemePayload, token: string) =>
    api.post<ApiResponse<any>>('/admin/themes', payload, token).then((res) => ({
      ...res,
      data: res.data ? {
        id: res.data.id ?? res.data._id ?? '',
        name: res.data.name,
        primaryColor: res.data.primaryColor ?? res.data.colors?.primaryColor,
        secondaryColor: res.data.secondaryColor ?? res.data.colors?.secondaryColor,
        backgroundColor: res.data.backgroundColor ?? res.data.colors?.backgroundColor,
        textColor: res.data.textColor ?? res.data.colors?.textColor,
        fontFamily: res.data.fontFamily ?? res.data.typography?.fontFamily ?? 'Inter, sans-serif',
        isDefault: !!res.data.isDefault,
      } : undefined,
    })),

  updateTheme: (id: string, payload: UpdateThemePayload, token: string) =>
    api.put<ApiResponse<any>>(`/admin/themes/${id}`, payload, token).then((res) => ({
      ...res,
      data: res.data ? {
        id: res.data.id ?? res.data._id ?? '',
        name: res.data.name,
        primaryColor: res.data.primaryColor ?? res.data.colors?.primaryColor,
        secondaryColor: res.data.secondaryColor ?? res.data.colors?.secondaryColor,
        backgroundColor: res.data.backgroundColor ?? res.data.colors?.backgroundColor,
        textColor: res.data.textColor ?? res.data.colors?.textColor,
        fontFamily: res.data.fontFamily ?? res.data.typography?.fontFamily ?? 'Inter, sans-serif',
        isDefault: !!res.data.isDefault,
      } : undefined,
    })),

  deleteTheme: (id: string, token: string) =>
    api.delete<ApiResponse<null>>(`/admin/themes/${id}`, token),
};
