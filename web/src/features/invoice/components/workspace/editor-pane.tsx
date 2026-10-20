import { FormStateProvider } from '@/components/form/form-context';
import { cn } from '@/lib/utils';
import { useEditor } from '../../context/invoice-editor-context';
import { InvoiceEditor } from '../editor/invoice-editor';

export function EditorPane({ hidden }: { hidden: boolean }) {
  const { draft, totals, customers, update, save, markTouched, errorFor } = useEditor();

  return (
    <form
      id="pane-edit"
      role="tabpanel"
      aria-labelledby="tab-edit"
      noValidate
      className={cn(
        'min-w-0 lg:h-full lg:overflow-y-auto lg:py-6 lg:pr-4 lg:[scrollbar-gutter:stable] print:hidden',
        hidden && 'max-lg:hidden',
      )}
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      onBlur={(e) => {
        const name = (e.target as Element).getAttribute('name');
        if (name) markTouched(name);
      }}
    >
      <FormStateProvider errorFor={errorFor}>
        <InvoiceEditor draft={draft} totals={totals} customers={customers} update={update} />
      </FormStateProvider>
    </form>
  );
}
