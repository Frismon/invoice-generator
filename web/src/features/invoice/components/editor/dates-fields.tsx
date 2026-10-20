import type { InvoiceInput } from '@invoice/shared';
import { DatePicker } from '@/components/form/date-picker';
import { Field } from '@/components/form/field';
import { Input } from '@/components/ui/input';
import { PAYMENT_TERMS, termDays, withIssueDate, withTerm } from '@/features/invoice/model/terms';
import type { Recipe } from '@/features/invoice/model/types';
import { cn } from '@/lib/utils';

interface DatesFieldsProps {
  draft: InvoiceInput;
  update: (recipe: Recipe) => void;
}

export function DatesFields({ draft, update }: DatesFieldsProps) {
  const current = termDays(draft);

  return (
    <div className="flex flex-col gap-3.5">
      <div role="group" aria-label="Payment terms" className="grid grid-cols-4 gap-1 rounded-[10px] bg-secondary p-1">
        {PAYMENT_TERMS.map((term) => {
          const active = current === term.days;
          return (
            <button
              key={term.days}
              type="button"
              aria-pressed={active}
              onClick={() => update((d) => withTerm(d, term.days))}
              className={cn(
                'h-9 rounded-[7px] text-[13px] transition-colors',
                active
                  ? 'bg-white font-semibold text-foreground shadow-[0_1px_2px_rgba(60,45,20,.12)]'
                  : 'font-medium text-muted-foreground hover:text-foreground',
              )}
            >
              {term.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field path="issueDate" label="Issue date">
          {(p) => (
            <DatePicker {...p} value={draft.issueDate} onChange={(iso) => update((d) => withIssueDate(d, iso))} />
          )}
        </Field>
        <Field path="dueDate" label="Due date">
          {(p) => (
            <DatePicker
              {...p}
              value={draft.dueDate}
              min={draft.issueDate}
              rangeStart={draft.issueDate}
              onChange={(iso) => update((d) => ({ ...d, dueDate: iso }))}
            />
          )}
        </Field>
        <Field path="number" label="Invoice number">
          {(p) => (
            <Input
              {...p}
              value={draft.number}
              className="font-mono text-[13px]"
              onChange={(e) => update((d) => ({ ...d, number: e.target.value }))}
            />
          )}
        </Field>
      </div>
    </div>
  );
}
