import { ChevronDown, Save } from 'lucide-react';
import { BrandMark, BrandName } from '@/components/brand-mark';
import { navigate } from '@/lib/router';
import { useEditor } from '../../context/invoice-editor-context';
import { HeaderActions } from './header-actions';
import { MoreMenu } from './more-menu';
import { SaveStatus } from './save-status';

interface AppHeaderProps {
  onNew: () => void;
}

export function AppHeader({ onNew }: AppHeaderProps) {
  const { draft, save, status, isDirty } = useEditor();
  const number = draft.number || 'New invoice';

  return (
    <header className="sticky top-0 z-20 border-b bg-background/92 backdrop-blur-md print:hidden">
      <div className="mx-auto hidden h-16 max-w-[1360px] items-center gap-4 px-6 lg:flex">
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <div className="flex shrink-0 items-center gap-2.5">
            <BrandMark />
            <BrandName />
          </div>
          <button
            type="button"
            onClick={() => navigate('invoices')}
            className="inline-flex h-9 min-w-0 items-center gap-2 rounded-lg border border-input bg-card px-3 text-[13px] hover:border-input-hover hover:bg-hover-soft"
          >
            <span className="truncate font-mono text-xs">{number}</span>
            <ChevronDown aria-hidden className="size-3.5 shrink-0" />
            <span className="sr-only">Switch invoice</span>
          </button>
          <SaveStatus />
        </div>
        <HeaderActions />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2.5 lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandMark />
          <button
            type="button"
            onClick={() => navigate('invoices')}
            className="flex min-w-0 flex-col items-start text-left"
          >
            <span className="max-w-full truncate font-mono text-[12.5px]">{number}</span>
            <SaveStatus className="text-xs" />
          </button>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Save"
            disabled={status.kind === 'saving' || !isDirty}
            onClick={() => void save()}
            className="flex size-11 items-center justify-center rounded-[10px] text-foreground hover:bg-hover disabled:text-subtle"
          >
            <Save className="size-5" />
          </button>
          <MoreMenu onNew={onNew} />
        </div>
      </div>
    </header>
  );
}
