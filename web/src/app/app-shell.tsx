import { useState } from 'react';
import { useEditor } from '@/features/invoice/context/invoice-editor-context';
import { AppHeader } from '@/features/invoice/components/header/app-header';
import { EditorPane } from '@/features/invoice/components/workspace/editor-pane';
import { MobileActionBar } from '@/features/invoice/components/workspace/mobile-action-bar';
import { PreviewPane } from '@/features/invoice/components/workspace/preview-pane';
import { ViewTabs, type View } from '@/features/invoice/components/workspace/view-tabs';
import { useSaveShortcut } from '@/features/invoice/hooks/use-save-shortcut';

export function AppShell() {
  const { save } = useEditor();
  const [view, setView] = useState<View>('edit');

  useSaveShortcut(save);

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden print:h-auto print:overflow-visible">
      <AppHeader onNew={() => setView('edit')} />
      <ViewTabs view={view} onChange={setView} />
      <main className="mx-auto grid w-full max-w-[1360px] flex-1 items-start gap-8 px-4 pt-4 pb-6 sm:px-6 lg:min-h-0 lg:grid-cols-[minmax(0,636px)_minmax(0,1fr)] lg:items-stretch lg:py-0 print:block print:max-w-none print:p-0">
        <EditorPane hidden={view !== 'edit'} />
        <PreviewPane hidden={view !== 'preview'} />
      </main>
      <MobileActionBar />
    </div>
  );
}
