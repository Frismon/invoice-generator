import { addDaysISO, daysBetween, type InvoiceInput } from '@invoice/shared';

export const PAYMENT_TERMS = [
  { days: 0, label: 'On receipt' },
  { days: 7, label: '7 days' },
  { days: 14, label: '14 days' },
  { days: 30, label: '30 days' },
] as const;

const isISODate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export function termDays(draft: InvoiceInput): number | null {
  if (!isISODate(draft.issueDate) || !isISODate(draft.dueDate)) return null;
  return daysBetween(draft.issueDate, draft.dueDate);
}

export function withTerm(draft: InvoiceInput, days: number): InvoiceInput {
  if (!isISODate(draft.issueDate)) return draft;
  return { ...draft, dueDate: addDaysISO(draft.issueDate, days) };
}

export function withIssueDate(draft: InvoiceInput, issueDate: string): InvoiceInput {
  const days = termDays(draft);
  if (days === null || !isISODate(issueDate)) return { ...draft, issueDate };
  return { ...draft, issueDate, dueDate: addDaysISO(issueDate, days) };
}
