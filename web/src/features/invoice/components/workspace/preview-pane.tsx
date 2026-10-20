import { cn } from '@/lib/utils';
import { useEditor } from '../../context/invoice-editor-context';
import { InvoicePreview } from '../preview/invoice-preview';

export function PreviewPane({ hidden }: { hidden: boolean }) {
  const { draft, totals } = useEditor();

  return (
    <section
      id="pane-preview"
      role="tabpanel"
      aria-labelledby="tab-preview"
      className={cn(
        'min-w-0 bg-muted p-4 sm:p-6',
        'lg:sticky lg:top-[53px] lg:h-[calc(100dvh-53px)] lg:overflow-y-auto',
        'print:static! print:block! print:h-auto print:overflow-visible print:bg-white print:p-0',
        hidden && 'max-lg:hidden',
      )}
    >
      <InvoicePreview
        invoice={draft}
        totals={totals}
        className="max-w-[52rem] border shadow-sm print:max-w-none print:border-0 print:shadow-none"
      />
    </section>
  );
}
