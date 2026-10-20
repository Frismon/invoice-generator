import PDFDocument from 'pdfkit';
import { computeTotals, formatDate, formatUSD, type Invoice } from '@invoice/shared';

const INK = '#1D1B17';
const MUTED = '#5E584E';
const HAIRLINE = '#EEE7DA';
const GREEN = '#1F4A35';
const PILL = '#E6EFE8';

const MARGIN = 72;

const SANS = 'Helvetica';
const SANS_BOLD = 'Helvetica-Bold';
const SERIF = 'Times-Roman';
const SERIF_BOLD = 'Times-Bold';
const MONO = 'Courier';

type Doc = PDFKit.PDFDocument;

export function renderInvoicePdf(invoice: Invoice): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'LETTER',
    margin: MARGIN,
    bufferPages: true,
    info: { Title: `Invoice ${invoice.number}`, Author: invoice.business.name },
  });

  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  drawInvoice(doc, invoice);
  doc.end();
  return done;
}

function drawInvoice(doc: Doc, invoice: Invoice) {
  const totals = computeTotals(invoice);
  const left = MARGIN;
  const right = doc.page.width - MARGIN;
  const width = right - left;
  const bottom = () => doc.page.height - MARGIN;

  const ensure = (y: number, height: number, onBreak?: () => number): number => {
    if (y + height <= bottom()) return y;
    doc.addPage();
    return onBreak ? onBreak() : MARGIN;
  };

  const text = (
    value: string,
    x: number,
    y: number,
    font: string,
    size: number,
    color: string,
    options: PDFKit.Mixins.TextOptions = {},
  ) => {
    doc.font(font).fontSize(size).fillColor(color).text(value, x, y, { lineGap: 1.5, ...options });
    return doc.y;
  };

  const heightOf = (value: string, font: string, size: number, w: number) =>
    doc.font(font).fontSize(size).heightOfString(value, { width: w, lineGap: 1.5 });

  const rule = (y: number, color: string, thickness: number, x1 = left, x2 = right) => {
    doc.save().moveTo(x1, y).lineTo(x2, y).lineWidth(thickness).strokeColor(color).stroke().restore();
  };

  const label = (value: string, x: number, y: number, w: number, align: 'left' | 'right' = 'left') =>
    text(value.toUpperCase(), x, y, SANS_BOLD, 7.5, MUTED, { width: w, align, characterSpacing: 0.9 });

  const headerWidth = width * 0.55;
  let leftY = text(invoice.business.name, left, MARGIN, SANS_BOLD, 12, INK, { width: headerWidth });
  leftY += 3;
  const businessLines = [invoice.business.email, invoice.business.address].map((s) => s.trim()).filter(Boolean);
  for (const line of businessLines) {
    leftY = text(line, left, leftY, SANS, 10.5, MUTED, { width: headerWidth });
  }

  const metaX = left + width * 0.5;
  const metaW = right - metaX;
  let rightY = text('Invoice', metaX, MARGIN - 6, SERIF_BOLD, 34, INK, { width: metaW, align: 'right', lineGap: 0 });
  rightY = text(invoice.number, metaX, rightY + 2, MONO, 9.5, MUTED, { width: metaW, align: 'right' });
  rightY += 8;

  const metaRow = (name: string, value: string, bold: boolean, y: number) => {
    const valueFont = bold ? SANS_BOLD : SANS;
    doc.font(valueFont).fontSize(10.5);
    const valueWidth = doc.widthOfString(value);
    text(value, right - valueWidth, y, valueFont, 10.5, INK, { lineBreak: false });
    doc.font(SANS).fontSize(10.5);
    const nameWidth = doc.widthOfString(name);
    text(name, right - valueWidth - 10 - nameWidth, y, SANS, 10.5, MUTED, { lineBreak: false });
    return y + 16;
  };
  rightY = metaRow('Issued', formatDate(invoice.issueDate), false, rightY);
  rightY = metaRow('Due', formatDate(invoice.dueDate), true, rightY);

  let y = Math.max(leftY, rightY) + 18;
  rule(y, HAIRLINE, 1);
  y += 20;

  const visibleFields = invoice.customFields.filter((f) => f.visible);
  const blocks: { title: string; render: (x: number, y: number, w: number) => number; measure: (w: number) => number }[] = [
    {
      title: 'Billed to',
      render: (x, by, w) => {
        let cy = text(invoice.customer.name, x, by, SANS_BOLD, 10.5, INK, { width: w });
        for (const line of [invoice.customer.email, invoice.customer.address].map((s) => s.trim()).filter(Boolean)) {
          cy = text(line, x, cy + 1, SANS, 10.5, MUTED, { width: w });
        }
        return cy;
      },
      measure: (w) =>
        heightOf(invoice.customer.name, SANS_BOLD, 10.5, w) +
        [invoice.customer.email, invoice.customer.address]
          .map((s) => s.trim())
          .filter(Boolean)
          .reduce((sum, line) => sum + heightOf(line, SANS, 10.5, w) + 1, 0),
    },
    ...visibleFields.map((field) => ({
      title: field.label,
      render: (x: number, by: number, w: number) => text(field.value || '—', x, by, SANS, 10.5, INK, { width: w }),
      measure: (w: number) => heightOf(field.value || '—', SANS, 10.5, w),
    })),
  ];

  const gap = 24;
  const colW = (width - gap * 2) / 3;
  for (let i = 0; i < blocks.length; i += 3) {
    const row = blocks.slice(i, i + 3);
    const rowHeight = Math.max(...row.map((b) => 14 + b.measure(colW)));
    y = ensure(y, rowHeight);
    let rowBottom = y;
    row.forEach((block, j) => {
      const x = left + j * (colW + gap);
      label(block.title, x, y, colW);
      rowBottom = Math.max(rowBottom, block.render(x, y + 14, colW));
    });
    y = rowBottom + 16;
  }
  y += 12;

  const cols = {
    desc: { x: left, w: width - 250 },
    qty: { x: right - 250 + 12, w: 50 },
    price: { x: right - 188 + 4, w: 90 },
    amount: { x: right - 90, w: 90 },
  };

  const tableHeader = (hy: number) => {
    label('Description', cols.desc.x, hy, cols.desc.w);
    label('Qty', cols.qty.x, hy, cols.qty.w, 'right');
    label('Price', cols.price.x, hy, cols.price.w, 'right');
    label('Amount', cols.amount.x, hy, cols.amount.w, 'right');
    const ruleY = hy + 15;
    rule(ruleY, INK, 1.2);
    return ruleY + 9;
  };

  y = ensure(y, 60);
  y = tableHeader(y);

  invoice.items.forEach((item, i) => {
    const rowHeight = heightOf(item.description, SANS, 10.5, cols.desc.w);
    y = ensure(y, rowHeight + 18, () => tableHeader(MARGIN));
    text(item.description, cols.desc.x, y, SANS, 10.5, INK, { width: cols.desc.w });
    text(String(item.quantity), cols.qty.x, y, SANS, 10.5, INK, { width: cols.qty.w, align: 'right' });
    text(formatUSD(item.unitPriceCents), cols.price.x, y, SANS, 10.5, INK, { width: cols.price.w, align: 'right' });
    text(formatUSD(totals.lineTotals[i] ?? 0), cols.amount.x, y, SANS, 10.5, INK, {
      width: cols.amount.w,
      align: 'right',
    });
    y += rowHeight + 8;
    rule(y, HAIRLINE, 1);
    y += 9;
  });

  const totalsW = 216;
  const totalsX = right - totalsW;
  const summary: [string, string][] = [['Subtotal', formatUSD(totals.subtotalCents)]];
  if (totals.discountCents > 0) summary.push(['Discount', `–${formatUSD(totals.discountCents)}`]);
  if (invoice.taxRate > 0) summary.push([`Tax (${invoice.taxRate}%)`, formatUSD(totals.taxCents)]);

  y = ensure(y + 6, summary.length * 18 + 90);
  for (const [name, value] of summary) {
    text(name, totalsX, y, SANS, 10.5, MUTED, { width: totalsW, lineBreak: false });
    text(value, totalsX, y, SANS, 10.5, INK, { width: totalsW, align: 'right', lineBreak: false });
    y += 18;
  }
  y += 2;
  rule(y, INK, 1.2, totalsX, right);
  y += 12;

  text('Total due', totalsX, y + 8, SANS_BOLD, 10.5, INK, { lineBreak: false });
  doc.font(SANS_BOLD).fontSize(10.5);
  const totalDueWidth = doc.widthOfString('Total due ');
  text('USD', totalsX + totalDueWidth, y + 8, SANS, 8.5, MUTED, { lineBreak: false });
  text(formatUSD(totals.totalCents), totalsX, y, SERIF_BOLD, 24, GREEN, {
    width: totalsW,
    align: 'right',
    lineBreak: false,
  });
  y += 36;

  const pillText = invoice.dueDate === invoice.issueDate ? 'Due on receipt' : `Due by ${formatDate(invoice.dueDate)}`;
  doc.font(SANS_BOLD).fontSize(9);
  const pillW = doc.widthOfString(pillText) + 22;
  const pillH = 20;
  doc.save().roundedRect(right - pillW, y, pillW, pillH, pillH / 2).fill(PILL).restore();
  text(pillText, right - pillW, y + 6, SANS_BOLD, 9, GREEN, { width: pillW, align: 'center', lineBreak: false });
  y += pillH + 28;

  const notes = invoice.notes.trim();
  if (notes) {
    y = ensure(y, 14 + Math.min(heightOf(notes, SANS, 10.5, width * 0.7), 60));
    label('Note', left, y, width);
    text(notes, left, y + 14, SANS, 10.5, INK, { width: width * 0.7 });
  }

  const footerLeft = [invoice.business.name.trim(), invoice.business.email.trim()].filter(Boolean).join(' · ');
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const bottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const footerY = doc.page.height - MARGIN;
    rule(footerY + 10, HAIRLINE, 1);
    text(footerLeft, left, footerY + 20, SANS, 8.5, MUTED, { width: width * 0.7, lineBreak: false });
    text(invoice.number, left, footerY + 20, SANS, 8.5, MUTED, { width, align: 'right', lineBreak: false });
    doc.page.margins.bottom = bottomMargin;
  }
}
