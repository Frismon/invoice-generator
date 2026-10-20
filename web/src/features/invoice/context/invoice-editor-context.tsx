import { createContext, useCallback, useContext, type ReactNode } from 'react';
import type { InvoiceSummary, Party } from '@invoice/shared';
import { useCustomers } from '../hooks/use-customers';
import { useInvoiceEditor, type InvoiceEditor } from '../hooks/use-invoice-editor';
import { useInvoiceList } from '../hooks/use-invoice-list';

interface InvoiceEditorContextValue extends InvoiceEditor {
  invoices: InvoiceSummary[];
  customers: Party[];
}

const InvoiceEditorContext = createContext<InvoiceEditorContextValue | null>(null);

export function InvoiceEditorProvider({ children }: { children: ReactNode }) {
  const list = useInvoiceList();
  const customers = useCustomers();
  const onSaved = useCallback(() => {
    list.refresh();
    customers.refresh();
  }, [list.refresh, customers.refresh]);
  const editor = useInvoiceEditor({ onSaved });

  return (
    <InvoiceEditorContext.Provider value={{ ...editor, invoices: list.items, customers: customers.items }}>
      {children}
    </InvoiceEditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(InvoiceEditorContext);
  if (!ctx) throw new Error('useEditor must be used inside <InvoiceEditorProvider>');
  return ctx;
}
