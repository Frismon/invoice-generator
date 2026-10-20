import { useState } from 'react';
import { Eye, EyeOff, Plus, X } from 'lucide-react';
import type { CustomField } from '@invoice/shared';
import { Field } from '@/components/form/field';
import { Input } from '@/components/ui/input';
import type { Recipe } from '@/features/invoice/model/types';
import { uid } from '@/lib/id';
import { cn } from '@/lib/utils';

interface CustomFieldsEditorProps {
  fields: CustomField[];
  update: (recipe: Recipe) => void;
}

const iconButton = 'flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground';

export function CustomFieldsEditor({ fields, update }: CustomFieldsEditorProps) {
  const [focusId, setFocusId] = useState<string | null>(null);

  const patch = (id: string, changes: Partial<CustomField>) =>
    update((d) => ({
      ...d,
      customFields: d.customFields.map((f) => (f.id === id ? { ...f, ...changes } : f)),
    }));

  const add = () => {
    const field: CustomField = { id: uid(), label: '', value: '', visible: true };
    setFocusId(field.id);
    update((d) => ({ ...d, customFields: [...d.customFields, field] }));
  };

  const remove = (id: string) =>
    update((d) => ({ ...d, customFields: d.customFields.filter((f) => f.id !== id) }));

  return (
    <div className="flex flex-col">
      <p className="mb-3.5 text-[13px] text-muted-foreground">
        PO numbers, project names, payment info. Shown on the invoice, never used in totals.
      </p>
      <div role="list" className="flex flex-col gap-2">
        {fields.map((field, i) => (
          <div
            key={field.id}
            role="listitem"
            className={cn(
              'grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_36px_36px] items-start gap-2 transition-opacity',
              !field.visible && 'opacity-55',
            )}
          >
            <Field path={`customFields.${i}.label`} label={`Field ${i + 1} label`} labelClassName="sr-only">
              {(p) => (
                <Input
                  {...p}
                  value={field.label}
                  placeholder="Label"
                  autoFocus={field.id === focusId}
                  className="font-medium"
                  onChange={(e) => patch(field.id, { label: e.target.value })}
                />
              )}
            </Field>
            <Field path={`customFields.${i}.value`} label={`Field ${i + 1} value`} labelClassName="sr-only">
              {(p) => (
                <Input {...p} value={field.value} placeholder="Value" onChange={(e) => patch(field.id, { value: e.target.value })} />
              )}
            </Field>
            <button
              type="button"
              aria-pressed={!field.visible}
              aria-label={field.visible ? 'Hide from invoice' : 'Show on invoice'}
              title={field.visible ? 'Hide from invoice' : 'Show on invoice'}
              onClick={() => patch(field.id, { visible: !field.visible })}
              className={cn(iconButton, 'mt-0.5 hover:bg-hover-soft hover:text-foreground')}
            >
              {field.visible ? <Eye className="size-[17px]" /> : <EyeOff className="size-[17px]" />}
            </button>
            <button
              type="button"
              aria-label={`Remove field ${i + 1}`}
              onClick={() => remove(field.id)}
              className={cn(iconButton, 'mt-0.5 text-subtle hover:bg-destructive-soft hover:text-destructive')}
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        disabled={fields.length >= 30}
        className="mt-2.5 inline-flex h-9 items-center gap-2 self-start rounded-lg border bg-card px-3 text-[13px] font-medium hover:border-input-hover hover:bg-hover-soft disabled:opacity-50"
      >
        <Plus aria-hidden className="size-[15px]" /> Add field
      </button>
    </div>
  );
}
