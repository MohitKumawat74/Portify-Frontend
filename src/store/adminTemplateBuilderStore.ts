import { create } from 'zustand';
import type { SectionType, Template } from '@/types';

export type BuilderAnimationType = 'fade' | 'slide' | 'zoom';
export type BuilderAnimationTrigger = 'viewport' | 'load' | 'hover';

export interface TemplateSectionAnimationConfig {
  type: BuilderAnimationType;
  duration: number;
  delay: number;
  trigger: BuilderAnimationTrigger;
}

export interface AdminBuilderSection {
  id: string;
  type: SectionType;
  order: number;
  data: Record<string, unknown>;
  animation: TemplateSectionAnimationConfig;
}

export interface AdminTemplateBuilderMeta {
  templateId?: string;
  name: string;
  description: string;
  category: string;
  isPremium: boolean;
  isActive: boolean;
  baseTemplateId: 'template1' | 'template2' | 'template3' | 'template4';
}

export interface AdminTemplateBuilderStyle {
  layoutStyle: 'minimal' | 'split' | 'modern' | 'immersive';
  colors: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    baseFontSize: string;
  };
}

type AdminTemplateBuilderStyleUpdates = {
  layoutStyle?: AdminTemplateBuilderStyle['layoutStyle'];
  colors?: Partial<AdminTemplateBuilderStyle['colors']>;
  typography?: Partial<AdminTemplateBuilderStyle['typography']>;
};

const DEFAULT_ANIMATION: TemplateSectionAnimationConfig = {
  type: 'fade',
  duration: 0.6,
  delay: 0,
  trigger: 'viewport',
};

const DEFAULT_STYLE: AdminTemplateBuilderStyle = {
  layoutStyle: 'modern',
  colors: {
    primaryColor: '#6366f1',
    secondaryColor: '#06b6d4',
    backgroundColor: '#0b1220',
    textColor: '#f8fafc',
    accentColor: '#f59e0b',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    headingFont: 'Space Grotesk, sans-serif',
    baseFontSize: '16px',
  },
};

const DEFAULT_META: AdminTemplateBuilderMeta = {
  name: '',
  description: '',
  category: 'minimal',
  isPremium: false,
  isActive: true,
  baseTemplateId: 'template1',
};

const DEFAULT_SECTION_TYPES: SectionType[] = ['hero', 'about', 'skills', 'projects', 'contact'];

function defaultSectionData(type: SectionType): Record<string, unknown> {
  if (type === 'hero') {
    return {
      name: 'Alex Morgan',
      title: 'Product Engineer',
      bio: 'Building high-performance digital products.',
      ctaPrimaryText: 'View Work',
      ctaPrimaryHref: '#projects',
    };
  }
  if (type === 'about') {
    return {
      heading: 'About',
      text: 'This is a configurable about section for this template.',
    };
  }
  if (type === 'skills') {
    return {
      skills: [
        { id: 's1', name: 'React', level: 90, category: 'frontend' },
        { id: 's2', name: 'TypeScript', level: 88, category: 'language' },
      ],
    };
  }
  if (type === 'projects') {
    return {
      projects: [
        {
          id: 'p1',
          title: 'Template Demo Project',
          description: 'Showcase card generated from template defaults.',
          techStack: ['Next.js', 'TypeScript'],
        },
      ],
    };
  }
  if (type === 'experience') {
    return {
      experiences: [
        { id: 'e1', company: 'Studio', role: 'Designer', startDate: '2023-01', description: 'Default timeline item.', isCurrent: true },
      ],
    };
  }
  if (type === 'testimonials') {
    return {
      testimonials: [
        { id: 't1', name: 'Client', quote: 'Amazing execution and quality output.' },
      ],
    };
  }
  if (type === 'footer') {
    return {
      copyright: `(c) ${new Date().getFullYear()} Portfolio.`,
      links: [],
    };
  }
  return {
    heading: 'Contact',
    email: 'hello@example.com',
  };
}

function buildSection(type: SectionType, order: number): AdminBuilderSection {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    order,
    data: defaultSectionData(type),
    animation: { ...DEFAULT_ANIMATION },
  };
}

function normalizedOrder(sections: AdminBuilderSection[]): AdminBuilderSection[] {
  return [...sections]
    .sort((a, b) => a.order - b.order)
    .map((section, index) => ({ ...section, order: index }));
}

interface AdminTemplateBuilderState {
  meta: AdminTemplateBuilderMeta;
  sections: AdminBuilderSection[];
  selectedSectionId: string | null;
  style: AdminTemplateBuilderStyle;
  isDirty: boolean;
  setMeta: (updates: Partial<AdminTemplateBuilderMeta>) => void;
  setStyle: (updates: AdminTemplateBuilderStyleUpdates) => void;
  setSections: (sections: AdminBuilderSection[]) => void;
  addSection: (type: SectionType) => void;
  insertSection: (type: SectionType, index: number) => void;
  removeSection: (id: string) => void;
  reorderSections: (sectionIds: string[]) => void;
  selectSection: (id: string | null) => void;
  updateSectionData: (id: string, updates: Record<string, unknown>) => void;
  updateSectionAnimation: (id: string, updates: Partial<TemplateSectionAnimationConfig>) => void;
  hydrateFromTemplate: (template: Template) => void;
  reset: () => void;
  markSaved: () => void;
}

const initialSections = DEFAULT_SECTION_TYPES.map((type, index) => buildSection(type, index));

export const useAdminTemplateBuilderStore = create<AdminTemplateBuilderState>((set) => ({
  meta: DEFAULT_META,
  sections: initialSections,
  selectedSectionId: initialSections[0]?.id ?? null,
  style: DEFAULT_STYLE,
  isDirty: false,

  setMeta: (updates) => set((state) => ({ meta: { ...state.meta, ...updates }, isDirty: true })),

  setStyle: (updates) =>
    set((state) => ({
      style: {
        ...state.style,
        ...updates,
        colors: { ...state.style.colors, ...(updates.colors ?? {}) },
        typography: { ...state.style.typography, ...(updates.typography ?? {}) },
      },
      isDirty: true,
    })),

  setSections: (sections) => {
    const next = normalizedOrder(sections);
    set({
      sections: next,
      selectedSectionId: next[0]?.id ?? null,
      isDirty: true,
    });
  },

  addSection: (type) =>
    set((state) => {
      const next = [...state.sections, buildSection(type, state.sections.length)];
      const normalized = normalizedOrder(next);
      return {
        sections: normalized,
        selectedSectionId: normalized[normalized.length - 1]?.id ?? null,
        isDirty: true,
      };
    }),

  insertSection: (type, index) =>
    set((state) => {
      const next = [...state.sections];
      next.splice(Math.max(index, 0), 0, buildSection(type, index));
      const normalized = normalizedOrder(next);
      return {
        sections: normalized,
        selectedSectionId: normalized[Math.max(index, 0)]?.id ?? normalized[0]?.id ?? null,
        isDirty: true,
      };
    }),

  removeSection: (id) =>
    set((state) => {
      const next = normalizedOrder(state.sections.filter((section) => section.id !== id));
      return {
        sections: next,
        selectedSectionId: state.selectedSectionId === id ? (next[0]?.id ?? null) : state.selectedSectionId,
        isDirty: true,
      };
    }),

  reorderSections: (sectionIds) =>
    set((state) => {
      const byId = new Map(state.sections.map((section) => [section.id, section]));
      const next: AdminBuilderSection[] = [];
      sectionIds.forEach((id) => {
        const section = byId.get(id);
        if (section) next.push(section);
      });
      state.sections.forEach((section) => {
        if (!sectionIds.includes(section.id)) next.push(section);
      });
      return { sections: normalizedOrder(next), isDirty: true };
    }),

  selectSection: (id) => set({ selectedSectionId: id }),

  updateSectionData: (id, updates) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === id
          ? { ...section, data: { ...section.data, ...updates } }
          : section,
      ),
      isDirty: true,
    })),

  updateSectionAnimation: (id, updates) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === id
          ? { ...section, animation: { ...section.animation, ...updates } }
          : section,
      ),
      isDirty: true,
    })),

  hydrateFromTemplate: (template) => {
    const builderConfig = template.builderConfig;
    const nextSections = Array.isArray(builderConfig?.sections) && builderConfig.sections.length > 0
      ? normalizedOrder(
          builderConfig.sections.map((section, index) => ({
            ...section,
            order: typeof section.order === 'number' ? section.order : index,
            animation: {
              ...DEFAULT_ANIMATION,
              ...(section.animation ?? {}),
            },
        })) as AdminBuilderSection[],
        )
      : normalizedOrder(
          (template.sections ?? DEFAULT_SECTION_TYPES).map((type, index) => buildSection(type, index)),
        );

    set({
      meta: {
        templateId: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        isPremium: template.isPremium,
        isActive: template.isActive,
        baseTemplateId: (['template1', 'template2', 'template3', 'template4'].includes(template.id) ? template.id : 'template1') as 'template1' | 'template2' | 'template3' | 'template4',
      },
      sections: nextSections,
      selectedSectionId: nextSections[0]?.id ?? null,
      style: {
        ...DEFAULT_STYLE,
        ...(builderConfig?.style ?? {}),
        colors: {
          ...DEFAULT_STYLE.colors,
          ...(template.defaultTheme
            ? {
                primaryColor: template.defaultTheme.primaryColor,
                secondaryColor: template.defaultTheme.secondaryColor,
                backgroundColor: template.defaultTheme.backgroundColor,
                textColor: template.defaultTheme.textColor,
              }
            : {}),
          ...(builderConfig?.style?.colors ?? {}),
        },
      },
      isDirty: false,
    });
  },

  reset: () => {
    const next = DEFAULT_SECTION_TYPES.map((type, index) => buildSection(type, index));
    set({
      meta: DEFAULT_META,
      sections: next,
      selectedSectionId: next[0]?.id ?? null,
      style: DEFAULT_STYLE,
      isDirty: false,
    });
  },

  markSaved: () => set({ isDirty: false }),
}));
