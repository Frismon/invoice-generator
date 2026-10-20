import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import { computeTotals, type Invoice, type InvoiceInput, type InvoiceSummary } from '@invoice/shared';
import { ConflictError } from '../../common/errors';
import { isUniqueViolation, type Db } from '../../db/client';
import { invoices, type InvoiceRow } from '../../db/schema';

function toInvoice(row: InvoiceRow): Invoice {
  return {
    ...row.data,
    id: row.id,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    sentAt: row.sentAt,
  };
}

function derived(input: InvoiceInput) {
  return {
    number: input.number,
    customerName: input.customer.name,
    totalCents: computeTotals(input).totalCents,
    data: input,
  };
}

function withUniqueNumber<T>(write: () => T): T {
  try {
    return write();
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    throw new ConflictError('An invoice with this number already exists', [
      { path: 'number', message: 'This invoice number is already used' },
    ]);
  }
}

export function createInvoiceRepository(db: Db) {
  return {
    list(): InvoiceSummary[] {
      return db
        .select({
          id: invoices.id,
          number: invoices.number,
          customerName: invoices.customerName,
          totalCents: invoices.totalCents,
          data: invoices.data,
          updatedAt: invoices.updatedAt,
          sentAt: invoices.sentAt,
        })
        .from(invoices)
        .orderBy(desc(invoices.updatedAt))
        .limit(200)
        .all()
        .map(({ data, ...row }) => ({ ...row, issueDate: data.issueDate, dueDate: data.dueDate }));
    },

    findById(id: string): Invoice | undefined {
      const row = db.select().from(invoices).where(eq(invoices.id, id)).get();
      return row && toInvoice(row);
    },

    create(input: InvoiceInput): Invoice {
      const now = new Date().toISOString();
      const row = withUniqueNumber(() =>
        db
          .insert(invoices)
          .values({ id: randomUUID(), ...derived(input), sentAt: null, createdAt: now, updatedAt: now })
          .returning()
          .get(),
      );
      return toInvoice(row);
    },

    update(id: string, input: InvoiceInput): Invoice | undefined {
      const row = withUniqueNumber(() =>
        db
          .update(invoices)
          .set({ ...derived(input), updatedAt: new Date().toISOString() })
          .where(eq(invoices.id, id))
          .returning()
          .get(),
      );
      return row && toInvoice(row);
    },

    remove(id: string): boolean {
      return db.delete(invoices).where(eq(invoices.id, id)).run().changes > 0;
    },

    markSent(id: string): Invoice | undefined {
      const row = db
        .update(invoices)
        .set({ sentAt: new Date().toISOString() })
        .where(eq(invoices.id, id))
        .returning()
        .get();
      return row && toInvoice(row);
    },
  };
}

export type InvoiceRepository = ReturnType<typeof createInvoiceRepository>;
