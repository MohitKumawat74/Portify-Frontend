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

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', payload),

  logout: (token: string, refreshToken: string) =>
    api.post<ApiResponse<null>>('/auth/logout', { refreshToken }, token),

  getProfile: (token: string) =>
    api.get<ApiResponse<User>>('/auth/profile', token),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<{ token: string }>>('/auth/refresh', { refreshToken }),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post<ApiResponse<null>>('/auth/reset-password', payload),
};
