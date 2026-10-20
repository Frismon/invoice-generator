import type { ReactNode } from 'react';
import { formatDate, formatUSD, type InvoiceInput, type Totals } from '@invoice/shared';
import { cn } from '@/lib/utils';

/** Placeholder text shown on screen while a field is empty, blank on paper. */
function Placeholder({ children }: { children: ReactNode }) {
  return <span className="text-neutral-400 print:invisible">{children}</span>;
}

interface InvoicePreviewProps {
  invoice: InvoiceInput;
  totals: Totals;
  className?: string;
}

/**
 * The invoice document. It's both the live preview and what gets printed:
 * the page hides everything else under @media print (see app-shell.tsx), so
 * "Save as PDF" in the print dialog produces exactly this.
 */
export function InvoicePreview({ invoice, totals, className }: InvoicePreviewProps) {
  const { business, customer } = invoice;
  const visibleFields = invoice.customFields.filter((f) => f.visible && (f.label.trim() || f.value.trim()));

  return (
    <article
      aria-label="Invoice preview"
      className={cn(
        'flex flex-col gap-10 bg-white p-8 text-[13px] leading-relaxed text-neutral-900 sm:p-12',
        'print:p-0 print:text-[12px]',
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-col">
          <p className="text-base font-semibold">{business.name || <Placeholder>Business name</Placeholder>}</p>
          {business.email && <p className="text-neutral-600">{business.email}</p>}
          {business.address && <p className="whitespace-pre-line text-neutral-600">{business.address}</p>}
        </div>
        <div className="flex flex-col sm:items-end">
          <p className="text-2xl font-light tracking-tight">Invoice</p>
          <p className="font-mono text-neutral-600">{invoice.number || <Placeholder>INV-0000</Placeholder>}</p>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col">
          <p className="mb-1 text-[11px] font-medium tracking-wide text-neutral-500 uppercase">Billed to</p>
          <p className="font-medium">{customer.name || <Placeholder>Customer name</Placeholder>}</p>
          {customer.email && <p className="text-neutral-600">{customer.email}</p>}
          {customer.address && <p className="whitespace-pre-line text-neutral-600">{customer.address}</p>}
        </div>
        <dl className="grid grid-cols-[auto_1fr] content-start gap-x-6 gap-y-0.5 sm:justify-self-end">
          <dt className="text-neutral-500">Issued</dt>
          <dd>{formatDate(invoice.issueDate)}</dd>
          <dt className="text-neutral-500">Due</dt>
          <dd className="font-medium">{formatDate(invoice.dueDate)}</dd>
          {visibleFields.map((f) => (
            <div key={f.id} className="contents">
              <dt className="text-neutral-500">{f.label}</dt>
              <dd className="break-words">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <table className="tabular w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-900 text-left text-[11px] tracking-wide text-neutral-500 uppercase">
            <th scope="col" className="py-2 pr-4 font-medium">Description</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Qty</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Price</th>
            <th scope="col" className="py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={item.id} className="border-b border-neutral-200 align-top break-inside-avoid">
              <td className="py-2.5 pr-4 break-words">{item.description || <Placeholder>Untitled item</Placeholder>}</td>
              <td className="py-2.5 pr-4 text-right">{item.quantity}</td>
              <td className="py-2.5 pr-4 text-right whitespace-nowrap">{formatUSD(item.unitPriceCents)}</td>
              <td className="py-2.5 text-right whitespace-nowrap">{formatUSD(totals.lineTotals[i] ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="tabular -mt-4 grid w-full grid-cols-[1fr_auto] gap-x-8 gap-y-1 self-end sm:w-72 break-inside-avoid">
        <dt className="text-neutral-500">Subtotal</dt>
        <dd className="text-right">{formatUSD(totals.subtotalCents)}</dd>
        {totals.discountCents > 0 && (
          <>
            <dt className="text-neutral-500">Discount</dt>
            <dd className="text-right">−{formatUSD(totals.discountCents)}</dd>
          </>
        )}
        {invoice.taxRate > 0 && (
          <>
            <dt className="text-neutral-500">Tax ({invoice.taxRate}%)</dt>
            <dd className="text-right">{formatUSD(totals.taxCents)}</dd>
          </>
        )}
        <div className="col-span-2 mt-2 grid grid-cols-subgrid items-baseline border-t border-neutral-900 pt-2">
          <dt className="font-semibold">Total due</dt>
          <dd className="text-right text-base font-semibold">{formatUSD(totals.totalCents)}</dd>
        </div>
      </dl>

      {invoice.notes && (
        <p className="max-w-prose whitespace-pre-line text-neutral-600 break-inside-avoid">{invoice.notes}</p>
      )}
    </article>
  );
}
