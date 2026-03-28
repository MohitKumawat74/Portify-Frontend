/**
 * Mock data for the USER dashboard preview.
 * Flip `USE_MOCK_DATA = false` in each page to switch to real API calls.
 */

import type { Portfolio, PortfolioAnalytics, User, Template, Plan, Subscription } from '@/types';

// ── Profile ──────────────────────────────────────────────────────────────────
export const MOCK_USER: User = {
  id: 'usr_preview_001',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  role: 'user',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=AlexJ',
  createdAt: '2025-09-15T10:00:00.000Z',
};

// ── Portfolios ────────────────────────────────────────────────────────────────
export const MOCK_PORTFOLIOS: Portfolio[] = [
  {
    id: 'pf_001',
    userId: 'usr_preview_001',
    title: 'Full-Stack Developer',
    slug: 'alex-fullstack',
    templateId: 'template1',
    isPublished: true,
    createdAt: '2025-10-01T09:00:00.000Z',
    updatedAt: '2026-03-10T14:30:00.000Z',
    theme: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#0f0f11',
      textColor: '#f4f4f5',
      fontFamily: 'Inter, sans-serif',
    },
    sections: [],
  },
  {
    id: 'pf_002',
    userId: 'usr_preview_001',
    title: 'UI/UX Portfolio 2026',
    slug: 'alex-ux-2026',
    templateId: 'template2',
    isPublished: true,
    createdAt: '2025-12-20T11:00:00.000Z',
    updatedAt: '2026-03-08T16:00:00.000Z',
    theme: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#38bdf8',
      backgroundColor: '#020617',
      textColor: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
    },
    sections: [],
  },
  {
    id: 'pf_003',
    userId: 'usr_preview_001',
    title: 'Creative Agency Work',
    slug: 'alex-creative',
    templateId: 'template3',
    isPublished: false,
    createdAt: '2026-01-05T08:00:00.000Z',
    updatedAt: '2026-03-11T10:15:00.000Z',
    theme: {
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
      backgroundColor: '#0c0a09',
      textColor: '#fafaf9',
      fontFamily: 'Inter, sans-serif',
    },
    sections: [],
  },
  {
    id: 'pf_004',
    userId: 'usr_preview_001',
    title: 'Open Source Showcase',
    slug: 'alex-opensource',
    templateId: 'template1',
    isPublished: false,
    createdAt: '2026-02-14T12:00:00.000Z',
    updatedAt: '2026-03-09T09:45:00.000Z',
    theme: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      backgroundColor: '#0a0f0d',
      textColor: '#f0fdf4',
      fontFamily: 'Inter, sans-serif',
    },
    sections: [],
  },
];

// ── Analytics (per published portfolio) ─────────────────────────────────────
const generateViewsByDay = (base: number, variance: number) =>
  Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const spike = i === 14 || i === 22 ? 2.4 : 1;
    return {
      date: date.toISOString().split('T')[0],
      views: Math.round((base + Math.random() * variance) * spike),
    };
  });

export const MOCK_PORTFOLIO_ANALYTICS: Record<string, PortfolioAnalytics> = {
  pf_001: {
    portfolioId: 'pf_001',
    totalViews: 3847,
    uniqueVisitors: 2410,
    avgTimeOnPage: 142,
    topCountries: [
      { country: 'United States', views: 1520 },
      { country: 'United Kingdom', views: 640 },
      { country: 'Germany', views: 480 },
      { country: 'Canada', views: 390 },
      { country: 'India', views: 317 },
    ],
    viewsByDay: generateViewsByDay(110, 60),
  },
  pf_002: {
    portfolioId: 'pf_002',
    totalViews: 1923,
    uniqueVisitors: 1140,
    avgTimeOnPage: 198,
    topCountries: [
      { country: 'United States', views: 720 },
      { country: 'France', views: 310 },
      { country: 'Netherlands', views: 240 },
      { country: 'Japan', views: 180 },
      { country: 'Australia', views: 155 },
    ],
    viewsByDay: generateViewsByDay(55, 35),
  },
};

// ── Templates ─────────────────────────────────────────────────────────────────
export const MOCK_TEMPLATES: Template[] = [
  {
    id: 'template1',
    name: 'Minimal',
    description: 'Clean and timeless — lets your work take center stage.',
    thumbnail: '',
    category: 'minimal',
    isPremium: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'template2',
    name: 'Creative',
    description: 'Bold visuals and fluid animations for designers and artists.',
    thumbnail: '',
    category: 'creative',
    isPremium: true,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'template3',
    name: 'Professional',
    description: 'Structured, executive layout for corporate professionals.',
    thumbnail: '',
    category: 'professional',
    isPremium: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

// ── Plans ─────────────────────────────────────────────────────────────────────
export const MOCK_PLANS: Plan[] = [
  {
    id: 'plan_free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    billingPeriod: 'month',
    description: 'Perfect for getting started with your portfolio.',
    features: [
      '1 portfolio',
      '3 free templates',
      'Basic analytics',
      'portify.dev subdomain',
    ],
    isPopular: false,
    isActive: true,
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    price: 12,
    currency: 'USD',
    billingPeriod: 'month',
    description: 'For professionals who need more power and customisation.',
    features: [
      'Unlimited portfolios',
      'All templates (incl. premium)',
      'Advanced analytics',
      'Custom domain',
      'Priority support',
      'Remove Portify branding',
    ],
    isPopular: true,
    isActive: true,
  },
  {
    id: 'plan_team',
    name: 'Team',
    price: 29,
    currency: 'USD',
    billingPeriod: 'month',
    description: 'For teams and agencies managing multiple portfolios.',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Shared team analytics',
      'Shared template library',
      'REST API access',
      'Dedicated support',
    ],
    isPopular: false,
    isActive: true,
  },
];

// ── Current subscription ──────────────────────────────────────────────────────
export const MOCK_SUBSCRIPTION: Subscription = {
  id: 'sub_mock_preview',
  planId: 'plan_free',
  planName: 'Free',
  status: 'active',
  currentPeriodStart: '2026-03-01T00:00:00.000Z',
  currentPeriodEnd: '2026-04-01T00:00:00.000Z',
  cancelAtPeriodEnd: false,
};
