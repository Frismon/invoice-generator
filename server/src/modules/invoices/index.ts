import type { Db } from '../../db/client';
import type { Mailer } from '../../mail/mailer';
import { createInvoiceController } from './invoice.controller';
import { createInvoiceRepository } from './invoice.repository';
import { invoiceRoutes } from './invoice.routes';
import { createInvoiceService } from './invoice.service';

export function invoicesModule({ db, mailer }: { db: Db; mailer: Mailer }) {
  const repo = createInvoiceRepository(db);
  const service = createInvoiceService({ repo, mailer });
  return invoiceRoutes(createInvoiceController(service));
}
