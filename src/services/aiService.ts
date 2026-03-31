import { api } from './api';
import type { ApiResponse, PortfolioSection } from '@/types';
import type { BuilderSection, BuilderSectionType } from '@/store/portfolioBuilderStore';

export interface GeneratePortfolioPayload {
  name: string;
  role: string;
  skills: string;
  experience: string;
}

interface AIGeneratedPortfolioData {
  title?: string;
  role?: string;
  sections?: Array<Partial<PortfolioSection> & { type?: BuilderSectionType | string }>;
}

type GeneratePortfolioResponse =
  | ApiResponse<AIGeneratedPortfolioData>
  | {
      success?: boolean;
      message?: string;
      data?: AIGeneratedPortfolioData;
      sections?: Array<Partial<PortfolioSection> & { type?: BuilderSectionType | string }>;
      title?: string;
      role?: string;
    };

const SUPPORTED_TYPES: BuilderSectionType[] = ['hero', 'about', 'skills', 'projects', 'contact'];

function isBuilderSectionType(value: string): value is BuilderSectionType {
  return SUPPORTED_TYPES.includes(value as BuilderSectionType);
}

function normalizeGeneratedSections(rawSections: Array<Partial<PortfolioSection> & { type?: BuilderSectionType | string }> | undefined): BuilderSection[] {
  if (!Array.isArray(rawSections) || rawSections.length === 0) {
    return [];
  }

  const sections = rawSections
    .map((section, index) => {
      const sectionType = String(section.type ?? '').toLowerCase();
      if (!isBuilderSectionType(sectionType)) {
        return null;
      }

      return {
        id: String(section.id ?? `${sectionType}-${Date.now()}-${index}`),
        type: sectionType,
        order: typeof section.order === 'number' ? section.order : index,
        data: (section.data ?? {}) as Record<string, unknown>,
      } satisfies BuilderSection;
    })
    .filter((section): section is BuilderSection => section !== null)
    .sort((a, b) => a.order - b.order)
    .map((section, index) => ({ ...section, order: index }));

  return sections;
}

export const aiService = {
  generatePortfolio: async (payload: GeneratePortfolioPayload) => {
    const response = await api.post<GeneratePortfolioResponse>('/ai/generate-portfolio', payload);

    const raw = response as Record<string, unknown>;
    const data = (raw.data as AIGeneratedPortfolioData | undefined) ?? undefined;

    const sections = normalizeGeneratedSections(
      (data?.sections as Array<Partial<PortfolioSection> & { type?: BuilderSectionType | string }> | undefined) ??
      (raw.sections as Array<Partial<PortfolioSection> & { type?: BuilderSectionType | string }> | undefined),
    );

    const resolvedTitle =
      typeof data?.title === 'string' && data.title.trim().length > 0
        ? data.title
        : typeof raw.title === 'string' && raw.title.trim().length > 0
          ? raw.title
          : payload.name.trim().length > 0
            ? `${payload.name}'s Portfolio`
            : 'My Portfolio';

    const resolvedRole =
      typeof data?.role === 'string' && data.role.trim().length > 0
        ? data.role
        : typeof raw.role === 'string' && raw.role.trim().length > 0
          ? raw.role
          : payload.role;

    return {
      title: resolvedTitle,
      role: resolvedRole,
      sections,
      message: String(raw.message ?? 'Generated successfully'),
      success: raw.success !== false,
    };
  },
};
