import { create } from 'zustand';
import type { Portfolio, Theme } from '@/types';

interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  activeTheme: Theme | null;
  isLoading: boolean;

  setPortfolios: (portfolios: Portfolio[]) => void;
  setSelectedPortfolio: (portfolio: Portfolio | null) => void;
  addPortfolio: (portfolio: Portfolio) => void;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
  removePortfolio: (id: string) => void;
  setActiveTheme: (theme: Theme) => void;
  setLoading: (loading: boolean) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],
  selectedPortfolio: null,
  activeTheme: null,
  isLoading: false,

  setPortfolios: (portfolios) => set({ portfolios }),

  setSelectedPortfolio: (portfolio) => set({ selectedPortfolio: portfolio }),

  addPortfolio: (portfolio) =>
    set((state) => ({ portfolios: [...state.portfolios, portfolio] })),

  updatePortfolio: (id, updates) =>
    set((state) => ({
      portfolios: state.portfolios.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
      selectedPortfolio:
        state.selectedPortfolio?.id === id
          ? { ...state.selectedPortfolio, ...updates }
          : state.selectedPortfolio,
    })),

  removePortfolio: (id) =>
    set((state) => ({
      portfolios: state.portfolios.filter((p) => p.id !== id),
      selectedPortfolio:
        state.selectedPortfolio?.id === id ? null : state.selectedPortfolio,
    })),

  setActiveTheme: (theme) => set({ activeTheme: theme }),

  setLoading: (isLoading) => set({ isLoading }),
}));
