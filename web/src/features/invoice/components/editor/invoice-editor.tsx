import { useState } from 'react';
import { formatUSD, type InvoiceInput, type Party, type Totals } from '@invoice/shared';
import { Field } from '@/components/form/field';
import { NumericInput } from '@/components/form/numeric-input';
import { Textarea } from '@/components/ui/textarea';
import { invoiceDefaults } from '@/features/invoice/lib/invoice-defaults';
import type { Recipe } from '@/features/invoice/model/types';
import { BusinessSection } from './business-section';
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
  const set = <K extends keyof InvoiceInput>(key: K, value: InvoiceInput[K]) =>
    update((d) => ({ ...d, [key]: value }));

  const setParty = (key: 'business' | 'customer') => (field: keyof Party, value: string) =>
    update((d) => ({ ...d, [key]: { ...d[key], [field]: value } }));

  const [firstRun] = useState(() => invoiceDefaults.read() === null);
  const business = (
    <BusinessSection value={draft.business} onChange={setParty('business')} defaultOpen={firstRun} />
  );

  return (
    <div className="flex flex-col divide-y">
      {firstRun && business}
      <Section title="Bill to">
        <PartyFields
          prefix="customer"
          value={draft.customer}
          onChange={setParty('customer')}
          suggestions={customers}
          onSelect={(customer) => set('customer', customer)}
        />
      </Section>

      <Section title="Line items">
        <LineItemsEditor items={draft.items} lineTotals={totals.lineTotals} update={update} />
      </Section>

      <Section title="Dates">
        <DatesFields draft={draft} update={update} />
      </Section>

      <Section title="Discount and tax" description="Discount is a fixed amount taken off before tax.">
        <div className="grid gap-3 sm:grid-cols-[10rem_10rem_minmax(0,1fr)] sm:items-start">
          <Field path="discountCents" label="Discount" hint={`Up to ${formatUSD(totals.subtotalCents)}`}>
            {(p) => (
              <NumericInput {...p} kind="money" prefix="$" value={draft.discountCents} onValueChange={(v) => set('discountCents', v)} />
            )}
          </Field>
          <Field path="taxRate" label="Tax rate">
            {(p) => (
              <NumericInput {...p} kind="decimal" decimals={3} suffix="%" value={draft.taxRate} onValueChange={(v) => set('taxRate', v)} />
            )}
          </Field>
          <dl className="tabular grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm sm:justify-self-end">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-right">{formatUSD(totals.subtotalCents)}</dd>
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="text-right">−{formatUSD(totals.discountCents)}</dd>
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="text-right">{formatUSD(totals.taxCents)}</dd>
            <dt className="font-medium">Total</dt>
            <dd className="text-right font-medium">{formatUSD(totals.totalCents)}</dd>
          </dl>
        </div>
      </Section>

      <Section title="Notes">
        <Field path="notes" label="Notes for the customer" labelClassName="sr-only">
          {(p) => (
            <Textarea {...p} rows={3} value={draft.notes} placeholder="Payment terms, bank details, a thank-you" onChange={(e) => set('notes', e.target.value)} />
          )}
        </Field>
      </Section>

      <Section title="Custom fields" description="Visible fields appear on the invoice. They never change the totals.">
        <CustomFieldsEditor fields={draft.customFields} update={update} />
      </Section>

      {!firstRun && business}
    </div>
  );
}
