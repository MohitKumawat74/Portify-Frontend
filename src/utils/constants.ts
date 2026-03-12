export const API_BASE_URL = (() => {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (env) {
    const cleaned = env.replace(/\/+$|\s+$/g, '');
    if (cleaned.endsWith('/api')) return cleaned;
    return `${cleaned}/api`;
  }
  return process.env.NODE_ENV === 'production' ? 'http://localhost:5000/api' : '/api';
})();

export const APP_NAME = 'Portify';

export const DEFAULT_THEME = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  backgroundColor: '#ffffff',
  textColor: '#111827',
  fontFamily: 'Inter, sans-serif',
} as const;

export const TEMPLATE_IDS = ['template1', 'template2', 'template3'] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PORTFOLIOS: '/dashboard/portfolios',
  CREATE_PORTFOLIO: '/dashboard/portfolios/create',
  TEMPLATES: '/dashboard/templates',
  ANALYTICS: '/dashboard/analytics',
  ACCOUNT: '/dashboard/account',
  SETTINGS: '/dashboard/settings',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_TEMPLATES: '/admin/templates',
  ADMIN_THEMES: '/admin/themes',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_PORTFOLIOS: '/admin/portfolios',
  // Public marketing pages
  FEATURES_PAGE: '/features',
  TEMPLATES_PAGE: '/templates',
  PRICING_PAGE: '/pricing',
  ABOUT_PAGE: '/about',
  // Legal pages
  PRIVACY_POLICY: '/privacy',
  TERMS_OF_SERVICE: '/terms',
  COOKIE_POLICY: '/cookies',
} as const;
