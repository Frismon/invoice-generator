import { SendInvoiceDialog } from '@/features/invoice/components/send-invoice-dialog';
import { InvoiceEditorProvider } from '@/features/invoice/context/invoice-editor-context';
import { AppShell } from './app-shell';

export function App() {
  return (
    <InvoiceEditorProvider>
      <AppShell />
      <SendInvoiceDialog />
    </InvoiceEditorProvider>
  );
}
