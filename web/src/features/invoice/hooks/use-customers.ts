import { useCallback, useEffect, useState } from 'react';
import type { Party } from '@invoice/shared';
import { customerApi } from '../api/customer-api';

export function useCustomers() {
  const [items, setItems] = useState<Party[]>([]);

  const refresh = useCallback(() => {
    customerApi.list().then(setItems).catch(() => {});
  }, []);

  useEffect(refresh, [refresh]);

  return { items, refresh };
}
