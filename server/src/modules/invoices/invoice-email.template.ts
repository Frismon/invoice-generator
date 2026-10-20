import { computeTotals, formatDate, formatUSD, type Invoice } from '@invoice/shared';
import type { OutgoingMail } from '../../mail/mailer';

const escape = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const nl2br = (s: string) => escape(s).replace(/\n/g, '<br>');


export function renderInvoiceEmail(invoice: Invoice): Omit<OutgoingMail, 'to'> {
  const totals = computeTotals(invoice);
  const visibleFields = invoice.customFields.filter((f) => f.visible);
  const subject = `Invoice ${invoice.number} from ${invoice.business.name}: ${formatUSD(totals.totalCents)} due ${formatDate(invoice.dueDate)}`;

  const cell = 'padding:8px 0;border-bottom:1px solid #e5e5e5;font-size:14px;';
  const num = `${cell}text-align:right;white-space:nowrap;`;

  const rows = invoice.items
    .map(
      (item, i) => `
      <tr>
        <td style="${cell}">${escape(item.description)}</td>
        <td style="${num}">${item.quantity}</td>
        <td style="${num}">${formatUSD(item.unitPriceCents)}</td>
        <td style="${num}">${formatUSD(totals.lineTotals[i] ?? 0)}</td>
      </tr>`,
    )
    .join('');

  const meta = [
    ['Invoice', invoice.number],
    ['Issued', formatDate(invoice.issueDate)],
    ['Due', formatDate(invoice.dueDate)],
    ...visibleFields.map((f) => [f.label, f.value] as const),
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:2px 16px 2px 0;color:#737373;font-size:13px;">${escape(k)}</td><td style="font-size:13px;">${escape(v)}</td></tr>`,
    )
    .join('');

  const sum = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:4px 0;font-size:14px;${strong ? 'font-weight:600;' : 'color:#525252;'}">${label}</td><td style="padding:4px 0;text-align:right;font-size:14px;${strong ? 'font-weight:600;' : ''}">${value}</td></tr>`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#171717;">
  <table role="presentation" width="100%" style="max-width:640px;background:#ffffff;border:1px solid #e5e5e5;padding:32px;">
    <tr><td>
      <p style="margin:0 0 4px;font-size:13px;color:#737373;">From</p>
      <p style="margin:0 0 24px;font-size:16px;font-weight:600;">${escape(invoice.business.name)}</p>
      <p style="margin:0 0 4px;font-size:13px;color:#737373;">Billed to</p>
      <p style="margin:0 0 24px;font-size:14px;">${escape(invoice.customer.name)}${invoice.customer.address ? `<br>${nl2br(invoice.customer.address)}` : ''}</p>
      <table role="presentation" style="margin-bottom:24px;">${meta}</table>
      <table role="presentation" width="100%" style="border-collapse:collapse;">
        <tr>
          <th align="left" style="${cell}font-size:12px;color:#737373;font-weight:500;">Description</th>
          <th align="right" style="${cell}font-size:12px;color:#737373;font-weight:500;">Qty</th>
          <th align="right" style="${cell}font-size:12px;color:#737373;font-weight:500;">Price</th>
          <th align="right" style="${cell}font-size:12px;color:#737373;font-weight:500;">Amount</th>
        </tr>
        ${rows}
      </table>
      <table role="presentation" width="100%" style="margin-top:16px;">
        ${sum('Subtotal', formatUSD(totals.subtotalCents))}
        ${totals.discountCents > 0 ? sum('Discount', `−${formatUSD(totals.discountCents)}`) : ''}
        ${invoice.taxRate > 0 ? sum(`Tax (${invoice.taxRate}%)`, formatUSD(totals.taxCents)) : ''}
        ${sum('Total due', formatUSD(totals.totalCents), true)}
      </table>
      ${invoice.notes ? `<p style="margin:24px 0 0;font-size:13px;color:#525252;">${nl2br(invoice.notes)}</p>` : ''}
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `Invoice ${invoice.number} from ${invoice.business.name}`,
    `Billed to: ${invoice.customer.name}`,
    `Issued: ${formatDate(invoice.issueDate)}  Due: ${formatDate(invoice.dueDate)}`,
    ...visibleFields.map((f) => `${f.label}: ${f.value}`),
    '',
    ...invoice.items.map(
      (item, i) =>
        `${item.description}  ${item.quantity} × ${formatUSD(item.unitPriceCents)} = ${formatUSD(totals.lineTotals[i] ?? 0)}`,
    ),
    '',
    `Subtotal: ${formatUSD(totals.subtotalCents)}`,
    totals.discountCents > 0 ? `Discount: -${formatUSD(totals.discountCents)}` : '',
    invoice.taxRate > 0 ? `Tax (${invoice.taxRate}%): ${formatUSD(totals.taxCents)}` : '',
    `Total due: ${formatUSD(totals.totalCents)}`,
    invoice.notes ? `\n${invoice.notes}` : '',
  ]
    .filter((line) => line !== '')
    .join('\n');

  return { subject, html, text };
}
