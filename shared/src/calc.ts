import { roundCents } from './money';

export interface CalcLine {
  quantity: number;
  unitPriceCents: number;
}

export interface CalcInput {
  items: CalcLine[];
  discountCents: number;
  taxRate: number;
}

export interface Totals {
  lineTotals: number[];
  subtotalCents: number;
  discountCents: number;
  taxableCents: number;
  taxCents: number;
  totalCents: number;
}

export function lineTotalCents(quantity: number, unitPriceCents: number): number {
  return roundCents(quantity * unitPriceCents);
}

export function computeTotals(input: CalcInput): Totals {
  const lineTotals = input.items.map((item) =>
    lineTotalCents(Math.max(item.quantity, 0), Math.max(item.unitPriceCents, 0)),
  );
  const subtotalCents = lineTotals.reduce((sum, cents) => sum + cents, 0);
  const discountCents = Math.min(Math.max(input.discountCents, 0), subtotalCents);
  const taxableCents = subtotalCents - discountCents;
  const taxCents = roundCents((taxableCents * Math.max(input.taxRate, 0)) / 100);

  return {
    lineTotals,
    subtotalCents,
    discountCents,
    taxableCents,
    taxCents,
    totalCents: taxableCents + taxCents,
  };
}
