import { FilePlus2, Mail, Printer, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { useEditor } from '../../context/invoice-editor-context';
import { sendInvoiceDialog } from '../send-invoice-dialog';

interface HeaderActionsProps {
  onNew: () => void;
}

export function HeaderActions({ onNew }: HeaderActionsProps) {
  const { save, startNew, status, isDirty } = useEditor();

  return (
    <div className="ml-auto flex flex-wrap gap-2">
      <Button variant="ghost" size="sm" onClick={() => startNew() && onNew()}>
        <FilePlus2 /> New
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()} title="Print or save as PDF">
        <Printer /> PDF
      </Button>
      <DialogTrigger handle={sendInvoiceDialog} render={<Button variant="outline" size="sm" />}>
        <Mail /> Send
      </DialogTrigger>
      <Button
        size="sm"
        className="max-lg:hidden"
        onClick={() => void save()}
        disabled={status.kind === 'saving' || !isDirty}
        title="Save (Ctrl+S)"
      >
        <Save /> Save
      </Button>
    </div>
  );
}
