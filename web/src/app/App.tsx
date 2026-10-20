import { InvoicesPage } from '@/features/invoice/components/library/invoices-page';
import { SendInvoiceDialog } from '@/features/invoice/components/send-invoice-dialog';
import { InvoiceEditorProvider } from '@/features/invoice/context/invoice-editor-context';
import { useRoute } from '@/lib/router';
import { AppShell } from './app-shell';

export function App() {
  const route = useRoute();

  return (
    <InvoiceEditorProvider>
      {route === 'invoices' ? <InvoicesPage /> : <AppShell />}
      <SendInvoiceDialog />
    </InvoiceEditorProvider>
  );
}
