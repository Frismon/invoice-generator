import type { InvoiceInput } from '@invoice/shared';
import { Field } from '@/components/form/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PAYMENT_TERMS, termDays, withIssueDate, withTerm } from '@/features/invoice/model/terms';
import type { Recipe } from '@/features/invoice/model/types';

interface DatesFieldsProps {
  draft: InvoiceInput;
  update: (recipe: Recipe) => void;
}

export function DatesFields({ draft, update }: DatesFieldsProps) {
  const current = termDays(draft);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field path="number" label="Invoice number">
          {(p) => (
            <Input
              {...p}
              value={draft.number}
              className="font-mono"
              onChange={(e) => update((d) => ({ ...d, number: e.target.value }))}
            />
          )}
        </Field>
        <Field path="issueDate" label="Issue date">
          {(p) => (
            <Input
              {...p}
              type="date"
              value={draft.issueDate}
              onChange={(e) => update((d) => withIssueDate(d, e.target.value))}
            />
          )}
        </Field>
        <Field path="dueDate" label="Due date">
          {(p) => (
            <Input
              {...p}
              type="date"
              min={draft.issueDate || undefined}
              value={draft.dueDate}
              onChange={(e) => update((d) => ({ ...d, dueDate: e.target.value }))}
            />
          )}
        </Field>
      </div>

      <div role="group" aria-label="Payment terms" className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[13px] text-muted-foreground">Payment due</span>
        {PAYMENT_TERMS.map((term) => (
          <Button
            key={term.days}
            size="sm"
            variant={current === term.days ? 'secondary' : 'ghost'}
            aria-pressed={current === term.days}
            onClick={() => update((d) => withTerm(d, term.days))}
          >
            {term.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
