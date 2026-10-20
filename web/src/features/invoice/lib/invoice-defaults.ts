import { PartySchema, type InvoiceInput, type Party } from '@invoice/shared';

const KEY = 'invoice-defaults';

export interface InvoiceDefaults {
  business: Party;
  taxRate: number;
  termDays: number;
  notes: string;
}

function parse(raw: unknown): InvoiceDefaults | null {
  if (!raw || typeof raw !== 'object') return null;
  const { business, taxRate, termDays, notes } = raw as Record<string, unknown>;
  const party = PartySchema.safeParse(business);
  if (!party.success || typeof taxRate !== 'number' || typeof termDays !== 'number' || typeof notes !== 'string') {
    return null;
  }
  return { business: party.data, taxRate, termDays, notes };
}

export const invoiceDefaults = {
  read(): InvoiceDefaults | null {
    try {
      return parse(JSON.parse(localStorage.getItem(KEY) ?? 'null'));
    } catch {
      return null;
    }
  },

  write(input: InvoiceInput, termDays: number | null) {
    const defaults: InvoiceDefaults = {
      business: input.business,
      taxRate: input.taxRate,
      termDays: termDays ?? 14,
      notes: input.notes,
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(defaults));
    } catch {}
  },
};
