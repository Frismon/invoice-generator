import type { Db } from '../../db/client';
import { createCustomerController } from './customer.controller';
import { createCustomerRepository } from './customer.repository';
import { customerRoutes } from './customer.routes';
import { createCustomerService } from './customer.service';

export function customersModule({ db }: { db: Db }) {
  const service = createCustomerService(createCustomerRepository(db));
  return customerRoutes(createCustomerController(service));
}
