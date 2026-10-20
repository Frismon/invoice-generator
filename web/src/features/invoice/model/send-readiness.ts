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

  const problems = issues.filter((i) => !(i.path === 'customer.name' && !draft.customer.name.trim())).length;
  if (problems) return { canSend: false, hint: `Fix ${problems} ${problems === 1 ? 'issue' : 'issues'} to send` };
  if (missing.length) return { canSend: false, hint: `Add ${missing.join(', ')}` };
  return { canSend: true, hint: '' };
}
