import { api } from './api';
import type { ApiResponse, ContactPayload } from '@/types';

export const contactService = {
  sendMessage: (payload: ContactPayload) =>
    api.post<ApiResponse<null>>('/contact', payload),
};
