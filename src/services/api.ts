import { API_BASE_URL } from '@/utils/constants';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
  suppressErrorToast?: boolean;
  retryOnUnauthorized?: boolean;
}

class ApiError extends Error {
  status: number;
  errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    token,
    suppressErrorToast = false,
    retryOnUnauthorized = true,
  } = options;

  const authState = useAuthStore.getState();
  const accessToken = token ?? authState.token ?? undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const currentState = useAuthStore.getState();
    if (currentState.refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentState.refreshToken }),
        });
        const refreshData = await refreshResponse.json().catch(() => null) as {
          success?: boolean;
          data?: { token?: string; accessToken?: string; refreshToken?: string };
        } | null;

        const nextToken = refreshData?.data?.token ?? refreshData?.data?.accessToken;
        const nextRefreshToken = refreshData?.data?.refreshToken;

        if (refreshResponse.ok && refreshData?.success && nextToken) {
          currentState.setToken(nextToken);
          if (nextRefreshToken) {
            useAuthStore.setState({ refreshToken: nextRefreshToken });
          }
          return request<T>(endpoint, {
            ...options,
            token: nextToken,
            retryOnUnauthorized: false,
          });
        }
      } catch {
        // ignore refresh failure and continue to logout
      }
    }

    currentState.clearAuth();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' })) as {
      message?: string;
      errorCode?: string;
    };
    const message = errorData.message ?? `HTTP ${response.status}`;

    const isPlanRestriction =
      response.status === 403 &&
      (
        errorData.errorCode === 'PLAN_LIMIT' ||
        errorData.errorCode === 'PLAN_LIMIT_EXCEEDED' ||
        /limit|upgrade|plan|premium/i.test(message)
      );

    if (!suppressErrorToast) {
      toast.error(isPlanRestriction ? 'Upgrade to Pro to continue' : message);
    }
    throw new ApiError(message, response.status, errorData.errorCode);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

async function upload<T>(endpoint: string, formData: FormData, token: string): Promise<T> {
  const authState = useAuthStore.getState();
  const accessToken = token || authState.token;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    const message = errorData.message ?? `HTTP ${response.status}`;
    toast.error(message);
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: 'GET', token }),

  post: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, { method: 'POST', body, token }),

  put: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, { method: 'PUT', body, token }),

  patch: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, { method: 'PATCH', body, token }),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: 'DELETE', token }),

  upload: <T>(endpoint: string, formData: FormData, token: string) =>
    upload<T>(endpoint, formData, token),
};
