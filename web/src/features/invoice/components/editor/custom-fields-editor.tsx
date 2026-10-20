import { useState } from 'react';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import type { CustomField } from '@invoice/shared';
import { Field } from '@/components/form/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Recipe } from '@/features/invoice/model/types';
import { uid } from '@/lib/id';
import { cn } from '@/lib/utils';

interface CustomFieldsEditorProps {
  fields: CustomField[];
  update: (recipe: Recipe) => void;
}

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
    <div className="flex flex-col gap-3">
      {fields.length === 0 && (
        <p className="text-[13px] text-muted-foreground">None yet. Useful for a PO number, project code or tax ID.</p>
      )}

      <ul className="flex flex-col gap-3 sm:gap-2">
        {fields.map((field, i) => (
          <li
            key={field.id}
            className={cn(
              'grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-2',
              'sm:grid-cols-[11rem_minmax(0,1fr)_auto_auto]',
            )}
          >
            <Field path={`customFields.${i}.label`} label="Label" labelClassName="sr-only" className="col-span-3 sm:col-span-1">
              {(p) => (
                <Input
                  {...p}
                  value={field.label}
                  placeholder="Label"
                  autoFocus={field.id === focusId}
                  className={cn(!field.visible && 'text-muted-foreground')}
                  onChange={(e) => patch(field.id, { label: e.target.value })}
                />
              )}
            </Field>
            <Field path={`customFields.${i}.value`} label={`Value for ${field.label || `field ${i + 1}`}`} labelClassName="sr-only">
              {(p) => (
                <Input
                  {...p}
                  value={field.value}
                  placeholder="Value"
                  className={cn(!field.visible && 'text-muted-foreground')}
                  onChange={(e) => patch(field.id, { value: e.target.value })}
                />
              )}
            </Field>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-24 justify-start"
              aria-pressed={field.visible}
              aria-label={`Show ${field.label || `field ${i + 1}`} on invoice`}
              onClick={() => patch(field.id, { visible: !field.visible })}
            >
              {field.visible ? <Eye /> : <EyeOff />}
              <span aria-hidden>{field.visible ? 'Shown' : 'Hidden'}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${field.label || `field ${i + 1}`}`}
              onClick={() => remove(field.id)}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

      <div>
        <Button variant="outline" size="sm" onClick={add} disabled={fields.length >= 30}>
          <Plus /> Add field
        </Button>
      </div>
    </div>
  );
}
