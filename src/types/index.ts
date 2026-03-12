export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  avatar?: string;
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
  | 'contact';

export interface PortfolioSection {
  id: string;
  type: SectionType;
  data: Record<string, unknown>;
  order: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  slug: string;
  templateId: string;
  theme: Theme;
  sections: PortfolioSection[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  isPremium: boolean;
  isActive: boolean;
  createdAt: string;
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
