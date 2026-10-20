import type { ReactNode } from 'react';
import { formatDate, formatUSD, type InvoiceInput, type Totals } from '@invoice/shared';
import { cn } from '@/lib/utils';

function Placeholder({ children }: { children: ReactNode }) {
  return <span className="text-[#7a7368] print:invisible">{children}</span>;
}

const label = 'text-[10.5px] font-semibold tracking-[0.08em] text-[#5e584e] uppercase';

interface InvoicePreviewProps {
  invoice: InvoiceInput;
  totals: Totals;
  className?: string;
}

export function InvoicePreview({ invoice, totals, className }: InvoicePreviewProps) {
  const { business, customer } = invoice;
  const visibleFields = invoice.customFields.filter((f) => f.visible && (f.label.trim() || f.value.trim()));
  const dueLine =
    invoice.dueDate && invoice.dueDate === invoice.issueDate ? 'Due on receipt' : `Due by ${formatDate(invoice.dueDate) || '—'}`;

  return (
    <article
      aria-label="Invoice preview"
      className={cn(
        'flex min-h-[1056px] flex-col rounded-[4px] bg-white p-12 text-[13px] leading-[1.45] text-[#1d1b17]',
        'shadow-[0_1px_2px_rgba(60,45,20,.06),0_18px_40px_-12px_rgba(60,45,20,.18)]',
        'max-sm:min-h-0 max-sm:p-6',
        'print:min-h-[11in] print:rounded-none print:p-[0.75in] print:shadow-none',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-6 max-sm:flex-col">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-semibold">{business.name || <Placeholder>Your business</Placeholder>}</span>
          {business.email && <span className="text-[#5e584e]">{business.email}</span>}
          {business.address && <span className="whitespace-pre-line text-[#5e584e]">{business.address}</span>}
        </div>
        <div className="flex flex-col items-end gap-2.5 text-right max-sm:items-start max-sm:text-left">
          <div className="font-heading text-[36px] leading-none font-medium tracking-[-0.02em]">Invoice</div>
          <div className="font-mono text-[11.5px] text-[#5e584e]">{invoice.number || <Placeholder>INV-0000</Placeholder>}</div>
          <dl className="grid grid-cols-[auto_auto] gap-x-3.5 gap-y-0.5 text-[12.5px] tabular">
            <dt className="text-[#5e584e]">Issued</dt>
            <dd>{formatDate(invoice.issueDate) || '—'}</dd>
            <dt className="text-[#5e584e]">Due</dt>
            <dd className="font-semibold">{formatDate(invoice.dueDate) || '—'}</dd>
          </dl>
        </div>
      </div>

      <div className="mt-9 grid grid-cols-3 gap-x-5 gap-y-[18px] border-t border-[#eee7da] pt-5 max-sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1">
          <span className={label}>Billed to</span>
          <span className="font-semibold">{customer.name || <Placeholder>Customer name</Placeholder>}</span>
          {customer.email && <span className="text-[#5e584e] [overflow-wrap:anywhere]">{customer.email}</span>}
          {customer.address && <span className="whitespace-pre-line text-[#5e584e]">{customer.address}</span>}
        </div>
        {visibleFields.map((f) => (
          <div key={f.id} className="flex min-w-0 flex-col gap-1">
            <span className={label}>{f.label || 'Untitled'}</span>
            <span className="[overflow-wrap:anywhere]">{f.value || '—'}</span>
          </div>
        ))}
      </div>

      <table className="mt-9 w-full border-collapse tabular">
        <thead>
          <tr className="border-b-[1.5px] border-[#1d1b17]">
            <th scope="col" className={cn(label, 'pb-2 text-left')}>Description</th>
            <th scope="col" className={cn(label, 'w-14 pb-2 text-right')}>Qty</th>
            <th scope="col" className={cn(label, 'w-24 pb-2 text-right')}>Price</th>
            <th scope="col" className={cn(label, 'w-[100px] pb-2 text-right')}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={item.id} className="border-b border-[#eee7da] break-inside-avoid">
              <td className="py-3 pr-3 [overflow-wrap:anywhere]">
                {item.description || <Placeholder>Untitled item</Placeholder>}
              </td>
              <td className="py-3 text-right">{item.quantity}</td>
              <td className="py-3 text-right whitespace-nowrap">{formatUSD(item.unitPriceCents)}</td>
              <td className="py-3 text-right font-medium whitespace-nowrap">{formatUSD(totals.lineTotals[i] ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 ml-auto flex w-full max-w-[280px] flex-col gap-2 tabular break-inside-avoid">
        <div className="flex justify-between text-[#5e584e]">
          <span>Subtotal</span>
          <span className="text-[#1d1b17]">{formatUSD(totals.subtotalCents)}</span>
        </div>
        {totals.discountCents > 0 && (
          <div className="flex justify-between text-[#5e584e]">
            <span>Discount</span>
            <span className="text-[#1d1b17]">−{formatUSD(totals.discountCents)}</span>
          </div>
        )}
        {invoice.taxRate > 0 && (
          <div className="flex justify-between text-[#5e584e]">
            <span>Tax ({invoice.taxRate}%)</span>
            <span className="text-[#1d1b17]">{formatUSD(totals.taxCents)}</span>
          </div>
        )}
        <div className="mt-1 flex items-baseline justify-between gap-3 border-t-[1.5px] border-[#1d1b17] pt-3.5">
          <span className="font-semibold">
            Total due <span className="font-normal text-[#5e584e]">USD</span>
          </span>
          <span className="font-heading text-[28px] leading-none font-semibold tracking-[-0.01em] text-[#1f4a35]">
            {formatUSD(totals.totalCents)}
          </span>
        </div>
        <span className="inline-flex h-6 items-center self-end rounded-full bg-[#e6efe8] px-2.5 text-xs font-semibold text-[#1f4a35]">
          {dueLine}
        </span>
      </div>

      {invoice.notes && (
        <div className="mt-8 flex flex-col gap-1.5 break-inside-avoid">
          <span className={label}>Note</span>
          <p className="whitespace-pre-line text-[#3a362f]">{invoice.notes}</p>
        </div>
      )}

      <div className="mt-auto pt-8">
        <div className="flex justify-between gap-3 border-t border-[#eee7da] pt-3.5 text-[11.5px] text-[#5e584e]">
          <span>{[business.name, business.email].filter(Boolean).join(' · ')}</span>
          <span className="font-mono">{invoice.number}</span>
        </div>
      </div>
    </article>
  );
}
