import { api } from './api';
import { portfolioService } from './portfolioService';
import { planService } from './planService';
import type { ApiResponse, DashboardPlanStats, Portfolio } from '@/types';
import { buildFallbackDashboardStats, getPlanLimits } from '@/utils/plan';

interface DashboardStatsWire {
  plan?: {
    planId?: string;
    planName?: string;
    isPro?: boolean;
  } | string;
  planName?: string;
  portfoliosUsed?: number;
  portfoliosLimit?: number;
  projectsUsed?: number;
  projectsLimit?: number;
  usage?: {
    portfolios?: {
      used?: number;
      limit?: number | null;
      remaining?: number | null;
      percentage?: number;
    };
    projects?: {
      used?: number;
      limit?: number | null;
      remaining?: number | null;
      percentage?: number;
    };
  };
}

function countProjectsInPortfolio(portfolio: Portfolio): number {
  let count = 0;

  const sections = Array.isArray(portfolio.sections) ? portfolio.sections : [];
  for (const section of sections) {
    if (section.type !== 'projects') continue;
    const data = section.data as { projects?: unknown };
    if (Array.isArray(data?.projects)) {
      count += data.projects.length;
    }
  }

  return count;
}

export const dashboardService = {
  getStats: async (token: string): Promise<DashboardPlanStats> => {
    try {
      const response = await api.get<ApiResponse<DashboardStatsWire>>('/dashboard/stats', token);
      const rawPlan = response.data.plan;
      const legacyPlanCode = typeof rawPlan === 'string' ? rawPlan : null;
      const planId =
        (typeof rawPlan === 'object' ? rawPlan.planId : null) ??
        (legacyPlanCode === 'pro' ? 'plan_pro' : 'plan_free');
      const planName =
        (typeof rawPlan === 'object' ? rawPlan.planName : null) ??
        response.data.planName ??
        (legacyPlanCode === 'pro' ? 'Pro' : 'Free');
      const limits = getPlanLimits(planId);
      const portfolioUsed = response.data.usage?.portfolios?.used ?? response.data.portfoliosUsed ?? 0;
      const portfolioLimit = response.data.usage?.portfolios?.limit ?? response.data.portfoliosLimit ?? limits.portfolios;
      const projectUsed = response.data.usage?.projects?.used ?? response.data.projectsUsed ?? 0;
      const projectLimit = response.data.usage?.projects?.limit ?? response.data.projectsLimit ?? limits.projects;

      const toPercentage = (used: number, limit: number | null): number => {
        if (limit === null) return 0;
        return Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
      };

      return {
        planId,
        planName,
        isPro: (typeof rawPlan === 'object' ? rawPlan.isPro : null) ?? planId !== 'plan_free',
        portfolioUsage: {
          used: portfolioUsed,
          limit: portfolioLimit,
          remaining:
            response.data.usage?.portfolios?.remaining ??
            (portfolioLimit === null ? null : Math.max(0, portfolioLimit - portfolioUsed)),
          percentage: response.data.usage?.portfolios?.percentage ?? toPercentage(portfolioUsed, portfolioLimit),
        },
        projectUsage: {
          used: projectUsed,
          limit: projectLimit,
          remaining:
            response.data.usage?.projects?.remaining ??
            (projectLimit === null ? null : Math.max(0, projectLimit - projectUsed)),
          percentage: response.data.usage?.projects?.percentage ?? toPercentage(projectUsed, projectLimit),
        },
      };
    } catch {
      // Fallback for environments where /dashboard/stats is not yet available.
      const [portfolioRes, subscriptionRes] = await Promise.all([
        portfolioService.getAll(token, 1, 100),
        planService.getCurrentSubscription(token),
      ]);

      const portfolioUsed = Array.isArray(portfolioRes.data) ? portfolioRes.data.length : 0;
      const projectUsed = (Array.isArray(portfolioRes.data) ? portfolioRes.data : []).reduce(
        (sum, p) => sum + countProjectsInPortfolio(p),
        0,
      );

      const planId = subscriptionRes.data.planId || 'plan_free';
      const planName = subscriptionRes.data.planName || 'Free';

      return buildFallbackDashboardStats(planId, planName, portfolioUsed, projectUsed);
    }
  },
};
