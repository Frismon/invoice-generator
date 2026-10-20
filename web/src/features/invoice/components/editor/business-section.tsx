import { useState } from 'react';
import { Pencil } from 'lucide-react';
import type { Party } from '@invoice/shared';
import { useFormState } from '@/components/form/form-context';
import { Button } from '@/components/ui/button';
import { PartyFields } from './party-fields';
import { Section } from './section';

interface BusinessSectionProps {
  value: Party;
  onChange: (field: keyof Party, value: string) => void;
  defaultOpen?: boolean;
}

export function BusinessSection({ value, onChange, defaultOpen = false }: BusinessSectionProps) {
  const { errorFor } = useFormState();
  const [editing, setEditing] = useState(defaultOpen);
  const hasError = (['name', 'email', 'address'] as const).some((f) => errorFor(`business.${f}`));
  const open = editing || hasError || !value.name.trim();

  const toggle = !hasError && value.name.trim() && (
    <Button variant="ghost" size="sm" aria-expanded={open} onClick={() => setEditing(!open)}>
      {open ? 'Done' : (
        <>
          <Pencil /> Edit
        </>
      )}
    </Button>
  );

  return (
    <Section
      title="From"
      description={open ? 'Remembered after you save, so the next invoice starts with it.' : undefined}
      action={toggle}
    >
      {open ? (
        <PartyFields prefix="business" value={value} onChange={onChange} />
      ) : (
        <div className="text-sm">
          <p className="font-medium">{value.name}</p>
          <p className="text-muted-foreground">
            {[value.email, value.address.replace(/\n/g, ', ')].filter(Boolean).join(' · ')}
          </p>
        </div>
      )}
    </Section>
  );
}
