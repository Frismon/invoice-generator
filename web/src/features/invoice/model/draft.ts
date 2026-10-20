import { addDays, toISODate, type Invoice, type InvoiceInput, type LineItem } from '@invoice/shared';
import { uid } from '@/lib/id';
import { invoiceDefaults } from '../lib/invoice-defaults';

export function emptyLineItem(): LineItem {
  return { id: uid(), description: '', quantity: 1, unitPriceCents: 0 };
}

const invoiceNumber = (today: Date) =>
  `INV-${toISODate(today).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;

const SAMPLE = {
  business: {
    name: 'Northwind Studio',
    email: 'billing@northwind.example',
    address: '120 Harbor Street\nPortland, OR 97201',
  },
  items: () => [{ id: uid(), description: 'Brand identity design', quantity: 2, unitPriceCents: 5000 }],
  discountCents: 1000,
  taxRate: 10,
  termDays: 14,
  notes: 'Payment due within 14 days. Thank you for your business.',
};

export function newDraft(): InvoiceInput {
  const today = new Date();
  const saved = invoiceDefaults.read();
  const base = {
    number: invoiceNumber(today),
    issueDate: toISODate(today),
    customer: { name: '', email: '', address: '' },
    customFields: [],
  };

  if (!saved) {
    return {
      ...base,
      dueDate: toISODate(addDays(today, SAMPLE.termDays)),
      business: SAMPLE.business,
      items: SAMPLE.items(),
      discountCents: SAMPLE.discountCents,
      taxRate: SAMPLE.taxRate,
      notes: SAMPLE.notes,
    };
  }

  return {
    ...base,
    dueDate: toISODate(addDays(today, saved.termDays)),
    business: saved.business,
    items: [emptyLineItem()],
    discountCents: 0,
    taxRate: saved.taxRate,
    notes: saved.notes,
  };
}

export function toDraft(invoice: Invoice): InvoiceInput {
  const { id: _id, createdAt: _c, updatedAt: _u, sentAt: _s, ...input } = invoice;
  return input;
}
