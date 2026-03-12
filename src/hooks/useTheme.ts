'use client';

import { useCallback, useEffect } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { DEFAULT_THEME } from '@/utils/constants';
import type { Theme } from '@/types';

export function useTheme() {
  const { activeTheme, setActiveTheme } = usePortfolioStore();

  const applyTheme = useCallback(
    (theme: Partial<Theme>) => {
      setActiveTheme({ ...DEFAULT_THEME, ...theme });
    },
    [setActiveTheme],
  );

  const resetTheme = useCallback(() => {
    setActiveTheme(DEFAULT_THEME);
  }, [setActiveTheme]);

  useEffect(() => {
    const theme = activeTheme ?? DEFAULT_THEME;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    root.style.setProperty('--color-bg', theme.backgroundColor);
    root.style.setProperty('--color-text', theme.textColor);
    root.style.setProperty('--font-family', theme.fontFamily);
  }, [activeTheme]);

  return {
    theme: activeTheme ?? DEFAULT_THEME,
    applyTheme,
    resetTheme,
  };
}
