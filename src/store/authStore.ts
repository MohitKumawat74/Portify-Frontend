import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DashboardPlanStats, User } from '@/types';
import { authService } from '@/services/authService';

// ── Cookie helpers (client-side only) ────────────────────────────────────────
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  planId: string;
  planName: string;
  usageStats: DashboardPlanStats | null;
  setUser: (user: User, token: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<User>) => void;
  setToken: (token: string) => void;
  setPlanUsage: (stats: DashboardPlanStats) => void;
  bootstrapAuth: () => Promise<void>;
  setAuthLoading: (loading: boolean) => void;
}

function getUserPlanMeta(user: User | null): { planId: string; planName: string } {
  const subscription = user?.subscription;
  const planId = subscription?.planId ?? 'plan_free';
  const planName = subscription?.planName ?? (planId === 'plan_free' ? 'Free' : 'Pro');
  return { planId, planName };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isAuthLoading: true,
      planId: 'plan_free',
      planName: 'Free',
      usageStats: null,

      setUser: (user, token, refreshToken) => {
        const planMeta = getUserPlanMeta(user);
        setCookie('auth-token', token);
        setCookie('auth-role', user.role);
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isAuthLoading: false,
          planId: planMeta.planId,
          planName: planMeta.planName,
        });
      },

      clearAuth: () => {
        deleteCookie('auth-token');
        deleteCookie('auth-role');
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isAuthLoading: false,
          planId: 'plan_free',
          planName: 'Free',
          usageStats: null,
        });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setToken: (token) => set({ token }),

      setPlanUsage: (stats) => set({ usageStats: stats, planId: stats.planId, planName: stats.planName }),

      setAuthLoading: (loading) => set({ isAuthLoading: loading }),

      bootstrapAuth: async () => {
        set({ isAuthLoading: true });

        const state = get();
        if (!state.token && !state.refreshToken) {
          deleteCookie('auth-token');
          deleteCookie('auth-role');
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isAuthLoading: false,
            planId: 'plan_free',
            planName: 'Free',
            usageStats: null,
          });
          return;
        }

        try {
          let accessToken = state.token;

          if (!accessToken && state.refreshToken) {
            const refreshRes = await authService.refreshToken(state.refreshToken);
            if (!refreshRes.success) {
              throw new Error('Refresh token invalid');
            }
            accessToken = refreshRes.data.token;
            set({ token: accessToken });
          }

          if (!accessToken) {
            throw new Error('Missing access token');
          }

          const profileRes = await authService.getProfile(accessToken);
          if (!profileRes.success || !profileRes.data) {
            throw new Error('Failed to validate session');
          }

          const planMeta = getUserPlanMeta(profileRes.data);

          setCookie('auth-token', accessToken);
          setCookie('auth-role', profileRes.data.role);
          set({
            user: profileRes.data,
            token: accessToken,
            isAuthenticated: true,
            isAuthLoading: false,
            planId: planMeta.planId,
            planName: planMeta.planName,
          });
        } catch (error) {
          const status = (error as { status?: number } | null)?.status;
          const current = get();

          // Keep an existing local session on transient errors; API calls will still
          // enforce auth and refresh behavior for protected resources.
          if (status !== 401 && current.user && current.token) {
            setCookie('auth-token', current.token);
            setCookie('auth-role', current.user.role);
            set({ isAuthenticated: true, isAuthLoading: false });
            return;
          }

          deleteCookie('auth-token');
          deleteCookie('auth-role');
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isAuthLoading: false,
            planId: 'plan_free',
            planName: 'Free',
            usageStats: null,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        planId: state.planId,
        planName: state.planName,
        usageStats: state.usageStats,
      }),
      // Re-sync cookies after localStorage rehydration (e.g. page reload)
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        state.setAuthLoading(true);

        if (state.isAuthenticated && state.token && state.user) {
          setCookie('auth-token', state.token);
          setCookie('auth-role', state.user.role);
        }
      },
    },
  ),
);
