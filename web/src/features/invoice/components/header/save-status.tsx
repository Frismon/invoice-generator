import { cn } from '@/lib/utils';
import { useEditor } from '../../context/invoice-editor-context';
import { statusMessage } from '../../model/status-message';

export function SaveStatus() {
  const { status, saved, isDirty } = useEditor();

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn('text-[13px]', status.kind === 'error' ? 'text-destructive' : 'text-muted-foreground')}
    >
      {statusMessage(status, saved, isDirty)}
    </p>
  );
}
