import { HeaderActions } from './header-actions';
import { InvoicePicker } from './invoice-picker';
import { SaveStatus } from './save-status';

interface AppHeaderProps {
  onNew: () => void;
}

export function AppHeader({ onNew }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-background px-4 py-2.5 sm:px-6 print:hidden">
      <h1 className="text-sm font-semibold">Invoices</h1>
      <InvoicePicker />
      <SaveStatus />
      <HeaderActions onNew={onNew} />
    </header>
  );
}
