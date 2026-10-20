import type { Party } from '@invoice/shared';
import type { CustomerRepository } from './customer.repository';

const key = (name: string) => name.trim().toLowerCase();

export function createCustomerService(repo: CustomerRepository) {
  return {
    list(): Party[] {
      const byName = new Map<string, Party>();
      for (const customer of repo.recentFromInvoices(500)) {
        if (!byName.has(key(customer.name))) byName.set(key(customer.name), customer);
      }
      return [...byName.values()];
    },
  };
}

export type CustomerService = ReturnType<typeof createCustomerService>;
