import type { FieldIssue, Invoice, InvoiceInput } from '@invoice/shared';

export type Recipe = (draft: InvoiceInput) => InvoiceInput;

export type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'saving' }
  | { kind: 'error'; message: string };

export interface EditorState {
  draft: InvoiceInput;
  saved: Invoice | null;
  status: Status;
  touched: ReadonlySet<string>;
  submitted: boolean;
  serverErrors: Record<string, string>;
}

export type EditorAction =
  | { type: 'edit'; recipe: Recipe }
  | { type: 'touch'; path: string }
  | { type: 'loading' }
  | { type: 'saving' }
  | { type: 'invalid' }
  | { type: 'opened'; invoice: Invoice }
  | { type: 'sent'; sentAt: string }
  | { type: 'failed'; message: string; issues?: FieldIssue[] }
  | { type: 'reset' };
