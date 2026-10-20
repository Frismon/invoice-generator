import { desc, sql } from 'drizzle-orm';
import type { Party } from '@invoice/shared';
import type { Db } from '../../db/client';
import { invoices } from '../../db/schema';

export function createCustomerRepository(db: Db) {
  return {
    recentFromInvoices(limit: number): Party[] {
      return db
        .select({ data: invoices.data })
        .from(invoices)
        .orderBy(desc(invoices.updatedAt), desc(sql`rowid`))
        .limit(limit)
        .all()
        .map((row) => row.data.customer);
    },
  };
}

export type CustomerRepository = ReturnType<typeof createCustomerRepository>;
