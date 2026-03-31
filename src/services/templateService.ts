import { api } from './api';
import type { ApiResponse, PaginatedResponse, Template } from '@/types';

type TemplateApiShape = Partial<Template> & {
  _id?: string;
  previewImage?: string;
  thumbnail?: string;
  sections?: string[];
};

type TemplateListApiResponse =
  | PaginatedResponse<TemplateApiShape>
  | {
      data: TemplateApiShape[];
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

function normalizeTemplate(input: TemplateApiShape): Template {
  const id = input.id ?? input._id ?? '';
  const previewImage = input.previewImage ?? input.thumbnail ?? '';
  const createdAt = input.createdAt ?? new Date().toISOString();

  return {
    ...input,
    id,
    name: input.name ?? 'Untitled Template',
    description: input.description ?? '',
    category: input.category ?? 'minimal',
    isPremium: Boolean(input.isPremium),
    isActive: input.isActive ?? true,
    thumbnail: previewImage,
    previewImage,
    createdAt,
  };
}

function normalizeTemplateListResponse(response: TemplateListApiResponse): PaginatedResponse<Template> {
  const pagination = 'pagination' in response ? response.pagination : undefined;

  return {
    data: (response.data ?? []).map(normalizeTemplate),
    total: response.total ?? pagination?.total ?? response.data.length,
    page: response.page ?? pagination?.page ?? 1,
    limit: response.limit ?? pagination?.limit ?? response.data.length,
    totalPages: response.totalPages ?? pagination?.totalPages ?? 1,
  };
}

export const templateService = {
  getAll: (page = 1, limit = 10) =>
    api
      .get<TemplateListApiResponse>(`/templates?page=${page}&limit=${limit}`)
      .then((response) => normalizeTemplateListResponse(response)),

  // Search templates with a query string. Returns array of templates (limit default 5).
  search: (query: string, limit = 5) =>
    api
      .get<TemplateListApiResponse>(`/templates?search=${encodeURIComponent(query)}&limit=${limit}`)
      .then((response) => normalizeTemplateListResponse(response).data),

  getById: (id: string) =>
    api
      .get<ApiResponse<TemplateApiShape>>(`/templates/${id}`)
      .then((response) => ({ ...response, data: normalizeTemplate(response.data) })),

  create: (payload: Partial<Template>, token: string) =>
    api
      .post<ApiResponse<TemplateApiShape>>('/templates', payload, token)
      .then((response) => ({ ...response, data: normalizeTemplate(response.data) })),

  update: (id: string, payload: Partial<Template>, token: string) =>
    api
      .put<ApiResponse<TemplateApiShape>>(`/templates/${id}`, payload, token)
      .then((response) => ({ ...response, data: normalizeTemplate(response.data) })),

  delete: (id: string, token: string) =>
    api.delete<ApiResponse<null>>(`/templates/${id}`, token),

  toggleActive: (id: string, token: string) =>
    api
      .patch<ApiResponse<TemplateApiShape>>(`/templates/${id}/toggle`, {}, token)
      .then((response) => ({ ...response, data: normalizeTemplate(response.data) })),
};
