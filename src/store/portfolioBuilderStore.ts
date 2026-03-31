import { create } from 'zustand';
import type { PortfolioSection } from '@/types';

export type BuilderSectionType = 'hero' | 'about' | 'skills' | 'projects' | 'contact';

export interface BuilderStyle {
  layout: 'minimal' | 'split' | 'modern' | 'immersive';
  spacing: 'compact' | 'comfortable' | 'spacious';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
}

export interface BuilderPreviewData {
  title: string;
  role: string;
}

export interface BuilderSection extends Omit<PortfolioSection, 'type'> {
  type: BuilderSectionType;
}

interface PortfolioBuilderState {
  portfolioId: string | null;
  sections: BuilderSection[];
  activeSectionId: string | null;
  previewData: BuilderPreviewData;
  style: BuilderStyle;
  isDirty: boolean;
  setPortfolioId: (id: string | null) => void;
  setSections: (sections: BuilderSection[]) => void;
  setActiveSectionId: (id: string | null) => void;
  setPreviewData: (updates: Partial<BuilderPreviewData>) => void;
  updateSectionData: (sectionId: string, updates: Record<string, unknown>) => void;
  reorderSections: (idsInOrder: string[]) => void;
  addSection: (type: BuilderSectionType) => void;
  removeSection: (sectionId: string) => void;
  updateStyle: (updates: Partial<BuilderStyle>) => void;
  resetBuilder: () => void;
  markSaved: () => void;
}

const DEFAULT_STYLE: BuilderStyle = {
  layout: 'modern',
  spacing: 'comfortable',
  colors: {
    primary: '#7c3aed',
    secondary: '#06b6d4',
    background: '#0b1220',
    text: '#f8fafc',
    accent: '#f59e0b',
  },
};

const DEFAULT_SECTIONS: BuilderSection[] = [
  {
    id: 'hero-1',
    order: 0,
    type: 'hero',
    data: {
      name: 'Your Name',
      title: 'Your Role',
      bio: 'Write a concise, high-impact intro.',
    },
  },
  {
    id: 'about-1',
    order: 1,
    type: 'about',
    data: {
      heading: 'About',
      text: 'Tell your story and highlight your strengths.',
    },
  },
  {
    id: 'skills-1',
    order: 2,
    type: 'skills',
    data: {
      items: ['React', 'TypeScript', 'Next.js'],
    },
  },
  {
    id: 'projects-1',
    order: 3,
    type: 'projects',
    data: {
      items: [
        { title: 'Portfolio Platform', description: 'A modern SaaS portfolio app.' },
      ],
    },
  },
  {
    id: 'contact-1',
    order: 4,
    type: 'contact',
    data: {
      email: 'you@example.com',
      linkedin: '',
      github: '',
    },
  },
];

function sortSections(sections: BuilderSection[]): BuilderSection[] {
  return [...sections].sort((a, b) => a.order - b.order);
}

function withNormalizedOrder(sections: BuilderSection[]): BuilderSection[] {
  return sortSections(sections).map((section, index) => ({ ...section, order: index }));
}

export const usePortfolioBuilderStore = create<PortfolioBuilderState>((set) => ({
  portfolioId: null,
  sections: DEFAULT_SECTIONS,
  activeSectionId: DEFAULT_SECTIONS[0]?.id ?? null,
  previewData: {
    title: 'My Portfolio',
    role: 'Product Engineer',
  },
  style: DEFAULT_STYLE,
  isDirty: false,

  setPortfolioId: (id) => set({ portfolioId: id }),

  setSections: (sections) => {
    const nextSections = withNormalizedOrder(sections);
    set({
      sections: nextSections,
      activeSectionId: nextSections[0]?.id ?? null,
      isDirty: true,
    });
  },

  setActiveSectionId: (id) => set({ activeSectionId: id }),

  setPreviewData: (updates) =>
    set((state) => ({
      previewData: {
        ...state.previewData,
        ...updates,
      },
      isDirty: true,
    })),

  updateSectionData: (sectionId, updates) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? { ...section, data: { ...section.data, ...updates } }
          : section,
      ),
      isDirty: true,
    })),

  reorderSections: (idsInOrder) =>
    set((state) => {
      const byId = new Map(state.sections.map((s) => [s.id, s]));
      const reordered: BuilderSection[] = [];

      idsInOrder.forEach((id, index) => {
        const section = byId.get(id);
        if (section) {
          reordered.push({ ...section, order: index });
        }
      });

      // Keep any section that wasn't in idsInOrder.
      state.sections.forEach((section) => {
        if (!idsInOrder.includes(section.id)) {
          reordered.push({ ...section, order: reordered.length });
        }
      });

      return {
        sections: reordered,
        isDirty: true,
      };
    }),

  addSection: (type) =>
    set((state) => {
      const nextIndex = state.sections.length;
      const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const data =
        type === 'hero'
          ? { name: 'Your Name', title: state.previewData.role, bio: '' }
          : type === 'about'
            ? { heading: 'About', text: '' }
            : type === 'skills'
              ? { items: [] }
              : type === 'projects'
                ? { items: [] }
                : { email: '', linkedin: '', github: '' };

      const section: BuilderSection = {
        id,
        type,
        order: nextIndex,
        data,
      };

      return {
        sections: [...state.sections, section],
        activeSectionId: id,
        isDirty: true,
      };
    }),

  removeSection: (sectionId) =>
    set((state) => {
      const next = state.sections.filter((section) => section.id !== sectionId);
      const normalized = withNormalizedOrder(next);
      return {
        sections: normalized,
        activeSectionId:
          state.activeSectionId === sectionId ? (normalized[0]?.id ?? null) : state.activeSectionId,
        isDirty: true,
      };
    }),

  updateStyle: (updates) =>
    set((state) => ({
      style: {
        ...state.style,
        ...updates,
        colors: {
          ...state.style.colors,
          ...(updates.colors ?? {}),
        },
      },
      isDirty: true,
    })),

  resetBuilder: () =>
    set({
      portfolioId: null,
      sections: DEFAULT_SECTIONS,
      activeSectionId: DEFAULT_SECTIONS[0]?.id ?? null,
      previewData: {
        title: 'My Portfolio',
        role: 'Product Engineer',
      },
      style: DEFAULT_STYLE,
      isDirty: false,
    }),

  markSaved: () => set({ isDirty: false }),
}));

export const builderSectionTypes: BuilderSectionType[] = ['hero', 'about', 'skills', 'projects', 'contact'];
