import { formatUSD } from '@invoice/shared';
import { useEditor } from '../../context/invoice-editor-context';

export function InvoicePicker() {
  const { invoices, saved, open } = useEditor();

  return (
    <select
      aria-label="Open a saved invoice"
      className="h-8 max-w-[16rem] rounded-lg border border-input bg-transparent pr-7 pl-2.5 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      value={saved?.id ?? ''}
      onChange={(e) => e.target.value && open(e.target.value)}
    >
      <option value="" disabled>
        {invoices.length ? 'Saved invoices…' : 'No saved invoices'}
      </option>
      {invoices.map((inv) => (
        <option key={inv.id} value={inv.id}>
          {inv.number} · {inv.customerName} · {formatUSD(inv.totalCents)}
        </option>
      ))}
    </select>
  );
}
