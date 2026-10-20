import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useEditor } from '../../context/invoice-editor-context';
import { sendReadiness } from '../../model/send-readiness';
import { sendInvoiceDialog } from '../send-invoice-dialog';

export function SendButton({ className, large = false, hintId = 'send-hint' }: { className?: string; large?: boolean; hintId?: string }) {
  const { draft, issues } = useEditor();
  const { canSend, hint } = sendReadiness(draft, issues);
  const sizing = large ? 'h-12 rounded-xl px-5 text-[15px]' : '';

  if (!canSend) {
    return (
      <Button
        size="lg"
        disabled
        aria-describedby={hint ? hintId : undefined}
        className={cn('bg-[#D9D2C5] text-muted-foreground disabled:opacity-100', sizing, className)}
      >
        Send invoice
      </Button>
    );
  }

  return (
    <DialogTrigger handle={sendInvoiceDialog} render={<Button size="lg" className={cn(sizing, className)} />}>
      <Send /> Send invoice
    </DialogTrigger>
  );
}

export function SendHint({ className }: { className?: string }) {
  const { draft, issues } = useEditor();
  const { hint } = sendReadiness(draft, issues);
  if (!hint) return null;
  return (
    <span id="send-hint" className={cn('text-[12.5px] text-destructive', className)}>
      {hint}
    </span>
  );
}
