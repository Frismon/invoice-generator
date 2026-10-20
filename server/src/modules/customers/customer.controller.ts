import type { CustomerService } from './customer.service';

export function createCustomerController(service: CustomerService) {
  return {
    list: async () => service.list(),
  };
}

export type CustomerController = ReturnType<typeof createCustomerController>;
