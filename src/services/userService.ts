import { api } from './api';
import type { ApiResponse, AvatarUploadResponse, ChangePasswordPayload, PaginatedResponse, User } from '@/types';

export const userService = {
  getAll: (token: string, page = 1, limit = 10, search?: string, role?: User['role']) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    return api.get<PaginatedResponse<User>>(`/users?${params.toString()}`, token);
  },

  getById: (id: string, token: string) =>
    api.get<ApiResponse<User>>(`/users/${id}`, token),

  update: (id: string, payload: Partial<Pick<User, 'name' | 'avatar'>>, token: string) =>
    api.put<ApiResponse<User>>(`/users/${id}`, payload, token),

  delete: (id: string, token: string) =>
    api.delete<ApiResponse<null>>(`/users/${id}`, token),

  updateRole: (id: string, role: User['role'], token: string) =>
    api.patch<ApiResponse<User>>(`/users/${id}/role`, { role }, token),

  changePassword: (id: string, payload: ChangePasswordPayload, token: string) =>
    api.put<ApiResponse<null>>(`/users/${id}/password`, payload, token),

  uploadAvatar: (id: string, formData: FormData, token: string) =>
    api.upload<ApiResponse<AvatarUploadResponse>>(`/users/${id}/avatar`, formData, token),
};
