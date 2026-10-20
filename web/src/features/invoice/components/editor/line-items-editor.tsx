import { useState, type KeyboardEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { formatUSD, type LineItem } from '@invoice/shared';
import { Field } from '@/components/form/field';
import { NumericInput } from '@/components/form/numeric-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { emptyLineItem } from '@/features/invoice/model/draft';
import type { Recipe } from '@/features/invoice/model/types';
import { cn } from '@/lib/utils';

const columns = 'sm:grid-cols-[minmax(0,1fr)_5.5rem_8rem_7rem_2.25rem]';

interface LineItemsEditorProps {
  items: LineItem[];
  lineTotals: number[];
  update: (recipe: Recipe) => void;
}

/**
 * A table on desktop (one header row, labels visually hidden per cell),
 * stacked cards on phones (labels visible). Same DOM, so tab order and
 * screen-reader labels are identical in both layouts.
 */
export function LineItemsEditor({ items, lineTotals, update }: LineItemsEditorProps) {
  // Focus the description of a freshly added row, not on initial render.
  const [focusId, setFocusId] = useState<string | null>(null);

  const patch = (id: string, changes: Partial<LineItem>) =>
    update((d) => ({ ...d, items: d.items.map((it) => (it.id === id ? { ...it, ...changes } : it)) }));

  const add = () => {
    const item = emptyLineItem();
    setFocusId(item.id);
    update((d) => ({ ...d, items: [...d.items, item] }));
  };

  const remove = (id: string) => update((d) => ({ ...d, items: d.items.filter((it) => it.id !== id) }));

  const onEnter = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== 'Enter' || !(e.target instanceof HTMLInputElement)) return;
    e.preventDefault();
    const index = Number(e.target.closest('li')?.dataset.index);
    if (index === items.length - 1) add();
    else document.getElementById(`f-items-${index + 1}-description`)?.focus();
  };

  return (
    <div className="flex flex-col gap-3">
      <div aria-hidden className={cn('hidden gap-2 text-[13px] font-medium text-muted-foreground sm:grid', columns)}>
        <span>Description</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Unit price</span>
        <span className="text-right">Amount</span>
        <span />
      </div>

      <ul className="flex flex-col gap-3 sm:gap-2" onKeyDown={onEnter}>
        {items.map((item, i) => (
          <li
            key={item.id}
            data-index={i}
            className={cn(
              'grid grid-cols-2 items-start gap-2 rounded-md border p-3',
              'sm:rounded-none sm:border-0 sm:p-0',
              columns,
            )}
          >
            <Field
              path={`items.${i}.description`}
              label={`Description, line ${i + 1}`}
              labelClassName="sm:sr-only"
              className="col-span-2 sm:col-span-1"
            >
              {(p) => (
                <Input
                  {...p}
                  value={item.description}
                  placeholder="What you delivered"
                  autoFocus={item.id === focusId}
                  onChange={(e) => patch(item.id, { description: e.target.value })}
                />
              )}
            </Field>
            <Field path={`items.${i}.quantity`} label="Quantity" labelClassName="sm:sr-only">
              {(p) => (
                <NumericInput
                  {...p}
                  kind="decimal"
                  decimals={3}
                  value={item.quantity}
                  onValueChange={(quantity) => patch(item.id, { quantity })}
                />
              )}
            </Field>
            <Field path={`items.${i}.unitPriceCents`} label="Unit price" labelClassName="sm:sr-only">
              {(p) => (
                <NumericInput
                  {...p}
                  kind="money"
                  prefix="$"
                  value={item.unitPriceCents}
                  onValueChange={(unitPriceCents) => patch(item.id, { unitPriceCents })}
                />
              )}
            </Field>
            <div className="flex h-9 items-center gap-2 sm:justify-end">
              <span className="text-[13px] text-muted-foreground sm:sr-only">Amount</span>
              <output className="tabular text-sm" aria-label={`Amount, line ${i + 1}`}>
                {formatUSD(lineTotals[i] ?? 0)}
              </output>
            </div>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove line ${i + 1}`}
                title={items.length === 1 ? 'An invoice needs at least one line' : 'Remove line'}
                disabled={items.length === 1}
                onClick={() => remove(item.id)}
              >
                <Trash2 />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={add}>
          <Plus /> Add line
        </Button>
        <span className="hidden text-[13px] text-muted-foreground sm:inline">or press Enter in the last line</span>
      </div>
    </div>
  );
}
