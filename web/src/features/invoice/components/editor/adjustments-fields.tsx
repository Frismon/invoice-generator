import { formatUSD, type InvoiceInput, type Totals } from '@invoice/shared';
import { Field } from '@/components/form/field';
import { useFormState } from '@/components/form/form-context';
import { NumericInput } from '@/components/form/numeric-input';
import type { Recipe } from '@/features/invoice/model/types';

interface AdjustmentsFieldsProps {
  draft: InvoiceInput;
  totals: Totals;
  update: (recipe: Recipe) => void;
}

export function AdjustmentsFields({ draft, totals, update }: AdjustmentsFieldsProps) {
  const { errorFor } = useFormState();
  const discountShown = !errorFor('discountCents') && totals.discountCents > 0;

  return (
    <>
      <div className="mt-4 grid gap-x-4 gap-y-3 border-t border-hairline pt-4 sm:grid-cols-2">
        <Field
          path="discountCents"
          label={<>Discount <span className="font-normal text-muted-foreground">fixed amount</span></>}
          hint={
            discountShown
              ? `−${formatUSD(totals.discountCents)} off ${formatUSD(totals.subtotalCents)}`
              : 'Leave empty for no discount'
          }
        >
          {(p) => (
            <NumericInput
              {...p}
              kind="money"
              prefix="$"
              value={draft.discountCents}
              onValueChange={(v) => update((d) => ({ ...d, discountCents: v }))}
            />
          )}
        </Field>
        <Field
          path="taxRate"
          label="Tax rate"
          hint={
            totals.taxCents > 0
              ? `+${formatUSD(totals.taxCents)} on ${formatUSD(totals.taxableCents)} after discount`
              : 'Applied after discount'
          }
        >
          {(p) => (
            <NumericInput
              {...p}
              kind="decimal"
              decimals={3}
              suffix="%"
              value={draft.taxRate}
              onValueChange={(v) => update((d) => ({ ...d, taxRate: v }))}
            />
          )}
        </Field>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3 rounded-[10px] bg-muted px-3.5 py-3">
        <span className="text-[13px] text-muted-foreground tabular">
          Subtotal {formatUSD(totals.subtotalCents)} · Tax {formatUSD(totals.taxCents)}
        </span>
        <span className="flex items-baseline gap-2">
          <span className="text-[13px] font-medium">Total</span>
          <strong className="font-heading text-xl font-semibold tabular">{formatUSD(totals.totalCents)}</strong>
        </span>
      </div>
    </>
  );
}
