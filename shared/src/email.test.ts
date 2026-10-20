import { describe, expect, it } from 'vitest';
import { defaultEmailMessage, defaultEmailSubject } from './email';
import type { InvoiceInput } from './schema';

const base: InvoiceInput = {
  number: 'INV-2026-0042',
  issueDate: '2026-10-20',
  dueDate: '2026-11-03',
  business: { name: 'Northwind Studio', email: 'hello@example.com', address: '' },
  customer: { name: 'Acme Corp', email: 'billing@example.com', address: '' },
  items: [{ id: 'a', description: 'Design', quantity: 2, unitPriceCents: 5000 }],
  discountCents: 1000,
  taxRate: 10,
  notes: '',
  customFields: [],
};

const noBusiness = { ...base, business: { ...base.business, name: '  ' } };

describe('defaultEmailSubject', () => {
  it('names the invoice and the business', () => {
    expect(defaultEmailSubject(base)).toBe('Invoice INV-2026-0042 from Northwind Studio');
  });

  it('drops the business when it has no name', () => {
    expect(defaultEmailSubject(noBusiness)).toBe('Invoice INV-2026-0042');
  });
});

describe('defaultEmailMessage', () => {
  it('states the amount and due date and signs with the business', () => {
    expect(defaultEmailMessage(base)).toBe(
      'Hi there,\n\nHere’s invoice INV-2026-0042 for $99.00, due Nov 3, 2026. The PDF is attached.\n\nThanks,\nNorthwind Studio',
    );
  });

  it('ends with just "Thanks," when the business has no name', () => {
    expect(defaultEmailMessage(noBusiness).endsWith('The PDF is attached.\n\nThanks,')).toBe(true);
  });
});
