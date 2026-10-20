import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import type { InvoiceInput } from '@invoice/shared';
import { buildApp } from './app';
import { createDb } from './db/client';
import { toMailError, type Mailer, type OutgoingMail } from './mail/mailer';

const invoice: InvoiceInput = {
  number: 'INV-2026-001',
  issueDate: '2026-10-20',
  dueDate: '2026-11-03',
  business: { name: 'Northwind Studio', email: 'hello@example.com', address: '1 Main St' },
  customer: { name: 'Acme <Corp>', email: 'billing@example.com', address: '' },
  items: [{ id: 'a', description: 'Design sprint', quantity: 2, unitPriceCents: 5000 }],
  discountCents: 1000,
  taxRate: 10,
  notes: 'Thanks!',
  customFields: [
    { id: 'po', label: 'PO number', value: '4500-17', visible: true },
    { id: 'internal', label: 'Internal ref', value: 'SECRET-42', visible: false },
  ],
};

describe('invoices API', () => {
  let app: FastifyInstance;
  let sent: OutgoingMail[];

  beforeEach(async () => {
    sent = [];
    const mailer: Mailer = {
      async send(mail) {
        sent.push(mail);
        return { messageId: 'test-1', preview: false };
      },
    };
    app = await buildApp({ db: createDb(':memory:'), mailer });
  });

  afterEach(() => app.close());

  it('creates, lists and retrieves an invoice', async () => {
    const created = await app.inject({ method: 'POST', url: '/api/invoices', payload: invoice });
    expect(created.statusCode).toBe(201);
    const { id } = created.json();

    const list = (await app.inject('/api/invoices')).json();
    expect(list).toEqual([
      expect.objectContaining({
        id,
        number: 'INV-2026-001',
        totalCents: 9900,
        issueDate: '2026-10-20',
        dueDate: '2026-11-03',
      }),
    ]);

    const fetched = (await app.inject(`/api/invoices/${id}`)).json();
    expect(fetched).toMatchObject({ ...invoice, id, sentAt: null });
  });

  it('rejects invalid input with field paths', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/invoices',
      payload: { ...invoice, discountCents: 999999, items: [{ ...invoice.items[0], quantity: -1 }] },
    });
    expect(res.statusCode).toBe(400);
    const paths = res.json().issues.map((i: { path: string }) => i.path);
    expect(paths).toContain('items.0.quantity');
  });

  it('saves an unfinished invoice but refuses to send it', async () => {
    const draft = { ...invoice, customer: { name: '', email: '', address: '' }, items: [], discountCents: 0 };
    const created = await app.inject({ method: 'POST', url: '/api/invoices', payload: draft });
    expect(created.statusCode).toBe(201);

    const res = await app.inject({
      method: 'POST',
      url: `/api/invoices/${created.json().id}/send`,
      payload: { to: 'me@example.com' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().issues.map((i: { path: string }) => i.path)).toEqual(['customer.name', 'items']);
    expect(sent).toHaveLength(0);
  });

  it('returns 409 for a duplicate invoice number', async () => {
    await app.inject({ method: 'POST', url: '/api/invoices', payload: invoice });
    const res = await app.inject({ method: 'POST', url: '/api/invoices', payload: invoice });
    expect(res.statusCode).toBe(409);
    expect(res.json().issues[0].path).toBe('number');
  });

  it('updates an invoice', async () => {
    const { id } = (await app.inject({ method: 'POST', url: '/api/invoices', payload: invoice })).json();
    const res = await app.inject({
      method: 'PUT',
      url: `/api/invoices/${id}`,
      payload: { ...invoice, taxRate: 0 },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().taxRate).toBe(0);
  });

  it('emails an invoice: escaped, hidden fields excluded, sentAt recorded', async () => {
    const { id } = (await app.inject({ method: 'POST', url: '/api/invoices', payload: invoice })).json();
    const res = await app.inject({
      method: 'POST',
      url: `/api/invoices/${id}/send`,
      payload: { to: 'me@example.com' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().sentAt).toEqual(expect.any(String));

    const mail = sent[0]!;
    expect(mail.to).toBe('me@example.com');
    expect(mail.subject).toBe('Invoice INV-2026-001 from Northwind Studio');
    expect(mail.html).toContain('$99.00');
    expect(mail.html).toContain('Here’s invoice INV-2026-001');
    expect(mail.html).toContain('4500-17');
    expect(mail.html).not.toContain('SECRET-42');
    expect(mail.text).not.toContain('SECRET-42');
  });

  it('attaches the invoice as a PDF', async () => {
    const { id } = (await app.inject({ method: 'POST', url: '/api/invoices', payload: invoice })).json();
    await app.inject({ method: 'POST', url: `/api/invoices/${id}/send`, payload: { to: 'me@example.com' } });

    const attachment = sent[0]!.attachments![0]!;
    expect(attachment.filename).toBe('INV-2026-001.pdf');
    expect(attachment.contentType).toBe('application/pdf');
    expect(attachment.content.subarray(0, 4).toString('latin1')).toBe('%PDF');
  });

  it('uses a custom subject and message, escaped, without hidden fields', async () => {
    const { id } = (await app.inject({ method: 'POST', url: '/api/invoices', payload: invoice })).json();
    const res = await app.inject({
      method: 'POST',
      url: `/api/invoices/${id}/send`,
      payload: { to: 'me@example.com', subject: '  October work  ', message: 'Hi Acme <team>,\nSee attached.' },
    });
    expect(res.statusCode).toBe(200);

    const mail = sent[0]!;
    expect(mail.subject).toBe('October work');
    expect(mail.html).toContain('Hi Acme &lt;team&gt;,<br>See attached.');
    expect(mail.text).toContain('Hi Acme <team>,\nSee attached.');
    expect(mail.html).not.toContain('SECRET-42');
    expect(mail.text).not.toContain('SECRET-42');
  });

  it('copies the sender only when asked', async () => {
    const { id } = (await app.inject({ method: 'POST', url: '/api/invoices', payload: invoice })).json();
    const send = (payload: object) => app.inject({ method: 'POST', url: `/api/invoices/${id}/send`, payload });

    const copied = await send({ to: 'me@example.com', copyToSender: true });
    expect(copied.json().copiedTo).toBe('hello@example.com');
    expect(sent[0]!.cc).toBe('hello@example.com');

    const notCopied = await send({ to: 'me@example.com', copyToSender: false });
    expect(notCopied.json().copiedTo).toBeNull();
    expect(sent[1]!.cc).toBeUndefined();

    const absent = await send({ to: 'me@example.com' });
    expect(absent.json().copiedTo).toBeNull();
    expect(sent[2]!.cc).toBeUndefined();
  });

  it('does not copy the sender when the business has no email', async () => {
    const { id } = (
      await app.inject({
        method: 'POST',
        url: '/api/invoices',
        payload: { ...invoice, business: { ...invoice.business, email: '' } },
      })
    ).json();
    const res = await app.inject({
      method: 'POST',
      url: `/api/invoices/${id}/send`,
      payload: { to: 'me@example.com', copyToSender: true },
    });
    expect(res.json().copiedTo).toBeNull();
    expect(sent[0]!.cc).toBeUndefined();
  });

  it('validates the recipient address', async () => {
    const { id } = (await app.inject({ method: 'POST', url: '/api/invoices', payload: invoice })).json();
    const res = await app.inject({ method: 'POST', url: `/api/invoices/${id}/send`, payload: { to: 'nope' } });
    expect(res.statusCode).toBe(400);
    expect(sent).toHaveLength(0);
  });

  it('404s for unknown invoices', async () => {
    expect((await app.inject('/api/invoices/missing')).statusCode).toBe(404);
    expect((await app.inject({ method: 'PUT', url: '/api/invoices/missing', payload: invoice })).statusCode).toBe(404);
    expect((await app.inject({ method: 'DELETE', url: '/api/invoices/missing' })).statusCode).toBe(404);
    const send = await app.inject({ method: 'POST', url: '/api/invoices/missing/send', payload: { to: 'me@example.com' } });
    expect(send.statusCode).toBe(404);
    expect(send.json()).toEqual({ error: 'NotFound', message: 'Invoice not found' });
  });

  it('deletes an invoice', async () => {
    const { id } = (await app.inject({ method: 'POST', url: '/api/invoices', payload: invoice })).json();
    expect((await app.inject({ method: 'DELETE', url: `/api/invoices/${id}` })).statusCode).toBe(204);
    expect((await app.inject(`/api/invoices/${id}`)).statusCode).toBe(404);
  });

  it('returns 409 when an update takes another invoice number', async () => {
    await app.inject({ method: 'POST', url: '/api/invoices', payload: invoice });
    const { id } = (
      await app.inject({ method: 'POST', url: '/api/invoices', payload: { ...invoice, number: 'INV-2026-002' } })
    ).json();
    const res = await app.inject({ method: 'PUT', url: `/api/invoices/${id}`, payload: invoice });
    expect(res.statusCode).toBe(409);
    expect(res.json().issues[0].path).toBe('number');
  });

  it('lists past customers once each, most recent first', async () => {
    await app.inject({ method: 'POST', url: '/api/invoices', payload: invoice });
    const newer = { ...invoice.customer, email: 'new@example.com' };
    await app.inject({
      method: 'POST',
      url: '/api/invoices',
      payload: { ...invoice, number: 'INV-2026-002', customer: newer },
    });
    expect((await app.inject('/api/customers')).json()).toEqual([newer]);
  });

  it('rate limits sending to 5 per minute', async () => {
    const { id } = (await app.inject({ method: 'POST', url: '/api/invoices', payload: invoice })).json();
    const send = () => app.inject({ method: 'POST', url: `/api/invoices/${id}/send`, payload: { to: 'me@example.com' } });
    for (let i = 0; i < 5; i++) expect((await send()).statusCode).toBe(200);
    expect((await send()).statusCode).toBe(429);
  });

  it('reports a rejected SMTP login as a clear 502', async () => {
    const failing = await buildApp({
      db: createDb(':memory:'),
      mailer: {
        async send() {
          throw toMailError(Object.assign(new Error('Invalid login'), { code: 'EAUTH' }));
        },
      },
    });
    const { id } = (await failing.inject({ method: 'POST', url: '/api/invoices', payload: invoice })).json();
    const res = await failing.inject({ method: 'POST', url: `/api/invoices/${id}/send`, payload: { to: 'me@example.com' } });
    expect(res.statusCode).toBe(502);
    expect(res.json()).toMatchObject({ error: 'MailAuthError', message: expect.stringContaining('SMTP_PASS') });
    expect((await failing.inject(`/api/invoices/${id}`)).json().sentAt).toBeNull();
    await failing.close();
  });
});
