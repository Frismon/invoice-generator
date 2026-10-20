import {
  InvoiceInputSchema,
  type Invoice,
  type InvoiceInput,
  type InvoiceSummary,
  type SendInvoiceRequest,
  type SendInvoiceResponse,
} from '@invoice/shared';
import { NotFoundError } from '../../common/errors';
import type { Mailer } from '../../mail/mailer';
import { renderInvoiceEmail } from './invoice-email.template';
import { renderInvoicePdf } from './invoice-pdf';
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

    async send(id: string, { to, subject, message, copyToSender }: SendInvoiceRequest): Promise<SendInvoiceResponse> {
      const invoice = getById(id);
      InvoiceInputSchema.parse(invoice);

      const senderEmail = invoice.business.email.trim();
      const cc = copyToSender && senderEmail ? senderEmail : undefined;
      const pdf = await renderInvoicePdf(invoice);

      const result = await mailer.send({
        to,
        ...(cc && { cc }),
        ...renderInvoiceEmail(invoice, { subject, message }),
        attachments: [{ filename: `${invoice.number}.pdf`, content: pdf, contentType: 'application/pdf' }],
      });
      const sentAt = result.preview ? invoice.sentAt : found(repo.markSent(id)).sentAt;
      return { ...result, sentAt, copiedTo: cc ?? null };
    },
  };
}

export type InvoiceService = ReturnType<typeof createInvoiceService>;
