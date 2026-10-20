import type { FastifyInstance } from 'fastify';
import type { InvoiceController } from './invoice.controller';

export function invoiceRoutes(controller: InvoiceController) {
  return async (app: FastifyInstance) => {
    app.get('/', controller.list);
    app.get('/:id', controller.getById);
    app.post('/', controller.create);
    app.put('/:id', controller.update);
    app.delete('/:id', controller.remove);
    app.post('/:id/send', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, controller.send);
  };
}
