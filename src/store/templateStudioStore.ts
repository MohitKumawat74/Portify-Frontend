import { create } from 'zustand';

export type PreviewDevice = 'desktop' | 'mobile';

export interface TemplateCustomization {
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
  sectionVisibility: {
    hero: boolean;
    about: boolean;
    skills: boolean;
    projects: boolean;
    contact: boolean;
  };
  layoutStyle: 'minimal' | 'split' | 'modern' | 'immersive';
}

export const DEFAULT_TEMPLATE_CUSTOMIZATION: TemplateCustomization = {
  colors: {
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#0b1220',
    textColor: '#f8fafc',
    accentColor: '#f59e0b',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    headingFont: 'Space Grotesk, sans-serif',
    baseFontSize: '16px',
  },
  sectionVisibility: {
    hero: true,
    about: true,
    skills: true,
    projects: true,
    contact: true,
  },
  layoutStyle: 'modern',
};

interface TemplateStudioState {
  selectedTemplateId: string | null;
  previewDevice: PreviewDevice;
  customizations: TemplateCustomization;
  setSelectedTemplateId: (templateId: string | null) => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  updateColors: (colors: Partial<TemplateCustomization['colors']>) => void;
  updateTypography: (typography: Partial<TemplateCustomization['typography']>) => void;
  updateSectionVisibility: (section: keyof TemplateCustomization['sectionVisibility'], visible: boolean) => void;
  setLayoutStyle: (layoutStyle: TemplateCustomization['layoutStyle']) => void;
  resetCustomizations: () => void;
  replaceCustomizations: (next: Partial<TemplateCustomization>) => void;
}

export const useTemplateStudioStore = create<TemplateStudioState>((set) => ({
  selectedTemplateId: null,
  previewDevice: 'desktop',
  customizations: DEFAULT_TEMPLATE_CUSTOMIZATION,

  setSelectedTemplateId: (templateId) => set({ selectedTemplateId: templateId }),

  setPreviewDevice: (device) => set({ previewDevice: device }),

  updateColors: (colors) =>
    set((state) => ({
      customizations: {
        ...state.customizations,
        colors: {
          ...state.customizations.colors,
          ...colors,
        },
      },
    })),

  updateTypography: (typography) =>
    set((state) => ({
      customizations: {
        ...state.customizations,
        typography: {
          ...state.customizations.typography,
          ...typography,
        },
      },
    })),

  updateSectionVisibility: (section, visible) =>
    set((state) => ({
      customizations: {
        ...state.customizations,
        sectionVisibility: {
          ...state.customizations.sectionVisibility,
          [section]: visible,
        },
      },
    })),

  setLayoutStyle: (layoutStyle) =>
    set((state) => ({
      customizations: {
        ...state.customizations,
        layoutStyle,
      },
    })),

  resetCustomizations: () => set({ customizations: DEFAULT_TEMPLATE_CUSTOMIZATION }),

  replaceCustomizations: (next) =>
    set((state) => ({
      customizations: {
        ...state.customizations,
        ...next,
        colors: {
          ...state.customizations.colors,
          ...(next.colors ?? {}),
        },
        typography: {
          ...state.customizations.typography,
          ...(next.typography ?? {}),
        },
        sectionVisibility: {
          ...state.customizations.sectionVisibility,
          ...(next.sectionVisibility ?? {}),
        },
      },
    })),
}));
