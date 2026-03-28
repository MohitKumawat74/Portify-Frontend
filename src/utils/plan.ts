import type { DashboardPlanStats } from '@/types';

export interface PlanLimits {
  portfolios: number | null;
  projects: number | null;
}

export function getPlanLimits(planId: string): PlanLimits {
  switch (planId) {
    case 'plan_pro':
      return { portfolios: 15, projects: 100 };
    case 'plan_team':
      return { portfolios: 50, projects: 500 };
    case 'plan_free':
    default:
      return { portfolios: 1, projects: 5 };
  }
}

export function isFreePlan(planId?: string | null): boolean {
  return !planId || planId === 'plan_free';
}

export function isTemplateLockedForPlan(templateId: string, isPremium: boolean, planId?: string | null): boolean {
  if (!isFreePlan(planId)) {
    return false;
  }

  // Free tier can only use template1.
  if (templateId !== 'template1') {
    return true;
  }

  return isPremium;
}

export function canCreateByUsage(used: number, limit: number | null): boolean {
  if (limit === null) return true;
  return used < limit;
}

export function usageLabel(used: number, limit: number | null): string {
  if (limit === null) return `${used}/Unlimited`;
  return `${used}/${limit}`;
}

export function buildFallbackDashboardStats(planId: string, planName: string, portfolioUsed: number, projectUsed: number): DashboardPlanStats {
  const limits = getPlanLimits(planId);

  const toMeter = (used: number, limit: number | null) => {
    const clampedUsed = Math.max(0, used);
    if (limit === null) {
      return {
        used: clampedUsed,
        limit: null,
        remaining: null,
        percentage: 0,
      };
    }

    const pct = Math.min(100, Math.round((clampedUsed / Math.max(1, limit)) * 100));

    return {
      used: clampedUsed,
      limit,
      remaining: Math.max(0, limit - clampedUsed),
      percentage: pct,
    };
  };

  return {
    planId,
    planName,
    isPro: planId !== 'plan_free',
    portfolioUsage: toMeter(portfolioUsed, limits.portfolios),
    projectUsage: toMeter(projectUsed, limits.projects),
  };
}
