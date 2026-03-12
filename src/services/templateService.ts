import { api } from './api';
import type { ApiResponse, PaginatedResponse, Template } from '@/types';

export const templateService = {
  getAll: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<Template>>(`/templates?page=${page}&limit=${limit}`),

  getById: (id: string) =>
    api.get<ApiResponse<Template>>(`/templates/${id}`),

  create: (payload: Partial<Template>, token: string) =>
    api.post<ApiResponse<Template>>('/templates', payload, token),

  update: (id: string, payload: Partial<Template>, token: string) =>
    api.put<ApiResponse<Template>>(`/templates/${id}`, payload, token),

  delete: (id: string, token: string) =>
    api.delete<ApiResponse<null>>(`/templates/${id}`, token),

  toggleActive: (id: string, token: string) =>
    api.patch<ApiResponse<Template>>(`/templates/${id}/toggle`, {}, token),
};
