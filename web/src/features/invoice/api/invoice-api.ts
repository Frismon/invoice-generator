import type {
  Invoice,
  InvoiceInput,
  InvoiceSummary,
  SendInvoiceRequest,
  SendInvoiceResponse,
} from '@invoice/shared';
import { ApiError, json, request } from '@/lib/http';

const byId = (id: string) => `/invoices/${encodeURIComponent(id)}`;

export const invoiceApi = {
  list: () => request<InvoiceSummary[]>('/invoices'),
  get: (id: string) => request<Invoice>(byId(id)),
  create: (input: InvoiceInput) => request<Invoice>('/invoices', json('POST', input)),
  update: (id: string, input: InvoiceInput) => request<Invoice>(byId(id), json('PUT', input)),
  send: (id: string, body: SendInvoiceRequest) =>
    request<SendInvoiceResponse>(`${byId(id)}/send`, json('POST', body)).catch((err: unknown) => {
      if (err instanceof ApiError && err.status === 429) {
        throw new ApiError(429, 'Too many emails. Wait a minute and try again.');
      }
      throw err;
    }),
};
