import { useId, useState, type ReactNode } from 'react';
import { Pencil, Plus } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  meta?: string;
  summary?: string;
  forceOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({ title, meta, summary, forceOpen = false, children }: CollapsibleSectionProps) {
  const [editing, setEditing] = useState(false);
  const open = editing || forceOpen;
  const headingId = useId();
  const panelId = useId();

  return (
    <section aria-labelledby={headingId} className="rounded-[14px] border bg-card px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-baseline gap-3">
          <h2 id={headingId} className="shrink-0 text-[19px] leading-tight">
            {title}
          </h2>
          {!open && summary && <span className="truncate text-[13px] text-muted-foreground">{summary}</span>}
          {open && meta && <span className="ml-auto text-[12.5px] text-muted-foreground">{meta}</span>}
        </div>
        {!forceOpen && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setEditing(!open)}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-muted-foreground hover:bg-hover-soft hover:text-foreground"
          >
            {open ? null : summary ? <Pencil aria-hidden className="size-3.5" /> : <Plus aria-hidden className="size-3.5" />}
            {open ? 'Done' : summary ? 'Edit' : 'Add'}
          </button>
        )}
      </div>
      {open && (
        <div id={panelId} className="pt-3.5 pb-1">
          {children}
        </div>
      )}
    </section>
  );
}
