import type { InvoiceInput } from './schema';

export interface Invoice extends InvoiceInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
}

export interface InvoiceSummary {
  id: string;
  number: string;
  customerName: string;
  totalCents: number;
  updatedAt: string;
  sentAt: string | null;
}

export interface SendInvoiceResponse {
  messageId: string;
  preview: boolean;
  sentAt: string | null;
}

export interface FieldIssue {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  error: string;
  message: string;
  issues?: FieldIssue[];
}
