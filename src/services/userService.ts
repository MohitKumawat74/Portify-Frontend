import { api } from './api';
import type { ApiResponse, AvatarUploadResponse, ChangePasswordPayload, PaginatedResponse, User } from '@/types';

type UserApiShape = Partial<User> & {
  _id?: string;
};

type UsersListApiResponse =
  | PaginatedResponse<UserApiShape>
  | ApiResponse<PaginatedResponse<UserApiShape>>
  | ApiResponse<UserApiShape[]>
  | {
      data: UserApiShape[];
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
      pagination?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
      };
    };

function normalizeUser(user: UserApiShape): User {
  return {
    id: user.id ?? user._id ?? '',
    name: user.name ?? 'User',
    email: user.email ?? '',
    role: user.role === 'admin' ? 'admin' : 'user',
    createdAt: user.createdAt ?? new Date().toISOString(),
    avatar: user.avatar,
    subscription: user.subscription,
  };
}

function normalizeUsersList(response: UsersListApiResponse): PaginatedResponse<User> {
  const payload = 'success' in response ? response.data : response;

  // Support multiple API shapes:
  // - Array of users
  // - { data: [...] }
  // - { users: [...], pagination: { ... } }
  const dataArray = Array.isArray(payload)
    ? payload
    : payload.data ?? payload.users ?? [];

  const pagination = !Array.isArray(payload) && ('pagination' in payload || 'page' in payload || 'total' in payload)
    ? // prefer explicit pagination object, but fall back to top-level keys
      (payload.pagination ?? { total: payload.total, page: payload.page, limit: payload.limit, totalPages: payload.totalPages })
    : undefined;

  const total = !Array.isArray(payload)
    ? payload.total ?? pagination?.total ?? dataArray.length
    : dataArray.length;

  const page = !Array.isArray(payload)
    ? payload.page ?? pagination?.page ?? 1
    : 1;

  const limit = !Array.isArray(payload)
    ? payload.limit ?? pagination?.limit ?? dataArray.length
    : dataArray.length;

  const totalPages = !Array.isArray(payload)
    ? payload.totalPages ?? pagination?.totalPages ?? 1
    : 1;

  return {
    data: dataArray.map(normalizeUser),
    total,
    page,
    limit,
    totalPages,
  };
}

export const userService = {
  getAll: (token: string, page = 1, limit = 10, search?: string, role?: User['role']) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    return api
      .get<UsersListApiResponse>(`/users?${params.toString()}`, token)
      .then((response) => normalizeUsersList(response));
  },

  getById: (id: string, token: string) =>
    api
      .get<ApiResponse<UserApiShape>>(`/users/${id}`, token)
      .then((response) => ({ ...response, data: normalizeUser(response.data) })),

  update: (id: string, payload: Partial<Pick<User, 'name' | 'avatar'>>, token: string) =>
    api
      .put<ApiResponse<UserApiShape>>(`/users/${id}`, payload, token)
      .then((response) => ({ ...response, data: normalizeUser(response.data) })),

  delete: (id: string, token: string) =>
    api.delete<ApiResponse<null>>(`/users/${id}`, token),

  updateRole: (id: string, role: User['role'], token: string) =>
    api
      .patch<ApiResponse<UserApiShape>>(`/users/${id}/role`, { role }, token)
      .then((response) => ({ ...response, data: normalizeUser(response.data) })),

  changePassword: (id: string, payload: ChangePasswordPayload, token: string) =>
    api.put<ApiResponse<null>>(`/users/${id}/password`, payload, token),

  uploadAvatar: (id: string, formData: FormData, token: string) =>
    api.upload<ApiResponse<AvatarUploadResponse>>(`/users/${id}/avatar`, formData, token),
};
