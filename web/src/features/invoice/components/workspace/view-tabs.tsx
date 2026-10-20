import { cn } from '@/lib/utils';

export type View = 'edit' | 'preview';

const VIEWS: { id: View; label: string }[] = [
  { id: 'edit', label: 'Edit' },
  { id: 'preview', label: 'Preview' },
];

interface ViewTabsProps {
  view: View;
  onChange: (view: View) => void;
}

export function ViewTabs({ view, onChange }: ViewTabsProps) {
  return (
    <div className="px-4 lg:hidden print:hidden">
      <div role="tablist" aria-label="View" className="grid grid-cols-2 gap-1 rounded-xl bg-[#eae2d4] p-1">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            id={`tab-${v.id}`}
            aria-selected={view === v.id}
            aria-controls={`pane-${v.id}`}
            onClick={() => onChange(v.id)}
            className={cn(
              'h-10 rounded-[9px] text-sm transition-colors',
              view === v.id
                ? 'bg-white font-semibold text-foreground shadow-[0_1px_2px_rgba(60,45,20,.12)]'
                : 'font-medium text-muted-foreground',
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
