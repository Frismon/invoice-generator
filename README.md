# Invoice Generator

A browser-based invoice editor for a small business: line items, discount and tax, custom fields, live preview, print/PDF, saved invoices and email delivery.

**Stack:** React 19 + Vite + Tailwind v4 · Fastify 5 · SQLite (Drizzle ORM) · Nodemailer (SMTP) · Zod · Vitest

## Run it

Requires Node 20.19+.

```bash
npm install
cp .env.example .env      # optional: add SMTP credentials to really send email
npm run dev               # API on :3001, web on http://localhost:5173
```

```bash
npm test                  # calculation, validation and API tests
npm run typecheck
npm run build && npm start   # production: API serves the built frontend on :3001
```

No database setup: the SQLite file is created at `server/data/invoices.db` on first start.

## Email setup

Email goes through SMTP, so any provider works by editing `.env` only (examples for Resend and Mailtrap are in `.env.example`). Credentials are read on the server and never reach the browser.

If `SMTP_HOST` is empty, the app still works: the email is rendered and logged on the server, and the UI says it was not delivered. That keeps the project runnable without credentials.

## How it works

```
shared/src/        money, dates, calculation, Zod schema, API types (used by both sides)

server/src/
  config/          env parsing
  db/              Drizzle table + SQLite client
  common/          AppError types + the one error handler that maps them to responses
  mail/            SMTP mailer
  modules/invoices/
    invoice.routes.ts      URL → controller method
    invoice.controller.ts  parse request, pick status code
    invoice.service.ts     business rules; throws NotFound/Conflict instead of returning null
    invoice.repository.ts  Drizzle queries only
  plugins/         static hosting of web/dist in production

web/src/
  app/             App (providers + modals) and the page shell
  components/      ui/ (shadcn) and form/ (Field, NumericInput)
  features/invoice/
    api/           typed API client
    model/         editor state: types, reducer, draft helpers
    hooks/         useInvoiceEditor, list, save shortcut, leave guard
    context/       InvoiceEditorProvider / useEditor()
    components/    header, workspace panes, editor, preview, send dialog
  lib/             generic helpers: http, id, dom, cn
```

**Calculations** (`shared/src/calc.ts`). All money is integer cents. Order follows the brief: round each line (qty × price) to cents → sum → subtract the fixed discount → tax = round(taxable × rate) → total. `2 × $50 − $10 + 10% = $99.00` is a unit test, plus rounding edge cases (per-line rounding, 8.875% tax, `1.005`-style float noise). Money input is parsed with string arithmetic, so `0.1` is exactly 10 cents.

**Validation** (`shared/src/schema.ts`). One Zod schema runs in the browser as you type and on the server before saving or emailing. It rejects negative quantity, price, discount and tax; discount above subtotal; tax above 100%; due date before issue date. Inputs also refuse to accept a minus sign at all. In the form, errors appear after a field is blurred or a save is attempted, and focus jumps to the first invalid field. Server errors (e.g. a duplicate invoice number) come back with the same field paths and land on the right input.

**Custom fields.** Label, value, shown/hidden, remove. They are part of the document but never touch `computeTotals`. Hidden fields are left out of the preview, the printed PDF and the email (covered by a test).

**Storage** (`server/src/db/schema.ts`). One `invoices` table: the invoice document as JSON, plus `number` (unique), `customer_name` and `total_cents` as columns for the list view. The total is recomputed on the server, never trusted from the client.

**API**

| Method | Path | |
|---|---|---|
| GET | `/api/invoices` | list (newest first) |
| GET | `/api/invoices/:id` | one invoice |
| POST | `/api/invoices` | create |
| PUT | `/api/invoices/:id` | update |
| DELETE | `/api/invoices/:id` | delete |
| POST | `/api/invoices/:id/send` | email `{ to }`, limited to 5 per minute |
| GET | `/api/customers` | past customers, one per name, most recent first |

**Filling it in.** The form is ordered by what changes on every invoice: customer, line items, dates, discount and tax; your own business details sit collapsed at the bottom.
- *Remembered defaults.* After a save, business details, tax rate, payment term and notes are stored in the browser and prefill the next invoice. Until the first save, the business section is open at the top.
- *Past customers.* The customer name suggests customers from earlier invoices; picking one fills in their email and address.
- *Payment terms.* On receipt / 7 / 14 / 30 days set the due date, and changing the issue date keeps the same term.
- *Keyboard.* Enter in a line item jumps to the next line, or adds one on the last line. Number inputs select their content on focus, so typing replaces it.

**Print / PDF.** The preview component is the printed document. Under `@media print` everything else is hidden, so the browser's *Save as PDF* outputs just the invoice on A4.

**Reload.** Saving puts `?id=…` in the URL, so a reload (or a shared link) reopens the saved invoice. The dropdown in the header lists all saved invoices.

**Accessibility.** Every input has a label (visually hidden only where a column header already names it), errors are linked with `aria-describedby`, focus is visible on everything, the email dialog is a Base UI dialog (focus trap, Esc), the toggle for custom fields uses `aria-pressed`, and the status line is an `aria-live` region. `Ctrl/⌘+S` saves.

**Layout.** Desktop: editor and live preview side by side, the preview sticks while you scroll. Phones: Edit / Preview tabs; line items turn into stacked cards with visible labels; the total and Save stay pinned to the bottom.

## Decisions

- **Fastify over Express / NestJS.** A handful of endpoints don't need Nest's DI container; plain factory functions wire repository → service → controller → routes per module. Fastify is fast, typed, and has rate limiting and static serving as first-party plugins.
- **SQLite.** Zero setup for whoever runs this. Drizzle keeps queries typed; moving to Postgres means changing the driver and the table helper.
- **Document as JSON.** The invoice is read and written as a whole, so storing it as one document keeps the code small. Line items would get their own table once reporting needs to query them.
- **Same schema on both sides.** Client validation is for feedback; the server re-validates everything and is the source of truth.
- **SMTP instead of a provider SDK.** No vendor lock-in; any provider is a config change.
- **No auth.** Out of scope per the brief. In production every route would be scoped to an account.

## AI tools used

<!-- Fill in honestly, e.g.: Claude (Anthropic) for scaffolding and first drafts of components and tests; all code reviewed, run and adjusted by me. -->

## Time spent

<!-- e.g. ~3h -->

## Unfinished / next steps

- No delete button in the UI (the API supports it).
- No currency or locale options; USD and US date format only.
- No migrations folder: the table is created on startup. With more tables this moves to `drizzle-kit`.
- Email has no PDF attachment; it contains the invoice as HTML and plain text.
- No end-to-end tests in CI.
- Remembered defaults live in `localStorage`, so they are per browser; with accounts they would move to the database.
