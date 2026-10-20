import type { FieldIssue, InvoiceInput } from '@invoice/shared';

export interface SendReadiness {
  canSend: boolean;
  hint: string;
}

export function sendReadiness(draft: InvoiceInput, issues: FieldIssue[]): SendReadiness {
  const missing: string[] = [];
  if (!draft.customer.name.trim()) missing.push('a customer name');
  if (!draft.customer.email.trim()) missing.push('an email');
  if (!draft.items.length) missing.push('a line item');

  if (missing.length) return { canSend: false, hint: `Add ${missing.join(', ')}` };
  // Other problems show on their fields once edited; no extra hint, the button just stays disabled.
  return { canSend: issues.length === 0, hint: '' };
}
