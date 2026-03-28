'use client';

import { useCallback } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { portfolioService } from '@/services/portfolioService';
import type { CreatePortfolioPayload } from '@/services/portfolioService';
import { useAuthStore } from '@/store/authStore';
import type { Portfolio } from '@/types';

export function usePortfolio() {
  const { token } = useAuthStore();
  const {
    portfolios,
    selectedPortfolio,
    isLoading,
    setPortfolios,
    setSelectedPortfolio,
    addPortfolio,
    updatePortfolio,
    removePortfolio,
    setLoading,
  } = usePortfolioStore();

  const fetchPortfolios = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await portfolioService.getAll(token);
      setPortfolios(response.data);
    } finally {
      setLoading(false);
    }
  }, [token, setPortfolios, setLoading]);

  const fetchPortfolioById = useCallback(
    async (id: string) => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await portfolioService.getById(id, token);
        setSelectedPortfolio(response.data);
        return response.data;
      } finally {
        setLoading(false);
      }
    },
    [token, setSelectedPortfolio, setLoading],
  );

  const createPortfolio = useCallback(
    async (payload: CreatePortfolioPayload) => {
      if (!token) return;
      const response = await portfolioService.create(payload, token);
      if (response.success) {
        addPortfolio(response.data);
        const usage = useAuthStore.getState().usageStats;
        if (usage) {
          const nextUsed = usage.portfolioUsage.used + 1;
          const limit = usage.portfolioUsage.limit;
          const nextPct = limit ? Math.min(100, Math.round((nextUsed / Math.max(1, limit)) * 100)) : 0;
          useAuthStore.getState().setPlanUsage({
            ...usage,
            portfolioUsage: {
              ...usage.portfolioUsage,
              used: nextUsed,
              remaining: limit === null ? null : Math.max(0, limit - nextUsed),
              percentage: nextPct,
            },
          });
        }
      }
      return response.data;
    },
    [token, addPortfolio],
  );

  const editPortfolio = useCallback(
    async (id: string, updates: Partial<Portfolio>) => {
      if (!token) return;
      const response = await portfolioService.update(id, updates, token);
      if (response.success) {
        updatePortfolio(id, response.data);
      }
      return response.data;
    },
    [token, updatePortfolio],
  );

  const deletePortfolio = useCallback(
    async (id: string) => {
      if (!token) return;
      await portfolioService.delete(id, token);
      removePortfolio(id);
      const usage = useAuthStore.getState().usageStats;
      if (usage) {
        const nextUsed = Math.max(0, usage.portfolioUsage.used - 1);
        const limit = usage.portfolioUsage.limit;
        const nextPct = limit ? Math.min(100, Math.round((nextUsed / Math.max(1, limit)) * 100)) : 0;
        useAuthStore.getState().setPlanUsage({
          ...usage,
          portfolioUsage: {
            ...usage.portfolioUsage,
            used: nextUsed,
            remaining: limit === null ? null : Math.max(0, limit - nextUsed),
            percentage: nextPct,
          },
        });
      }
    },
    [token, removePortfolio],
  );

  return {
    portfolios,
    selectedPortfolio,
    isLoading,
    fetchPortfolios,
    fetchPortfolioById,
    createPortfolio,
    editPortfolio,
    deletePortfolio,
    updatePortfolio,
  };
}
