import { Save } from 'lucide-react';
import { formatUSD } from '@invoice/shared';
import { Button } from '@/components/ui/button';
import { useEditor } from '../../context/invoice-editor-context';

export function MobileActionBar() {
  const { totals, save, status, isDirty } = useEditor();

  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur lg:hidden print:hidden">
      <div className="flex flex-col">
        <span className="text-[11px] text-muted-foreground uppercase">Total due</span>
        <span className="tabular text-base font-semibold">{formatUSD(totals.totalCents)}</span>
      </div>
      <Button size="lg" onClick={() => void save()} disabled={status.kind === 'saving' || !isDirty}>
        <Save /> {status.kind === 'saving' ? 'Saving…' : 'Save'}
      </Button>
    </div>
  );
}
