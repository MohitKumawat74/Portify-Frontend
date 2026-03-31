import { api } from './api';
import type { ApiResponse, User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface AuthResponseWire {
  user: User;
  token?: string;
  accessToken?: string;
  refreshToken: string;
}

interface RefreshResponseWire {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

interface RefreshResponse {
  token: string;
  refreshToken?: string;
  user?: User;
}

type AuthUserWire = Partial<User> & { _id?: string };

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

function resolveToken(data: { token?: string; accessToken?: string }): string {
  return data.token ?? data.accessToken ?? '';
}

function normalizeAuthUser(user: AuthUserWire): User {
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

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await api.post<ApiResponse<AuthResponseWire & { user: AuthUserWire }>>('/auth/login', payload);
    if (!response.success || !response.data) {
      return response as ApiResponse<AuthResponse>;
    }

    return {
      ...response,
      data: {
        user: normalizeAuthUser(response.data.user),
        token: resolveToken(response.data),
        refreshToken: response.data.refreshToken,
      },
    };
  },

  register: async (payload: RegisterPayload) => {
    const response = await api.post<ApiResponse<AuthResponseWire & { user: AuthUserWire }>>('/auth/register', payload);
    if (!response.success || !response.data) {
      return response as ApiResponse<AuthResponse>;
    }

    return {
      ...response,
      data: {
        user: normalizeAuthUser(response.data.user),
        token: resolveToken(response.data),
        refreshToken: response.data.refreshToken,
      },
    };
  },

  logout: (token: string, refreshToken: string) =>
    api.post<ApiResponse<null>>('/auth/logout', { refreshToken }, token),

  getProfile: async (token: string) => {
    const response = await api.get<ApiResponse<AuthUserWire>>('/auth/profile', token);
    if (!response.success || !response.data) {
      return response as ApiResponse<User>;
    }

    return {
      ...response,
      data: normalizeAuthUser(response.data),
    };
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<RefreshResponseWire & { user?: AuthUserWire }>>('/auth/refresh', { refreshToken });
    if (!response.success || !response.data) {
      return response as ApiResponse<RefreshResponse>;
    }

    return {
      ...response,
      data: {
        token: resolveToken(response.data),
        refreshToken: response.data.refreshToken,
        user: response.data.user ? normalizeAuthUser(response.data.user) : undefined,
      },
    };
  },

  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post<ApiResponse<null>>('/auth/reset-password', payload),
};
