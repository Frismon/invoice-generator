import { formatUSD } from '@invoice/shared';
import { useEditor } from '../../context/invoice-editor-context';
import { sendReadiness } from '../../model/send-readiness';
import { SendButton } from '../header/send-button';

export function MobileActionBar() {
  const { draft, totals, issues } = useEditor();
  const { hint } = sendReadiness(draft, issues);

  return (
    <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t bg-card px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(60,45,20,.08)] lg:hidden print:hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        {hint ? (
          <span id="send-hint-mobile" className="truncate text-[12.5px] text-destructive">
            {hint}
          </span>
        ) : (
          <span className="text-[12.5px] text-muted-foreground">Amount due</span>
        )}
        <span className="font-heading text-[22px] leading-tight font-semibold tabular">{formatUSD(totals.totalCents)}</span>
      </div>
      <SendButton large hintId="send-hint-mobile" />
    </div>
  );
}
