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
    <div className="flex min-h-dvh flex-col">
      <AppHeader onNew={() => setView('edit')} />
      <ViewTabs view={view} onChange={setView} />
      <main className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] print:block">
        <EditorPane hidden={view !== 'edit'} />
        <PreviewPane hidden={view !== 'preview'} />
      </main>
      <MobileActionBar />
    </div>
  );
}
