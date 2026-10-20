import { describe, expect, it } from 'vitest';
import { computeTotals, lineTotalCents } from './calc';
import { addDaysISO, daysBetween } from './date';
import { formatUSD, parseMoneyInput, roundCents } from './money';
import { InvoiceDraftSchema, InvoiceInputSchema, type InvoiceInput } from './schema';

describe('computeTotals', () => {
  it('matches the brief: 2 × $50 − $10 discount + 10% tax = $99.00', () => {
    const t = computeTotals({
      items: [{ quantity: 2, unitPriceCents: 5000 }],
      discountCents: 1000,
      taxRate: 10,
    });
    expect(t.subtotalCents).toBe(10000);
    expect(t.taxableCents).toBe(9000);
    expect(t.taxCents).toBe(900);
    expect(t.totalCents).toBe(9900);
    expect(formatUSD(t.totalCents)).toBe('$99.00');
  });

  it('rounds each line before summing', () => {
    const line = { quantity: 0.333, unitPriceCents: 100 };
    const t = computeTotals({ items: [line, line, line], discountCents: 0, taxRate: 0 });
    expect(t.lineTotals).toEqual([33, 33, 33]);
    expect(t.subtotalCents).toBe(99);
  });

  it('applies discount before tax, then rounds tax', () => {
    const t = computeTotals({
      items: [{ quantity: 1, unitPriceCents: 1999 }],
      discountCents: 99,
      taxRate: 8.875,
    });
    expect(t.taxCents).toBe(169);
    expect(t.totalCents).toBe(1900 + 169);
  });

  it('clamps discount to subtotal for the preview', () => {
    const t = computeTotals({
      items: [{ quantity: 1, unitPriceCents: 500 }],
      discountCents: 900,
      taxRate: 10,
    });
    expect(t.discountCents).toBe(500);
    expect(t.totalCents).toBe(0);
  });

  it('handles an empty invoice', () => {
    expect(computeTotals({ items: [], discountCents: 0, taxRate: 20 }).totalCents).toBe(0);
  });
});

describe('money helpers', () => {
  it('rounds half away from zero despite float noise', () => {
    expect(roundCents(100.5)).toBe(101);
    expect(roundCents(1.005 * 100)).toBe(101);
    expect(lineTotalCents(1.15, 100)).toBe(115);
  });

  it('parses money input without floats', () => {
    expect(parseMoneyInput('1234.56')).toBe(123456);
    expect(parseMoneyInput('$1,234.5')).toBe(123450);
    expect(parseMoneyInput('0.1')).toBe(10);
    expect(parseMoneyInput('-5')).toBeNull();
    expect(parseMoneyInput('1.234')).toBeNull();
    expect(parseMoneyInput('')).toBeNull();
  });
});

describe('InvoiceInputSchema', () => {
  const base: InvoiceInput = {
    number: 'INV-1',
    issueDate: '2026-10-20',
    dueDate: '2026-11-03',
    business: { name: 'Northwind Studio', email: '', address: '' },
    customer: { name: 'Acme Corp', email: 'billing@example.com', address: '' },
    items: [{ id: 'a', description: 'Design', quantity: 2, unitPriceCents: 5000 }],
    discountCents: 1000,
    taxRate: 10,
    notes: '',
    customFields: [],
  };

  const pathsOf = (input: unknown) => {
    const r = InvoiceInputSchema.safeParse(input);
    return r.success ? [] : r.error.issues.map((i) => i.path.join('.'));
  };

  it('accepts a valid invoice', () => {
    expect(pathsOf(base)).toEqual([]);
  });

  it('rejects negative quantity, price, discount and tax', () => {
    expect(
      pathsOf({
        ...base,
        items: [{ ...base.items[0]!, quantity: -1, unitPriceCents: -100 }],
        discountCents: -1,
        taxRate: -5,
      }),
    ).toEqual(expect.arrayContaining(['items.0.quantity', 'items.0.unitPriceCents', 'discountCents', 'taxRate']));
  });

  it('rejects a discount larger than the subtotal', () => {
    expect(pathsOf({ ...base, discountCents: 10001 })).toEqual(['discountCents']);
  });

  it('rejects a due date before the issue date', () => {
    expect(pathsOf({ ...base, dueDate: '2026-10-01' })).toEqual(['dueDate']);
  });

  it('saves an unfinished draft but does not treat it as sendable', () => {
    const unfinished = {
      ...base,
      customer: { name: '', email: '', address: '' },
      items: [{ id: 'a', description: '', quantity: 1, unitPriceCents: 0 }],
      discountCents: 0,
    };
    expect(InvoiceDraftSchema.safeParse(unfinished).success).toBe(true);
    expect(pathsOf(unfinished)).toEqual(['customer.name', 'items.0.description']);
  });

  it('still requires an invoice number on a draft', () => {
    expect(InvoiceDraftSchema.safeParse({ ...base, number: ' ' }).success).toBe(false);
  });

  it('custom fields never affect totals', () => {
    const withFields = {
      ...base,
      customFields: [{ id: 'po', label: 'PO number', value: '4500', visible: true }],
    };
    expect(computeTotals(withFields)).toEqual(computeTotals(base));
  });
});

describe('date helpers', () => {
  it('adds days across month and DST boundaries', () => {
    expect(addDaysISO('2026-10-20', 14)).toBe('2026-11-03');
    expect(addDaysISO('2026-03-28', 2)).toBe('2026-03-30');
  });

  it('counts whole days between ISO dates', () => {
    expect(daysBetween('2026-10-20', '2026-11-19')).toBe(30);
    expect(daysBetween('2026-10-20', '2026-10-20')).toBe(0);
  });
});
