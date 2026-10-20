import type { FastifyReply, FastifyRequest } from 'fastify';
import { InvoiceInputSchema, SendInvoiceSchema } from '@invoice/shared';
import type { InvoiceService } from './invoice.service';

type ByIdRequest = FastifyRequest<{ Params: { id: string } }>;

export function createInvoiceController(service: InvoiceService) {
  return {
    list: async () => service.list(),

    getById: async (req: ByIdRequest) => service.getById(req.params.id),

    create: async (req: FastifyRequest, reply: FastifyReply) => {
      const input = InvoiceInputSchema.parse(req.body);
      return reply.status(201).send(service.create(input));
    },

    update: async (req: ByIdRequest) => {
      const input = InvoiceInputSchema.parse(req.body);
      return service.update(req.params.id, input);
    },

    remove: async (req: ByIdRequest, reply: FastifyReply) => {
      service.remove(req.params.id);
      return reply.status(204).send();
    },

    send: async (req: ByIdRequest) => {
      const { to } = SendInvoiceSchema.parse(req.body);
      return service.send(req.params.id, to);
    },
  };
}

export type InvoiceController = ReturnType<typeof createInvoiceController>;
