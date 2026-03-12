'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import type { LoginPayload, RegisterPayload, ForgotPasswordPayload, ResetPasswordPayload } from '@/services/authService';
import { ROUTES } from '@/utils/constants';

export function useAuth() {
  const router = useRouter();
  const { user, token, refreshToken, isAuthenticated, setUser, clearAuth, updateUser, setToken } =
    useAuthStore();

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authService.login(payload);
      if (response.success) {
        setUser(response.data.user, response.data.token, response.data.refreshToken);
        router.push(
          response.data.user.role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD,
        );
      }
      return response;
    },
    [setUser, router],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await authService.register(payload);
      if (response.success) {
        setUser(response.data.user, response.data.token, response.data.refreshToken);
        router.push(ROUTES.DASHBOARD);
      }
      return response;
    },
    [setUser, router],
  );

  const logout = useCallback(async () => {
    if (token && refreshToken) {
      await authService.logout(token, refreshToken).catch(() => {});
    }
    clearAuth();
    router.push(ROUTES.LOGIN);
  }, [token, refreshToken, clearAuth, router]);

  const forgotPassword = useCallback(
    async (payload: ForgotPasswordPayload) => {
      return authService.forgotPassword(payload);
    },
    [],
  );

  const resetPassword = useCallback(
    async (payload: ResetPasswordPayload) => {
      return authService.resetPassword(payload);
    },
    [],
  );

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return null;
    const response = await authService.refreshToken(refreshToken);
    if (response.success) {
      setToken(response.data.token);
      return response.data.token;
    }
    return null;
  }, [refreshToken, setToken]);

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
    refreshAccessToken,
  };
}
