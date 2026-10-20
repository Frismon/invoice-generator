import { useId, useState, type ChangeEvent } from 'react';
import { Plus } from 'lucide-react';
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
  const [addingAddress, setAddingAddress] = useState(false);
  const showAddress = isBusiness || addingAddress || Boolean(value.address);

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const match = isPickedFromList(e) && suggestions.find((p) => sameName(p.name, e.target.value));
    if (match && onSelect) onSelect(match);
    else onChange('name', e.target.value);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field path={`${prefix}.name`} label={isBusiness ? 'Business name' : 'Customer name'}>
        {(p) => (
          <>
            <Input
              {...p}
              value={value.name}
              list={suggestions.length ? listId : undefined}
              autoComplete={isBusiness ? 'organization' : 'off'}
              placeholder={isBusiness ? 'Your company' : 'Company or person'}
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
      <Field
        path={`${prefix}.email`}
        label={isBusiness ? 'Email' : <>Email <span className="font-normal text-muted-foreground">— we'll send it here</span></>}
      >
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
      {showAddress ? (
        <Field
          path={`${prefix}.address`}
          label={isBusiness ? 'Address' : <>Billing address <span className="font-normal text-muted-foreground">— optional</span></>}
          className="sm:col-span-2"
        >
          {(p) => (
            <Textarea
              {...p}
              rows={2}
              className="min-h-[60px]"
              value={value.address}
              placeholder="Street, city, postal code"
              autoFocus={addingAddress && !value.address}
              onChange={(e) => onChange('address', e.target.value)}
            />
          )}
        </Field>
      ) : (
        <button
          type="button"
          onClick={() => setAddingAddress(true)}
          className="inline-flex h-9 items-center gap-1.5 self-start justify-self-start rounded-md text-sm font-semibold text-primary hover:underline sm:col-span-2"
        >
          <Plus aria-hidden className="size-4" /> Add billing address
        </button>
      )}
    </div>
  );
}
