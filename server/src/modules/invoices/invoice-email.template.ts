import {
  computeTotals,
  defaultEmailMessage,
  defaultEmailSubject,
  formatDate,
  formatUSD,
  type Invoice,
} from '@invoice/shared';
import type { OutgoingMail } from '../../mail/mailer';

const escape = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const nl2br = (s: string) => escape(s).replace(/\r?\n/g, '<br>');

const INK = '#1D1B17';
const MUTED = '#5E584E';
const HAIRLINE = '#EEE7DA';
const GREEN = '#1F4A35';
const PILL = '#E6EFE8';
const SANS = `'Instrument Sans',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
const SERIF = `Georgia,'Times New Roman',serif`;
const MONO = `ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;

export interface InvoiceEmailOptions {
  subject?: string;
  message?: string;
}

export function renderInvoiceEmail(
  invoice: Invoice,
  options: InvoiceEmailOptions = {},
): Pick<OutgoingMail, 'subject' | 'html' | 'text'> {
  const totals = computeTotals(invoice);
  const business = invoice.business.name.trim();
  const businessEmail = invoice.business.email.trim();
  const subject = options.subject?.trim() || defaultEmailSubject(invoice);
  const message = options.message ?? defaultEmailMessage(invoice);
  const total = formatUSD(totals.totalCents);
  const due = formatDate(invoice.dueDate);
  const dueLabel = `Due by ${due}`;
  const visibleFields = invoice.customFields.filter((f) => f.visible);

  const line = (label: string, value: string, extra = '') =>
    `<tr>
              <td style="padding:5px 0;font-size:14px;color:${MUTED};${extra}">${label}</td>
              <td align="right" style="padding:5px 0;font-size:14px;color:${INK};white-space:nowrap;${extra}">${value}</td>
            </tr>`;

  const itemLines = invoice.items
    .map((item, i) =>
      line(
        `${escape(item.description)} &times; ${item.quantity}`,
        formatUSD(totals.lineTotals[i] ?? 0),
      ),
    )
    .join('\n            ');

  const fieldLines = visibleFields
    .map(
      (f) =>
        `<p style="margin:0 0 4px;font-size:13px;color:${MUTED};">${escape(f.label)}: <span style="color:${INK};">${escape(f.value)}</span></p>`,
    )
    .join('');

  const totalRow = `<tr>
              <td style="padding:10px 0 0;font-size:15px;font-weight:700;color:${INK};border-top:1px solid ${HAIRLINE};">Total</td>
              <td align="right" style="padding:10px 0 0;font-size:15px;font-weight:700;color:${INK};white-space:nowrap;border-top:1px solid ${HAIRLINE};">${total}</td>
            </tr>`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#F4EFE7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE7;font-family:${SANS};color:${INK};">
    <tr><td align="center" style="padding:40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:0 4px 14px;font-size:13px;color:${MUTED};"><b style="color:${INK};">${escape(business)}</b> via Invoice Studio</td></tr>
        <tr><td style="background:#FFFFFF;border-radius:14px;padding:36px 32px;">
          <p style="margin:0 0 10px;font-family:${MONO};font-size:12px;color:${MUTED};">${escape(invoice.number)}</p>
          <h1 style="margin:0 0 24px;font-family:${SERIF};font-size:30px;line-height:1.2;font-weight:500;color:${INK};">You have a new invoice${business ? ` from ${escape(business)}` : ''}</h1>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PILL};border-radius:10px;">
            <tr>
              <td style="padding:20px 22px;">
                <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#22432F;">Amount due</p>
                <p style="margin:0;font-size:13px;color:#33553F;">${escape(dueLabel)}</p>
              </td>
              <td align="right" style="padding:20px 22px;font-family:${SERIF};font-size:34px;font-weight:700;color:${GREEN};white-space:nowrap;">${total}</td>
            </tr>
          </table>
          <p style="margin:24px 0;font-size:15px;line-height:1.6;color:#3A362F;">${nl2br(message)}</p>
          ${fieldLines ? `<div style="margin:0 0 20px;">${fieldLines}</div>` : ''}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${HAIRLINE};">
            <tr><td colspan="2" style="height:12px;line-height:12px;font-size:0;">&nbsp;</td></tr>
            ${itemLines}
            ${totals.discountCents > 0 ? line('Discount', `&minus;${formatUSD(totals.discountCents)}`) : ''}
            ${invoice.taxRate > 0 ? line(`Tax (${invoice.taxRate}%)`, formatUSD(totals.taxCents)) : ''}
            ${totalRow}
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border:1px solid ${HAIRLINE};border-radius:10px;">
            <tr>
              <td width="40" style="padding:12px 0 12px 14px;">
                <div style="width:32px;height:40px;line-height:40px;background:${PILL};border-radius:6px;text-align:center;font-size:10px;font-weight:700;color:${GREEN};">PDF</div>
              </td>
              <td style="padding:12px 14px;">
                <p style="margin:0;font-size:14px;font-weight:600;color:${INK};">${escape(invoice.number)}.pdf</p>
                <p style="margin:2px 0 0;font-size:12px;color:${MUTED};">Attached</p>
              </td>
            </tr>
          </table>
        </td></tr>
        ${businessEmail ? `<tr><td align="center" style="padding:20px 4px 0;font-size:12px;line-height:1.6;color:${MUTED};">Questions about this invoice? Reply to this email to reach ${escape(businessEmail)}.</td></tr>` : ''}
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    message,
    '',
    `${invoice.number} · Amount due ${total} · ${dueLabel}`,
    ...visibleFields.map((f) => `${f.label}: ${f.value}`),
    '',
    ...invoice.items.map((item, i) => `${item.description} × ${item.quantity}  ${formatUSD(totals.lineTotals[i] ?? 0)}`),
    totals.discountCents > 0 ? `Discount  -${formatUSD(totals.discountCents)}` : null,
    invoice.taxRate > 0 ? `Tax (${invoice.taxRate}%)  ${formatUSD(totals.taxCents)}` : null,
    `Total  ${total}`,
    '',
    `Attached: ${invoice.number}.pdf`,
    businessEmail ? `\nQuestions about this invoice? Reply to this email to reach ${businessEmail}.` : null,
  ]
    .filter((l): l is string => l !== null)
    .join('\n');

  return { subject, html, text };
}
