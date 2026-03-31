export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  avatar?: string;
  subscription?: {
    planId?: string;
    planName?: string;
    status?: string;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
  };
}

export interface UsageMeter {
  used: number;
  limit: number | null;
  remaining: number | null;
  percentage: number;
}

export interface DashboardPlanStats {
  planId: string;
  planName: string;
  isPro: boolean;
  portfolioUsage: UsageMeter;
  projectUsage: UsageMeter;
}

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0–100
  category: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  repoUrl?: string;
  image?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrent: boolean;
}

export type SectionType =
  | 'hero'
  | 'about'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'testimonials'
  | 'contact'
  | 'footer';

export interface PortfolioSection {
  id: string;
  type: SectionType;
  data: Record<string, unknown>;
  order: number;
}

export interface PortfolioMetadata {
  source?: string;
  renderMode?: string;
  generatedAt?: string;
  [key: string]: unknown;
}

export interface PortfolioDiagnostics {
  missingSections?: SectionType[];
  fallbackApplied?: boolean;
  warnings?: string[];
  invalidSections?: string[];
  [key: string]: unknown;
}

export interface Portfolio {
  id: string;
  userId: string;
  username?: string;
  title: string;
  slug: string;
  templateId: string;
  templateName?: string;
  templatePreviewImage?: string;
  theme: Theme;
  sections: PortfolioSection[];
  isPublished: boolean;
  views?: number;
  uniqueVisitors?: number;
  projectClicks?: number;
  metaTitle?: string;
  metaDescription?: string;
  metadata?: PortfolioMetadata;
  diagnostics?: PortfolioDiagnostics;
  customizations?: Record<string, unknown>;
  templateSlug?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  previewImage?: string;
  category: string;
  isPremium: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  defaultTheme?: Theme;
  sections?: SectionType[];
  builderConfig?: {
    sections?: Array<{
      id: string;
      type: SectionType;
      order: number;
      data: Record<string, unknown>;
      animation?: {
        type?: 'fade' | 'slide' | 'zoom';
        duration?: number;
        delay?: number;
        trigger?: 'viewport' | 'load' | 'hover';
      };
    }>;
    style?: {
      layoutStyle?: 'minimal' | 'split' | 'modern' | 'immersive';
      colors?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        accentColor?: string;
      };
      typography?: {
        fontFamily?: string;
        headingFont?: string;
        baseFontSize?: string;
      };
    };
  };
}

export interface Analytics {
  totalUsers: number;
  totalPortfolios: number;
  totalTemplates: number;
  activePortfolios: number;
  recentSignups: number;
  topTemplates: Array<{ templateId: string; name: string; count: number }>;
  revenueThisMonth: number;
  revenueLastMonth: number;
  signupsByDay: Array<{ date: string; signups: number }>;
}

export interface PortfolioAnalytics {
  portfolioId: string;
  totalViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  topCountries: Array<{ country: string; views: number }>;
  viewsByDay: Array<{ date: string; views: number }>;
}

export interface UserAnalytics {
  newUsers: number;
  activeUsers: number;
  churnedUsers: number;
  retentionRate: number;
  usersByPlan: { free: number; pro: number; team: number };
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: string;
  description: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  interval?: string;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface CheckoutSession {
  checkoutUrl: string;
}

export interface AdminTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  isDefault: boolean;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
