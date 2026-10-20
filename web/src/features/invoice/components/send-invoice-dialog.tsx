import { useId, useState } from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { SendInvoiceSchema } from '@invoice/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { errorMessage } from '@/lib/http';
import { useEditor } from '../context/invoice-editor-context';

export const sendInvoiceDialog = DialogPrimitive.createHandle();

type SendState =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'error'; message: string }
  | { kind: 'sent'; to: string; preview: boolean };

export function SendInvoiceDialog() {
  return (
    <Dialog handle={sendInvoiceDialog}>
      <DialogContent>
        <SendInvoiceForm />
      </DialogContent>
    </Dialog>
  );
}

function SendInvoiceForm() {
  const { draft, send } = useEditor();
  const [to, setTo] = useState(draft.customer.email);
  const [state, setState] = useState<SendState>({ kind: 'idle' });
  const inputId = useId();
  const messageId = `${inputId}-message`;

  const submit = async () => {
    const parsed = SendInvoiceSchema.safeParse({ to });
    if (!parsed.success) {
      setState({ kind: 'error', message: parsed.error.issues[0]?.message ?? 'Enter a valid email address' });
      return;
    }
    setState({ kind: 'sending' });
    try {
      const result = await send(parsed.data.to);
      setState({ kind: 'sent', to: parsed.data.to, preview: result.preview });
    } catch (err) {
      setState({ kind: 'error', message: errorMessage(err) });
    }
  };

  return (
    <form
      noValidate
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <DialogHeader>
        <DialogTitle>Email invoice</DialogTitle>
      </DialogHeader>

      {state.kind === 'sent' ? (
        <p role="status" className="text-muted-foreground">
          {state.preview
            ? `SMTP isn't configured, so the email to ${state.to} was logged on the server instead of delivered.`
            : `Sent to ${state.to}.`}
        </p>
      ) : (
        <div className="grid gap-1.5">
          <Label htmlFor={inputId}>Recipient</Label>
          <Input
            id={inputId}
            type="email"
            value={to}
            placeholder="name@company.com"
            aria-invalid={state.kind === 'error'}
            aria-describedby={messageId}
            onChange={(e) => {
              setTo(e.target.value);
              if (state.kind === 'error') setState({ kind: 'idle' });
            }}
          />
          {state.kind === 'error' ? (
            <p id={messageId} role="alert" className="text-[13px] text-destructive">
              {state.message}
            </p>
          ) : (
            <p id={messageId} className="text-[13px] text-muted-foreground">
              Unsaved changes are saved first, so the email matches the preview.
            </p>
          )}
        </div>
      )}

      <DialogFooter>
        <DialogClose render={<Button variant="ghost" />}>{state.kind === 'sent' ? 'Close' : 'Cancel'}</DialogClose>
        {state.kind !== 'sent' && (
          <Button type="submit" disabled={state.kind === 'sending'}>
            {state.kind === 'sending' ? 'Sending…' : 'Send'}
          </Button>
        )}
      </DialogFooter>
    </form>
  );
}
