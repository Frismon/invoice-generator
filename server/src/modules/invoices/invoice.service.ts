import {
  InvoiceInputSchema,
  type Invoice,
  type InvoiceInput,
  type InvoiceSummary,
  type SendInvoiceResponse,
} from '@invoice/shared';
import { NotFoundError } from '../../common/errors';
import type { Mailer } from '../../mail/mailer';
import { renderInvoiceEmail } from './invoice-email.template';
import type { InvoiceRepository } from './invoice.repository';

interface InvoiceServiceDeps {
  repo: InvoiceRepository;
  mailer: Mailer;
}

export function createInvoiceService({ repo, mailer }: InvoiceServiceDeps) {
  const found = (invoice: Invoice | undefined): Invoice => {
    if (!invoice) throw new NotFoundError('Invoice not found');
    return invoice;
  };

  const getById = (id: string): Invoice => found(repo.findById(id));

  return {
    list(): InvoiceSummary[] {
      return repo.list();
    },

    getById,

    create(input: InvoiceInput): Invoice {
      return repo.create(input);
    },

    update(id: string, input: InvoiceInput): Invoice {
      return found(repo.update(id, input));
    },

    remove(id: string): void {
      if (!repo.remove(id)) throw new NotFoundError('Invoice not found');
    },

    async send(id: string, to: string): Promise<SendInvoiceResponse> {
      const invoice = getById(id);
      InvoiceInputSchema.parse(invoice);

      const result = await mailer.send({ to, ...renderInvoiceEmail(invoice) });
      const sentAt = result.preview ? invoice.sentAt : found(repo.markSent(id)).sentAt;
      return { ...result, sentAt };
    },
  };
}

export type InvoiceService = ReturnType<typeof createInvoiceService>;
