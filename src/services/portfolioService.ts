import { api } from './api';
import type { ApiResponse, PaginatedResponse, Portfolio, PortfolioAnalytics, PortfolioDiagnostics, PortfolioMetadata, SectionType, Theme } from '@/types';

export interface CreatePortfolioPayload {
  title: string;
  templateId: string;
  theme?: Partial<Theme>;
}

export interface SaveCustomizationPayload {
  templateId: string;
  customizations: {
    colors?: Record<string, string>;
    typography?: Record<string, string>;
    sectionVisibility?: Record<string, boolean>;
    layoutStyle?: string;
  };
}

export interface ReorderSectionsPayload {
  sectionIds: string[];
}

type PortfolioTemplateRef =
  | string
  | {
      _id?: string;
      id?: string;
      name?: string;
      previewImage?: string;
      thumbnail?: string;
    };

type ThemeApiShape = Partial<Theme> & {
  darkMode?: boolean;
};

type PortfolioApiShape = Partial<Portfolio> & {
  _id?: string;
  username?: string;
  templateSlug?: string | null;
  template?: PortfolioTemplateRef;
  templateId?: PortfolioTemplateRef;
  customizations?: Record<string, unknown>;
  metadata?: PortfolioMetadata;
  diagnostics?: PortfolioDiagnostics;
  themeConfig?: ThemeApiShape;
  theme?: ThemeApiShape;
  sections?: Array<{
    _id?: string;
    id?: string;
    type?: string;
    data?: Record<string, unknown>;
    order?: number;
  }>;
  views?: number;
  uniqueVisitors?: number;
  projectClicks?: number;
  metaTitle?: string;
  metaDescription?: string;
};

type PortfolioListApiResponse =
  | PaginatedResponse<PortfolioApiShape>
  | {
      data: PortfolioApiShape[];
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
      pagination?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
      };
    }
  | ApiResponse<PaginatedResponse<PortfolioApiShape>>;

type PortfolioSingleApiResponse = ApiResponse<PortfolioApiShape> | PortfolioApiShape;

type PortfolioCollectionLike = {
  data?: PortfolioApiShape[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

function slugifyTitle(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function resolveTheme(raw: PortfolioApiShape): Theme {
  const source = raw.themeConfig ?? raw.theme ?? {};
  return {
    primaryColor: source.primaryColor ?? '#6366f1',
    secondaryColor: source.secondaryColor ?? '#8b5cf6',
    backgroundColor: source.backgroundColor ?? '#ffffff',
    textColor: source.textColor ?? '#111827',
    fontFamily: source.fontFamily ?? 'Inter, sans-serif',
  };
}

function resolveTemplateRef(templateRef: PortfolioTemplateRef | undefined): {
  templateId: string;
  templateName?: string;
  templatePreviewImage?: string;
  templateSlug?: string;
} {
  if (typeof templateRef === 'string') {
    return { templateId: templateRef };
  }

  if (templateRef && typeof templateRef === 'object') {
    return {
      templateId: templateRef.id ?? templateRef._id ?? '',
      templateName: templateRef.name,
      templatePreviewImage: templateRef.previewImage ?? templateRef.thumbnail,
      templateSlug: (templateRef as { slug?: string }).slug,
    };
  }

  return { templateId: '' };
}

function isValidSectionType(value: unknown): value is SectionType {
  return value === 'hero' || value === 'about' || value === 'skills' || value === 'projects' || value === 'experience' || value === 'testimonials' || value === 'contact' || value === 'footer';
}

function normalizeSections(rawSections: PortfolioApiShape['sections']): Portfolio['sections'] {
  if (!Array.isArray(rawSections)) return [];

  return rawSections
    .map((section, index) => {
      const normalizedType = typeof section.type === 'string' ? section.type.toLowerCase() : '';
      if (!isValidSectionType(normalizedType)) return null;

      return {
        id: section.id ?? section._id ?? `section-${index}`,
        type: normalizedType,
        data: typeof section.data === 'object' && section.data !== null ? section.data : {},
        order: typeof section.order === 'number' ? section.order : index,
      };
    })
    .filter((section): section is Portfolio['sections'][number] => section !== null)
    .sort((a, b) => a.order - b.order);
}

function normalizeDiagnostics(input: PortfolioApiShape): PortfolioDiagnostics | undefined {
  if (!input.diagnostics || typeof input.diagnostics !== 'object') return undefined;

  const raw = input.diagnostics as Record<string, unknown>;
  const missingSections = Array.isArray(raw.missingSections)
    ? raw.missingSections.filter(isValidSectionType)
    : undefined;
  const warnings = Array.isArray(raw.warnings)
    ? raw.warnings.filter((warning): warning is string => typeof warning === 'string')
    : undefined;
  const invalidSections = Array.isArray(raw.invalidSections)
    ? raw.invalidSections.filter((section): section is string => typeof section === 'string')
    : undefined;

  return {
    ...raw,
    missingSections,
    warnings,
    invalidSections,
    fallbackApplied: Boolean(raw.fallbackApplied),
  } as PortfolioDiagnostics;
}

function normalizePortfolio(input: PortfolioApiShape): Portfolio {
  const id = input.id ?? input._id ?? '';
  const title = input.title ?? 'Untitled Portfolio';
  const username = typeof input.username === 'string' ? input.username : undefined;
  const slugCandidate = input.slug ?? username ?? slugifyTitle(title);
  const slug = slugCandidate || id;
  const templateFromPayload = resolveTemplateRef(input.templateId);
  const templateFromObject = resolveTemplateRef(input.template);
  const templateId = templateFromPayload.templateId || templateFromObject.templateId;
  const templateName = templateFromPayload.templateName ?? templateFromObject.templateName;
  const templatePreviewImage = templateFromPayload.templatePreviewImage ?? templateFromObject.templatePreviewImage;
  const templateSlug = input.templateSlug ?? templateFromPayload.templateSlug ?? templateFromObject.templateSlug ?? null;
  const sections = normalizeSections(input.sections);
  const diagnostics = normalizeDiagnostics(input);

  return {
    ...(input as Portfolio),
    id,
    userId: typeof input.userId === 'string' ? input.userId : '',
    title,
    slug,
    templateId: templateId || 'template1',
    theme: resolveTheme(input),
    sections,
    isPublished: Boolean(input.isPublished),
    metadata: typeof input.metadata === 'object' && input.metadata !== null ? input.metadata : undefined,
    diagnostics,
    templateSlug,
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: input.updatedAt ?? input.createdAt ?? new Date().toISOString(),
    username,
    templateName,
    templatePreviewImage,
  };
}

function normalizePortfolioSingleResponse(response: PortfolioSingleApiResponse): ApiResponse<Portfolio> {
  if ('success' in response) {
    return {
      ...response,
      data: normalizePortfolio(response.data),
    };
  }

  return {
    success: true,
    message: 'ok',
    data: normalizePortfolio(response),
  };
}

function normalizePortfolioFromCollectionResponse(
  response: PortfolioCollectionLike,
  usernameOrSlug?: string,
): ApiResponse<Portfolio> {
  const items = Array.isArray(response.data) ? response.data : [];
  if (!items.length) {
    return {
      success: false,
      message: 'Portfolio not found',
      data: normalizePortfolio({}),
    };
  }

  const key = (usernameOrSlug ?? '').toLowerCase();
  const matched = key
    ? items.find((item) => {
        const username = typeof item.username === 'string' ? item.username.toLowerCase() : '';
        const slug = typeof item.slug === 'string' ? item.slug.toLowerCase() : '';
        return username === key || slug === key;
      })
    : undefined;

  return {
    success: true,
    message: 'ok',
    data: normalizePortfolio(matched ?? items[0]),
  };
}

function normalizePortfolioListResponse(response: PortfolioListApiResponse): PaginatedResponse<Portfolio> {
  const payload = 'success' in response ? response.data : response;
  const pagination = 'pagination' in payload ? payload.pagination : undefined;

  return {
    data: (payload.data ?? []).map(normalizePortfolio),
    total: payload.total ?? pagination?.total ?? payload.data.length,
    page: payload.page ?? pagination?.page ?? 1,
    limit: payload.limit ?? pagination?.limit ?? payload.data.length,
    totalPages: payload.totalPages ?? pagination?.totalPages ?? 1,
  };
}

export const portfolioService = {
  getAll: (token: string, page = 1, limit = 10) =>
    api
      .get<PortfolioListApiResponse>(`/portfolios?page=${page}&limit=${limit}`, token)
      .then((response) => normalizePortfolioListResponse(response)),

  getById: (id: string, token: string) =>
    api
      .get<PortfolioSingleApiResponse>(`/portfolios/${id}`, token)
      .then((response) => normalizePortfolioSingleResponse(response)),

  getBySlug: (slug: string) =>
    api
      .get<PortfolioSingleApiResponse | PortfolioCollectionLike>(`/portfolios/public/${encodeURIComponent(slug)}`)
      .then((response) => {
        if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as PortfolioCollectionLike).data)) {
          return normalizePortfolioFromCollectionResponse(response as PortfolioCollectionLike, slug);
        }
        return normalizePortfolioSingleResponse(response as PortfolioSingleApiResponse);
      }),

  getByUsername: (username: string) =>
    api
      .get<PortfolioSingleApiResponse | PortfolioCollectionLike>(`/portfolio/${encodeURIComponent(username)}`)
      .then((response) => {
        if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as PortfolioCollectionLike).data)) {
          return normalizePortfolioFromCollectionResponse(response as PortfolioCollectionLike, username);
        }
        return normalizePortfolioSingleResponse(response as PortfolioSingleApiResponse);
      }),

  getPublicByUsername: async (username: string) => {
    try {
      const response = await api.get<PortfolioSingleApiResponse | PortfolioCollectionLike>(`/portfolio/${encodeURIComponent(username)}`);
      if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as PortfolioCollectionLike).data)) {
        return normalizePortfolioFromCollectionResponse(response as PortfolioCollectionLike, username);
      }
      return normalizePortfolioSingleResponse(response as PortfolioSingleApiResponse);
    } catch {
      return api
        .get<PortfolioSingleApiResponse | PortfolioCollectionLike>(`/portfolios/public/${encodeURIComponent(username)}`)
        .then((response) => {
          if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as PortfolioCollectionLike).data)) {
            return normalizePortfolioFromCollectionResponse(response as PortfolioCollectionLike, username);
          }
          return normalizePortfolioSingleResponse(response as PortfolioSingleApiResponse);
        });
    }
  },

  create: (payload: CreatePortfolioPayload, token: string) =>
    api
      .post<PortfolioSingleApiResponse>('/portfolios', payload, token)
      .then((response) => normalizePortfolioSingleResponse(response)),

  update: (id: string, payload: Partial<Portfolio>, token: string) =>
    api
      .put<PortfolioSingleApiResponse>(`/portfolios/${id}`, payload, token)
      .then((response) => normalizePortfolioSingleResponse(response)),

  delete: (id: string, token: string) =>
    api.delete<ApiResponse<null>>(`/portfolios/${id}`, token),

  publish: (id: string, token: string) =>
    api
      .patch<PortfolioSingleApiResponse>(`/portfolios/${id}/publish`, {}, token)
      .then((response) => normalizePortfolioSingleResponse(response)),

  unpublish: (id: string, token: string) =>
    api
      .patch<PortfolioSingleApiResponse>(`/portfolios/${id}/unpublish`, {}, token)
      .then((response) => normalizePortfolioSingleResponse(response)),

  getAnalytics: (id: string, token: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<ApiResponse<PortfolioAnalytics>>(`/portfolios/${id}/analytics${query}`, token);
  },

  updateSections: (id: string, sections: Portfolio['sections'], token: string) =>
    api
      .patch<PortfolioSingleApiResponse>(`/portfolios/${id}`, { sections }, token)
      .then((response) => normalizePortfolioSingleResponse(response)),

  reorderSections: (id: string, payload: ReorderSectionsPayload, token: string) =>
    api
      .patch<PortfolioSingleApiResponse>(`/portfolios/${id}/sections/reorder`, payload, token)
      .then((response) => normalizePortfolioSingleResponse(response)),

  saveCustomization: (payload: SaveCustomizationPayload, token: string) =>
    api.post<ApiResponse<null>>('/portfolio/customize', payload, token),
};
