import { useId, type ChangeEvent } from 'react';
import type { Party } from '@invoice/shared';
import { Field } from '@/components/form/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface PartyFieldsProps {
  prefix: 'business' | 'customer';
  value: Party;
  onChange: (field: keyof Party, value: string) => void;
  suggestions?: Party[];
  onSelect?: (party: Party) => void;
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const isPickedFromList = (e: ChangeEvent<HTMLInputElement>) => {
  const native = e.nativeEvent as Partial<InputEvent>;
  return native.inputType === undefined || native.inputType === 'insertReplacementText';
};

export function PartyFields({ prefix, value, onChange, suggestions = [], onSelect }: PartyFieldsProps) {
  const isBusiness = prefix === 'business';
  const listId = useId();

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const match = isPickedFromList(e) && suggestions.find((p) => sameName(p.name, e.target.value));
    if (match && onSelect) onSelect(match);
    else onChange('name', e.target.value);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field
        path={`${prefix}.name`}
        label={isBusiness ? 'Business name' : 'Customer name'}
        hint={suggestions.length ? 'Pick a past customer to fill in their details' : undefined}
      >
        {(p) => (
          <>
            <Input
              {...p}
              value={value.name}
              list={suggestions.length ? listId : undefined}
              autoComplete={isBusiness ? 'organization' : 'off'}
              placeholder={isBusiness ? 'Your company' : 'Who is paying'}
              onChange={onNameChange}
            />
            {suggestions.length > 0 && (
              <datalist id={listId}>
                {suggestions.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.email}
                  </option>
                ))}
              </datalist>
            )}
          </>
        )}
      </Field>
      <Field path={`${prefix}.email`} label="Email" hint={isBusiness ? undefined : 'Used as the default recipient'}>
        {(p) => (
          <Input
            {...p}
            type="email"
            value={value.email}
            autoComplete="off"
            placeholder="name@company.com"
            onChange={(e) => onChange('email', e.target.value)}
          />
        )}
      </Field>
      <Field path={`${prefix}.address`} label="Address" className="sm:col-span-2">
        {(p) => (
          <Textarea
            {...p}
            rows={2}
            className="min-h-0"
            value={value.address}
            placeholder="Street, city, postal code"
            onChange={(e) => onChange('address', e.target.value)}
          />
        )}
      </Field>
    </div>
  );
}
