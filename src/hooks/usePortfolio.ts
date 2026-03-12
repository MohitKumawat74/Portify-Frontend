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
