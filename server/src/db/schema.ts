import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { InvoiceInput } from '@invoice/shared';

/**
 * The invoice document is stored as JSON (`data`), which keeps the schema
 * trivial while the shape is still evolving. A few columns are pulled out
 * next to it for listing and uniqueness: number, customer, total.
 * When line items need to be queried on their own (reports, ledger), they
 * move into their own table.
 */
export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  number: text('number').notNull().unique(),
  customerName: text('customer_name').notNull(),
  totalCents: integer('total_cents').notNull(),
  data: text('data', { mode: 'json' }).$type<InvoiceInput>().notNull(),
  sentAt: text('sent_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type InvoiceRow = typeof invoices.$inferSelect;

// Kept in sync with the table above by hand; for a project this size a
// bootstrap statement is simpler than a migrations folder. With drizzle-kit
// this becomes `drizzle-kit generate` + `migrate()`.
export const BOOTSTRAP_SQL = `
  CREATE TABLE IF NOT EXISTS invoices (
    id            TEXT PRIMARY KEY,
    number        TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    total_cents   INTEGER NOT NULL,
    data          TEXT NOT NULL,
    sent_at       TEXT,
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS invoices_updated_at ON invoices (updated_at DESC);
`;
