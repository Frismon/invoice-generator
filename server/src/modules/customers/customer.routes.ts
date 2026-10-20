import type { FastifyInstance } from 'fastify';
import type { CustomerController } from './customer.controller';

export function customerRoutes(controller: CustomerController) {
  return async (app: FastifyInstance) => {
    app.get('/', controller.list);
  };
}
