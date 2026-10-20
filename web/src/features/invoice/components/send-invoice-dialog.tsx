import { useId, useState } from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { Check, CircleAlert, Lock, Mail, X } from 'lucide-react';
import {
  SendInvoiceSchema,
  defaultEmailMessage,
  defaultEmailSubject,
  formatDate,
  formatUSD,
  type SendInvoiceResponse,
} from '@invoice/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { errorMessage } from '@/lib/http';
import { useEditor } from '../context/invoice-editor-context';

export const sendInvoiceDialog = DialogPrimitive.createHandle();

type Phase =
  | { kind: 'compose'; busy: boolean; toError?: string }
  | { kind: 'sent'; to: string; result: SendInvoiceResponse }
  | { kind: 'failed'; message: string };

export function SendInvoiceDialog() {
  return (
    <Dialog handle={sendInvoiceDialog}>
      <DialogContent
        showCloseButton={false}
        className="top-[72px] w-[min(560px,calc(100%-32px))] max-w-none translate-y-0 gap-0 rounded-2xl bg-card p-0 text-sm shadow-[0_30px_80px_-20px_rgba(20,15,5,.45)] ring-0 sm:max-w-none"
      >
        <SendInvoiceFlow />
      </DialogContent>
    </Dialog>
  );
}

const sentAtLabel = (iso: string | null) =>
  iso
    ? `Sent · ${new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}`
    : 'Logged, not delivered';

function SendInvoiceFlow() {
  const { draft, totals, send } = useEditor();
  const [to, setTo] = useState(draft.customer.email);
  const [subject, setSubject] = useState(() => defaultEmailSubject(draft));
  const [message, setMessage] = useState(() => defaultEmailMessage(draft));
  const [copyToSender, setCopyToSender] = useState(Boolean(draft.business.email));
  const [phase, setPhase] = useState<Phase>({ kind: 'compose', busy: false });
  const ids = { to: useId(), subject: useId(), message: useId(), copy: useId() };

  const total = formatUSD(totals.totalCents);
  const due = formatDate(draft.dueDate);
  const fileName = `${draft.number || 'invoice'}.pdf`;

  const submit = async () => {
    const parsed = SendInvoiceSchema.safeParse({ to, subject, message, copyToSender: copyToSender && Boolean(draft.business.email) });
    if (!parsed.success) {
      const toIssue = parsed.error.issues.find((i) => i.path[0] === 'to');
      setPhase({ kind: 'compose', busy: false, toError: toIssue?.message ?? parsed.error.issues[0]?.message });
      return;
    }
    setPhase({ kind: 'compose', busy: true });
    try {
      const result = await send(parsed.data);
      setPhase({ kind: 'sent', to: parsed.data.to, result });
    } catch (err) {
      setPhase({ kind: 'failed', message: errorMessage(err) });
    }
  };

  if (phase.kind === 'sent') {
    const delivered = !phase.result.preview;
    return (
      <div role="status" className="flex flex-col items-center gap-2.5 px-8 pt-10 pb-8 text-center">
        <div
          aria-hidden
          className={
            delivered
              ? 'flex size-14 items-center justify-center rounded-full bg-accent text-primary motion-safe:animate-in motion-safe:zoom-in-50'
              : 'flex size-14 items-center justify-center rounded-full bg-sample text-sample-foreground'
          }
        >
          {delivered ? <Check className="size-6" strokeWidth={2.4} /> : <Mail className="size-6" />}
        </div>
        <DialogTitle className="mt-1.5 font-heading text-2xl font-medium">
          {delivered ? 'Invoice sent' : 'Email not delivered'}
        </DialogTitle>
        <DialogDescription className="max-w-[380px] text-muted-foreground">
          {delivered ? (
            <>
              {draft.number} is on its way to <strong className="font-semibold text-foreground">{phase.to}</strong>.
              {phase.result.copiedTo && ' A copy went to you.'}
            </>
          ) : (
            "Email isn't set up on the server yet (no SMTP), so the message was written to the server log instead of being sent. Add SMTP settings to .env to deliver it."
          )}
        </DialogDescription>
        <dl className="mt-3.5 grid w-full grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-hairline bg-hairline text-left">
          <div className="bg-white px-3.5 py-2.5">
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="font-medium">{sentAtLabel(phase.result.sentAt)}</dd>
          </div>
          <div className="bg-white px-3.5 py-2.5">
            <dt className="text-xs text-muted-foreground">Amount due</dt>
            <dd className="font-medium tabular">
              {total} by {due}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent"
            onClick={() => setPhase({ kind: 'compose', busy: false })}
          >
            Send again
          </Button>
          <DialogClose render={<Button size="lg" />}>Back to invoice</DialogClose>
        </div>
      </div>
    );
  }

  if (phase.kind === 'failed') {
    return (
      <div className="flex flex-col gap-3.5 p-6">
        <DialogTitle className="font-heading text-[22px] font-medium">Send invoice</DialogTitle>
        <div role="alert" className="flex gap-3 rounded-[10px] bg-destructive-soft p-3.5 text-[#7a1a12]">
          <CircleAlert aria-hidden className="mt-px size-[18px] shrink-0" />
          <div className="flex flex-col gap-0.5">
            <strong className="font-semibold">We couldn't send this email</strong>
            <span>{phase.message} Your invoice is saved — nothing was lost.</span>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <DialogClose render={<Button variant="ghost" size="lg" />}>Close</DialogClose>
          <Button size="lg" onClick={() => void submit()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <div>
          <DialogTitle className="font-heading text-[22px] font-medium tracking-[-0.01em]">Send invoice</DialogTitle>
          <DialogDescription className="mt-1 text-muted-foreground">
            {draft.customer.name || 'Your customer'} ·{' '}
            <span className="font-semibold text-foreground tabular">{total}</span> due {due}
          </DialogDescription>
        </div>
        <DialogClose
          aria-label="Close"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-hover"
        >
          <X className="size-[18px]" />
        </DialogClose>
      </div>

      <div className="flex flex-col gap-3.5 px-6 py-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={ids.to} className="text-[13px] font-medium">
            To
          </label>
          <Input
            id={ids.to}
            type="email"
            value={to}
            placeholder="name@company.com"
            aria-invalid={Boolean(phase.toError)}
            aria-describedby={phase.toError ? `${ids.to}-error` : undefined}
            onChange={(e) => {
              setTo(e.target.value);
              if (phase.toError) setPhase({ kind: 'compose', busy: false });
            }}
          />
          {phase.toError && (
            <span id={`${ids.to}-error`} role="alert" className="flex items-center gap-1.5 text-[12.5px] text-destructive">
              <CircleAlert aria-hidden className="size-3.5" />
              {phase.toError}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={ids.subject} className="text-[13px] font-medium">
            Subject
          </label>
          <Input id={ids.subject} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={ids.message} className="text-[13px] font-medium">
            Message
          </label>
          <Textarea id={ids.message} rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>

        <div className="flex items-center gap-3 rounded-[10px] border bg-white px-3 py-2.5">
          <div
            aria-hidden
            className="flex h-10 w-[34px] shrink-0 items-end justify-center rounded bg-accent pb-[5px] text-[9px] font-bold tracking-[0.04em] text-accent-foreground"
          >
            PDF
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{fileName}</span>
            <span className="text-[12.5px] text-muted-foreground">Attached automatically · matches the preview</span>
          </div>
        </div>

        {draft.business.email && (
          <label htmlFor={ids.copy} className="flex min-h-8 items-center gap-2.5 text-[13.5px]">
            <input
              id={ids.copy}
              type="checkbox"
              checked={copyToSender}
              onChange={(e) => setCopyToSender(e.target.checked)}
              className="m-0 size-[18px] accent-primary"
            />
            Send a copy to {draft.business.email}
          </label>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-6 py-4">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <Lock aria-hidden className="size-3.5" />
          Sent from our server — your keys never reach the browser
        </span>
        <div className="ml-auto flex gap-2">
          <DialogClose render={<Button variant="ghost" size="lg" />}>Cancel</DialogClose>
          <Button type="submit" size="lg" disabled={phase.busy} aria-busy={phase.busy}>
            {phase.busy && (
              <span
                aria-hidden
                className="size-3.5 rounded-full border-2 border-white/35 border-t-white motion-safe:animate-spin"
              />
            )}
            {phase.busy ? 'Sending…' : `Send ${total} invoice`}
          </Button>
        </div>
      </div>
    </form>
  );
}
