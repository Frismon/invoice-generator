import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { formatDate, formatUSD, type InvoiceSummary } from '@invoice/shared';
import { BrandMark, BrandName } from '@/components/brand-mark';
import { navigate } from '@/lib/router';
import { cn } from '@/lib/utils';
import { useEditor } from '../../context/invoice-editor-context';

type Filter = 'all' | 'draft' | 'sent';

const isSent = (inv: InvoiceSummary) => Boolean(inv.sentAt);

const th = 'px-5 py-3 text-[11.5px] font-semibold tracking-[0.06em] text-muted-foreground uppercase';

export function InvoicesPage() {
  const { invoices, open, startNew } = useEditor();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const counts = {
    all: invoices.length,
    draft: invoices.filter((i) => !isSent(i)).length,
    sent: invoices.filter(isSent).length,
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter(
      (inv) =>
        (filter === 'all' || (filter === 'sent') === isSent(inv)) &&
        (!q || inv.number.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q)),
    );
  }, [invoices, filter, query]);

  const openInvoice = (id: string) => {
    if (open(id)) navigate('editor');
  };

  const newInvoice = () => {
    if (startNew()) navigate('editor');
  };

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: `All · ${counts.all}` },
    { id: 'draft', label: `Drafts · ${counts.draft}` },
    { id: 'sent', label: `Sent · ${counts.sent}` },
  ];

  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <button type="button" onClick={() => navigate('editor')} className="flex items-center gap-2.5 rounded-md">
            <BrandMark />
            <BrandName />
          </button>
          <button
            type="button"
            onClick={newInvoice}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus aria-hidden className="size-[15px]" /> New invoice
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-4 pt-10 pb-16 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <h1 className="text-[40px] leading-[1.1] tracking-[-0.02em]">Invoices</h1>
            <p className="mt-1.5 text-muted-foreground">Everything you've saved. Open one to keep editing or resend it.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div role="group" aria-label="Filter by status" className="flex gap-1 rounded-[10px] bg-secondary p-1">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'h-8 rounded-[7px] px-3 text-[13px]',
                    filter === f.id
                      ? 'bg-white font-semibold shadow-[0_1px_2px_rgba(60,45,20,.12)]'
                      : 'font-medium text-muted-foreground hover:text-foreground',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="relative block">
              <span className="sr-only">Search invoices</span>
              <Search aria-hidden className="absolute top-1/2 left-3 size-[15px] -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Customer or number"
                className="h-10 w-60 max-w-full rounded-lg border border-input bg-white pr-3 pl-[34px] text-sm outline-none placeholder:text-subtle hover:border-input-hover focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/18"
              />
            </label>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[14px] border bg-card">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th scope="col" className={th}>Number</th>
                <th scope="col" className={th}>Customer</th>
                <th scope="col" className={th}>Issued</th>
                <th scope="col" className={th}>Due</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={cn(th, 'text-right')}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((inv) => (
                <tr key={inv.id} className="cursor-pointer border-b border-hairline last:border-0 hover:bg-[#faf6ef]" onClick={() => openInvoice(inv.id)}>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInvoice(inv.id);
                      }}
                      className="rounded font-mono text-[12.5px] hover:text-primary hover:underline"
                    >
                      {inv.number}
                    </button>
                  </td>
                  <td className="px-5 py-4 font-medium">{inv.customerName}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDate(inv.issueDate)}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDate(inv.dueDate)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold',
                        isSent(inv) ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground',
                      )}
                    >
                      <span aria-hidden className="size-1.5 rounded-full bg-current" />
                      {isSent(inv) ? 'Sent' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold tabular">{formatUSD(inv.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <p className="font-heading text-xl">{invoices.length ? 'Nothing matches' : 'No invoices yet'}</p>
              <p className="max-w-sm text-muted-foreground">
                {invoices.length
                  ? 'Try another name or number, or clear the filter.'
                  : 'Your saved invoices show up here. Create the first one in a couple of minutes.'}
              </p>
              {!invoices.length && (
                <button
                  type="button"
                  onClick={newInvoice}
                  className="mt-1 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover"
                >
                  <Plus aria-hidden className="size-[15px]" /> New invoice
                </button>
              )}
            </div>
          )}
        </div>
        <p className="mx-1 mt-3.5 text-[12.5px] text-muted-foreground">
          Saved to the server, so invoices are still here after a reload or on another device.
        </p>
      </main>
    </div>
  );
}
