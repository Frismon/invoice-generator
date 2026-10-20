import { useState } from 'react';
import type { InvoiceInput, Party, Totals } from '@invoice/shared';
import { Field } from '@/components/form/field';
import { useFormState } from '@/components/form/form-context';
import { Textarea } from '@/components/ui/textarea';
import { invoiceDefaults } from '@/features/invoice/lib/invoice-defaults';
import type { Recipe } from '@/features/invoice/model/types';
import { AdjustmentsFields } from './adjustments-fields';
import { BusinessSection } from './business-section';
import { CollapsibleSection } from './collapsible-section';
import { CustomFieldsEditor } from './custom-fields-editor';
import { DatesFields } from './dates-fields';
import { LineItemsEditor } from './line-items-editor';
import { PartyFields } from './party-fields';
import { Section } from './section';

interface InvoiceEditorProps {
  draft: InvoiceInput;
  totals: Totals;
  customers: Party[];
  update: (recipe: Recipe) => void;
}

export function InvoiceEditor({ draft, totals, customers, update }: InvoiceEditorProps) {
  const { errorFor } = useFormState();
  const [firstRun] = useState(() => invoiceDefaults.read() === null);

  const set = <K extends keyof InvoiceInput>(key: K, value: InvoiceInput[K]) =>
    update((d) => ({ ...d, [key]: value }));

  const setParty = (key: 'business' | 'customer') => (field: keyof Party, value: string) =>
    update((d) => ({ ...d, [key]: { ...d[key], [field]: value } }));

  const named = draft.customFields.filter((f) => f.label.trim());
  const shown = draft.customFields.filter((f) => f.visible).length;
  const extrasSummary = named.map((f) => (f.value ? `${f.label}: ${f.value}` : f.label)).join(' · ');
  const extrasHaveError = draft.customFields.some(
    (_, i) => errorFor(`customFields.${i}.label`) || errorFor(`customFields.${i}.value`),
  );
  const itemCount = `${draft.items.length} ${draft.items.length === 1 ? 'item' : 'items'}`;

  return (
    <div className="flex flex-col gap-4">
      <BusinessSection value={draft.business} onChange={setParty('business')} isSample={firstRun} />

      <Section title="Who is this for?">
        <PartyFields
          prefix="customer"
          value={draft.customer}
          onChange={setParty('customer')}
          suggestions={customers}
          onSelect={(customer) => set('customer', customer)}
        />
      </Section>

      <Section title="What did you do?" meta={itemCount}>
        <LineItemsEditor items={draft.items} lineTotals={totals.lineTotals} update={update} />
        <AdjustmentsFields draft={draft} totals={totals} update={update} />
      </Section>

      <Section title="When should they pay?">
        <DatesFields draft={draft} update={update} />
      </Section>

      <CollapsibleSection
        title="Extra details"
        meta={`${shown} of ${draft.customFields.length} shown`}
        summary={extrasSummary || undefined}
        forceOpen={extrasHaveError}
      >
        <CustomFieldsEditor fields={draft.customFields} update={update} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Note to customer"
        summary={draft.notes.trim() ? draft.notes.split('\n')[0] : undefined}
        forceOpen={Boolean(errorFor('notes'))}
      >
        <Field path="notes" label="Note to customer" labelClassName="sr-only">
          {(p) => (
            <Textarea
              {...p}
              rows={3}
              value={draft.notes}
              placeholder="Payment instructions, thank-you, anything else"
              onChange={(e) => set('notes', e.target.value)}
            />
          )}
        </Field>
      </CollapsibleSection>
    </div>
  );
}
