/**
 * Mock data for the ADMIN dashboard preview.
 * Flip `USE_MOCK_DATA = false` in each admin page to switch to real API calls.
 */

import type { Analytics, User, Portfolio } from '@/types';

// ── Platform-wide analytics ───────────────────────────────────────────────────
const signupsByDay = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    signups: Math.round(6 + Math.random() * 14),
  };
});

export const MOCK_ADMIN_ANALYTICS: Analytics = {
  totalUsers: 8_431,
  totalPortfolios: 14_620,
  totalTemplates: 12,
  activePortfolios: 9_870,
  recentSignups: 247,
  revenueThisMonth: 15_840,
  revenueLastMonth: 13_200,
  topTemplates: [
    { templateId: 'template1', name: 'Minimal',      count: 6_210 },
    { templateId: 'template2', name: 'Creative',     count: 4_880 },
    { templateId: 'template3', name: 'Professional', count: 3_530 },
  ],
  signupsByDay,
};

// ── Recent platform activity ──────────────────────────────────────────────────
export const MOCK_ADMIN_RECENT_ACTIVITY = [
  { user: 'sophia.m@gmail.com',    action: 'Published portfolio',    time: '2 min ago',  color: 'bg-emerald-500' },
  { user: 'j.williams@design.io',  action: 'Upgraded to Pro',        time: '8 min ago',  color: 'bg-violet-500'  },
  { user: 'karan.patel@dev.co',    action: 'Created portfolio',      time: '14 min ago', color: 'bg-blue-500'    },
  { user: 'laura.chen@art.co',     action: 'Registered',             time: '32 min ago', color: 'bg-cyan-500'    },
  { user: 'omar.s@freelance.me',   action: 'Changed template',       time: '1 hr ago',   color: 'bg-amber-500'   },
  { user: 'nina.v@studio.com',     action: 'Published portfolio',    time: '2 hr ago',   color: 'bg-emerald-500' },
  { user: 'alex.t@web.dev',        action: 'Cancelled subscription', time: '2 hr ago',   color: 'bg-red-500'     },
  { user: 'priya.k@ui.design',     action: 'Upgraded to Team',       time: '3 hr ago',   color: 'bg-violet-500'  },
];

// ── Users list ────────────────────────────────────────────────────────────────
export const MOCK_ADMIN_USERS: User[] = [
  { id: 'u1', name: 'Sophia Martinez',  email: 'sophia.m@gmail.com',    role: 'user',  createdAt: '2025-08-12T10:00:00Z' },
  { id: 'u2', name: 'James Williams',   email: 'j.williams@design.io',  role: 'user',  createdAt: '2025-09-01T14:30:00Z' },
  { id: 'u3', name: 'Karan Patel',      email: 'karan.patel@dev.co',    role: 'user',  createdAt: '2025-10-05T08:15:00Z' },
  { id: 'u4', name: 'Laura Chen',       email: 'laura.chen@art.co',     role: 'user',  createdAt: '2025-11-22T11:00:00Z' },
  { id: 'u5', name: 'Omar Shaikh',      email: 'omar.s@freelance.me',   role: 'user',  createdAt: '2025-12-10T09:45:00Z' },
  { id: 'u6', name: 'Nina Volkov',      email: 'nina.v@studio.com',     role: 'user',  createdAt: '2026-01-03T16:20:00Z' },
  { id: 'u7', name: 'Alex Turner',      email: 'alex.t@web.dev',        role: 'user',  createdAt: '2026-01-15T12:00:00Z' },
  { id: 'u8', name: 'Priya Krishnan',   email: 'priya.k@ui.design',     role: 'user',  createdAt: '2026-02-08T10:30:00Z' },
  { id: 'u9', name: 'Marcus Reyes',     email: 'marcus.r@code.io',      role: 'user',  createdAt: '2026-02-19T08:00:00Z' },
  { id: 'u10', name: 'Yuki Tanaka',     email: 'yuki.t@pixel.jp',       role: 'user',  createdAt: '2026-03-01T06:30:00Z' },
  { id: 'adm', name: 'Admin User',      email: 'admin@portify.dev',     role: 'admin', createdAt: '2025-01-01T00:00:00Z' },
];

// ── Portfolios list ───────────────────────────────────────────────────────────
const defaultTheme = (primary: string, secondary: string, bg: string, text: string) => ({
  primaryColor: primary, secondaryColor: secondary,
  backgroundColor: bg, textColor: text, fontFamily: 'Inter, sans-serif',
});

export const MOCK_ADMIN_PORTFOLIOS: Portfolio[] = [
  { id: 'ap1', userId: 'u1',  title: "Sophia's Design Portfolio",   slug: 'sophia-design',    templateId: 'template2', isPublished: true,  createdAt: '2025-08-20T10:00:00Z', updatedAt: '2026-03-10T10:00:00Z', theme: defaultTheme('#6366f1','#8b5cf6','#0f0f11','#f4f4f5'), sections: [] },
  { id: 'ap2', userId: 'u2',  title: 'James Full-Stack Portfolio',  slug: 'james-fullstack',  templateId: 'template1', isPublished: true,  createdAt: '2025-09-10T10:00:00Z', updatedAt: '2026-03-09T10:00:00Z', theme: defaultTheme('#0ea5e9','#38bdf8','#020617','#f8fafc'), sections: [] },
  { id: 'ap3', userId: 'u3',  title: "Karan's Dev Showcase",        slug: 'karan-dev',        templateId: 'template1', isPublished: false, createdAt: '2025-10-15T10:00:00Z', updatedAt: '2026-03-08T10:00:00Z', theme: defaultTheme('#10b981','#059669','#0a0f0d','#f0fdf4'), sections: [] },
  { id: 'ap4', userId: 'u4',  title: "Laura's Art Direction",       slug: 'laura-art',        templateId: 'template3', isPublished: true,  createdAt: '2025-11-28T10:00:00Z', updatedAt: '2026-03-07T10:00:00Z', theme: defaultTheme('#f59e0b','#d97706','#0c0a09','#fafaf9'), sections: [] },
  { id: 'ap5', userId: 'u5',  title: "Omar's Freelance Work",       slug: 'omar-freelance',   templateId: 'template2', isPublished: true,  createdAt: '2025-12-20T10:00:00Z', updatedAt: '2026-03-06T10:00:00Z', theme: defaultTheme('#6366f1','#8b5cf6','#0f0f11','#f4f4f5'), sections: [] },
  { id: 'ap6', userId: 'u6',  title: "Nina's Visual Studio",        slug: 'nina-visual',      templateId: 'template2', isPublished: true,  createdAt: '2026-01-10T10:00:00Z', updatedAt: '2026-03-05T10:00:00Z', theme: defaultTheme('#ec4899','#db2777','#0d0010','#fdf4ff'), sections: [] },
  { id: 'ap7', userId: 'u7',  title: "Alex's Web Dev Portfolio",    slug: 'alex-webdev',      templateId: 'template1', isPublished: false, createdAt: '2026-01-22T10:00:00Z', updatedAt: '2026-03-04T10:00:00Z', theme: defaultTheme('#14b8a6','#0d9488','#03110f','#f0fdfa'), sections: [] },
  { id: 'ap8', userId: 'u8',  title: "Priya's UI Lab",              slug: 'priya-uilab',      templateId: 'template3', isPublished: true,  createdAt: '2026-02-12T10:00:00Z', updatedAt: '2026-03-03T10:00:00Z', theme: defaultTheme('#8b5cf6','#7c3aed','#0d0d1a','#f5f3ff'), sections: [] },
];
