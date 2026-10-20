import { useState, type KeyboardEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { formatUSD, type LineItem } from '@invoice/shared';
import { toId } from '@/components/form/field';
import { useFormState } from '@/components/form/form-context';
import { NumericInput } from '@/components/form/numeric-input';
import { Input } from '@/components/ui/input';
import { emptyLineItem } from '@/features/invoice/model/draft';
import type { Recipe } from '@/features/invoice/model/types';
import { cn } from '@/lib/utils';

const columns = 'sm:grid-cols-[minmax(0,1fr)_68px_108px_92px]';

interface LineItemsEditorProps {
  items: LineItem[];
  lineTotals: number[];
  update: (recipe: Recipe) => void;
}

export function LineItemsEditor({ items, lineTotals, update }: LineItemsEditorProps) {
  const { errorFor } = useFormState();
  const [focusId, setFocusId] = useState<string | null>(null);

  const patch = (id: string, changes: Partial<LineItem>) =>
    update((d) => ({ ...d, items: d.items.map((it) => (it.id === id ? { ...it, ...changes } : it)) }));

  const add = () => {
    const item = emptyLineItem();
    setFocusId(item.id);
    update((d) => ({ ...d, items: [...d.items, item] }));
  };

  const remove = (id: string) => update((d) => ({ ...d, items: d.items.filter((it) => it.id !== id) }));

  const onEnter = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' || !(e.target instanceof HTMLInputElement)) return;
    e.preventDefault();
    const index = Number(e.target.closest('[data-index]')?.getAttribute('data-index'));
    if (index === items.length - 1) add();
    else document.getElementById(toId(`items.${index + 1}.description`))?.focus();
  };

  const control = (path: string) => {
    const error = errorFor(path);
    const id = toId(path);
    return {
      id,
      name: path,
      'aria-invalid': Boolean(error),
      'aria-describedby': error ? `${id}-error` : undefined,
      error,
    };
  };

  return (
    <div className="flex flex-col">
      <div
        aria-hidden
        className={cn('hidden gap-2 pb-1.5 text-[11.5px] font-semibold tracking-[0.06em] text-muted-foreground uppercase sm:grid', columns)}
      >
        <span>Description</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Unit price</span>
        <span className="text-right">Amount</span>
      </div>

      <div role="list" className="flex flex-col gap-2" onKeyDown={onEnter}>
        {items.map((item, i) => {
          const desc = control(`items.${i}.description`);
          const qty = control(`items.${i}.quantity`);
          const price = control(`items.${i}.unitPriceCents`);
          const errors = [desc, qty, price].filter((c) => c.error);
          return (
            <div
              key={item.id}
              role="listitem"
              data-index={i}
              className="flex flex-col gap-1 max-sm:rounded-xl max-sm:border max-sm:bg-white max-sm:p-3"
            >
              <div className={cn('grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-2', columns)}>
                <div className="relative col-span-3 min-w-0 sm:col-span-1">
                  <label htmlFor={desc.id} className="sr-only">
                    Description, line {i + 1}
                  </label>
                  <Input
                    id={desc.id}
                    name={desc.name}
                    aria-invalid={desc['aria-invalid']}
                    aria-describedby={desc['aria-describedby']}
                    value={item.description}
                    placeholder="What you delivered"
                    autoFocus={item.id === focusId}
                    className="pr-10"
                    onChange={(e) => patch(item.id, { description: e.target.value })}
                  />
                  <button
                    type="button"
                    aria-label={`Remove line ${i + 1}`}
                    title={items.length === 1 ? 'An invoice needs at least one line' : 'Remove line'}
                    disabled={items.length === 1}
                    onClick={() => remove(item.id)}
                    className="absolute top-1 right-1 flex size-8 items-center justify-center rounded-md text-subtle hover:bg-destructive-soft hover:text-destructive disabled:pointer-events-none disabled:opacity-0"
                  >
                    <Trash2 aria-hidden className="size-[15px]" />
                  </button>
                </div>
                <div>
                  <label htmlFor={qty.id} className="mb-1 block text-xs text-muted-foreground sm:sr-only">
                    Qty
                  </label>
                  <NumericInput
                    id={qty.id}
                    name={qty.name}
                    aria-invalid={qty['aria-invalid']}
                    aria-describedby={qty['aria-describedby']}
                    kind="decimal"
                    decimals={3}
                    value={item.quantity}
                    onValueChange={(quantity) => patch(item.id, { quantity })}
                  />
                </div>
                <div>
                  <label htmlFor={price.id} className="mb-1 block text-xs text-muted-foreground sm:sr-only">
                    Unit price
                  </label>
                  <NumericInput
                    id={price.id}
                    name={price.name}
                    aria-invalid={price['aria-invalid']}
                    aria-describedby={price['aria-describedby']}
                    kind="money"
                    prefix="$"
                    value={item.unitPriceCents}
                    onValueChange={(unitPriceCents) => patch(item.id, { unitPriceCents })}
                  />
                </div>
                <div className="flex flex-col items-end max-sm:min-w-[84px]">
                  <span className="mb-1 text-xs text-muted-foreground sm:hidden">Amount</span>
                  <output aria-label={`Amount, line ${i + 1}`} className="flex h-10 items-center font-medium tabular">
                    {formatUSD(lineTotals[i] ?? 0)}
                  </output>
                </div>
              </div>
              {errors.map((c) => (
                <span key={c.id} id={`${c.id}-error`} role="alert" className="pl-0.5 text-[12.5px] text-destructive">
                  {c.error}
                </span>
              ))}
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="rounded-[10px] border border-dashed border-input p-5 text-center text-muted-foreground">
            No line items yet. Add what you're billing for.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-2.5 inline-flex h-9 items-center gap-2 self-start rounded-lg border bg-card px-3 text-[13px] font-medium hover:border-input-hover hover:bg-hover-soft max-sm:h-12 max-sm:w-full max-sm:justify-center max-sm:border-[1.5px] max-sm:border-dashed max-sm:border-[#CFC5B3] max-sm:bg-transparent"
      >
        <Plus aria-hidden className="size-[15px]" /> Add line item
      </button>
    </div>
  );
}
