import { computeTotals } from './calc';
import { formatDate } from './date';
import { formatUSD } from './money';
import type { InvoiceInput } from './schema';

export function defaultEmailSubject(invoice: InvoiceInput): string {
  const business = invoice.business.name.trim();
  const number = invoice.number.trim();
  return business ? `Invoice ${number} from ${business}` : `Invoice ${number}`;
}

export function defaultEmailMessage(invoice: InvoiceInput): string {
  const total = formatUSD(computeTotals(invoice).totalCents);
  const business = invoice.business.name.trim();
  return [
    'Hi there,',
    '',
    `Here’s invoice ${invoice.number.trim()} for ${total}, due ${formatDate(invoice.dueDate)}. The PDF is attached.`,
    '',
    business ? `Thanks,\n${business}` : 'Thanks,',
  ].join('\n');
}
