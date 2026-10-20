import { formatUSD } from '@invoice/shared';
import { cn } from '@/lib/utils';
import { useEditor } from '../../context/invoice-editor-context';

export type View = 'edit' | 'preview';

const VIEWS: View[] = ['edit', 'preview'];

interface ViewTabsProps {
  view: View;
  onChange: (view: View) => void;
}

export function ViewTabs({ view, onChange }: ViewTabsProps) {
  const { totals } = useEditor();

  return (
    <div role="tablist" aria-label="View" className="flex border-b px-4 lg:hidden print:hidden">
      {VIEWS.map((v) => (
        <button
          key={v}
          role="tab"
          id={`tab-${v}`}
          aria-selected={view === v}
          aria-controls={`pane-${v}`}
          onClick={() => onChange(v)}
          className={cn(
            '-mb-px border-b-2 px-3 py-2.5 text-[13px] font-medium',
            view === v ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground',
          )}
        >
          {v === 'edit' ? 'Edit' : `Preview · ${formatUSD(totals.totalCents)}`}
        </button>
      ))}
    </div>
  );
}
