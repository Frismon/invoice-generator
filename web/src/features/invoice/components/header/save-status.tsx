import { cn } from '@/lib/utils';
import { useEditor } from '../../context/invoice-editor-context';
import { useRelativeTime } from '../../hooks/use-relative-time';
import { describeStatus, type StatusTone } from '../../model/status-message';

const dots: Record<StatusTone, string> = {
  neutral: 'bg-subtle',
  busy: 'bg-subtle motion-safe:animate-pulse',
  warning: 'bg-warning',
  success: 'bg-success',
  error: 'bg-destructive',
};

export function SaveStatus({ className }: { className?: string }) {
  const { status, saved, isDirty } = useEditor();
  const savedAgo = useRelativeTime(saved?.updatedAt);
  const { label, tone } = describeStatus(status, saved, isDirty, savedAgo);

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex min-w-0 items-center gap-1.5 text-[12.5px]',
        tone === 'error' ? 'text-destructive' : 'text-muted-foreground',
        className,
      )}
    >
      <span aria-hidden className={cn('size-[7px] shrink-0 rounded-full', dots[tone])} />
      <span className="truncate">{label}</span>
    </span>
  );
}
