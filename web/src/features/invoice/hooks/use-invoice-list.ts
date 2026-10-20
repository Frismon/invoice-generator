import { useCallback, useEffect, useState } from 'react';
import type { InvoiceSummary } from '@invoice/shared';
import { invoiceApi } from '../api/invoice-api';

export function useInvoiceList() {
  const [items, setItems] = useState<InvoiceSummary[]>([]);

  const refresh = useCallback(() => {
    invoiceApi.list().then(setItems).catch(() => {});
  }, []);

  useEffect(refresh, [refresh]);

  return { items, refresh };
}
