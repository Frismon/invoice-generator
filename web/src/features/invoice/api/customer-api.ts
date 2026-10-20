import type { Party } from '@invoice/shared';
import { request } from '@/lib/http';

export const customerApi = {
  list: () => request<Party[]>('/customers'),
};
