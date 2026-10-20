import { Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditor } from '../../context/invoice-editor-context';
import { SendButton, SendHint } from './send-button';

export function HeaderActions() {
  const { save, status, isDirty } = useEditor();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        size="lg"
        onClick={() => void save()}
        disabled={status.kind === 'saving' || !isDirty}
        title="Save (Ctrl+S)"
      >
        <Save /> Save
      </Button>
      <Button variant="ghost" size="lg" onClick={() => window.print()} title="Download or print as PDF">
        <Download /> Download PDF
      </Button>
      <SendButton />
      <SendHint />
    </div>
  );
}
