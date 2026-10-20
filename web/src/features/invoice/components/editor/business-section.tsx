import { useState } from 'react';
import { Pencil } from 'lucide-react';
import type { Party } from '@invoice/shared';
import { useFormState } from '@/components/form/form-context';
import { PartyFields } from './party-fields';

interface BusinessSectionProps {
  value: Party;
  onChange: (field: keyof Party, value: string) => void;
  isSample?: boolean;
}

export function BusinessSection({ value, onChange, isSample = false }: BusinessSectionProps) {
  const { errorFor } = useFormState();
  const [editing, setEditing] = useState(false);
  const hasError = (['name', 'email', 'address'] as const).some((f) => errorFor(`business.${f}`));
  const forced = hasError || !value.name.trim();
  const open = editing || forced;

  return (
    <section aria-labelledby="h-from" className="rounded-[14px] border bg-card p-5 max-lg:px-4 max-lg:py-3.5">
      <div className="flex items-center gap-3">
        <h2 id="h-from" className="w-11 shrink-0 font-sans text-[13px] font-semibold tracking-normal text-muted-foreground">
          From
        </h2>
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          <span className="truncate font-semibold">{value.name || 'Your business'}</span>
          {value.email && <span className="truncate text-muted-foreground max-sm:hidden">{value.email}</span>}
          {isSample && (
            <span className="shrink-0 rounded bg-sample px-1.5 py-0.5 text-[11px] font-semibold tracking-[0.04em] text-sample-foreground uppercase">
              Sample
            </span>
          )}
        </div>
        {!forced && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls="from-fields"
            onClick={() => setEditing(!open)}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-muted-foreground hover:bg-hover-soft hover:text-foreground"
          >
            <Pencil aria-hidden className="size-3.5" />
            {open ? 'Done' : 'Edit'}
          </button>
        )}
      </div>
      {open && (
        <div id="from-fields" className="mt-3.5 border-t border-hairline pt-3.5">
          <PartyFields prefix="business" value={value} onChange={onChange} />
        </div>
      )}
    </section>
  );
}
