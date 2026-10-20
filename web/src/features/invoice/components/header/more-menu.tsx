import { Menu } from '@base-ui/react/menu';
import { Download, FileText, MoreHorizontal, Plus } from 'lucide-react';
import { navigate } from '@/lib/router';
import { useEditor } from '../../context/invoice-editor-context';

const item = 'flex h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm outline-none data-[highlighted]:bg-hover-soft';

export function MoreMenu({ onNew }: { onNew: () => void }) {
  const { startNew } = useEditor();

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="More actions"
        className="flex size-11 items-center justify-center rounded-[10px] text-foreground hover:bg-hover data-[popup-open]:bg-hover"
      >
        <MoreHorizontal className="size-5" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50">
          <Menu.Popup className="min-w-52 rounded-xl border bg-popover p-1.5 shadow-[0_18px_40px_-12px_rgba(60,45,20,.28)] outline-none">
            <Menu.Item className={item} onClick={() => startNew() && onNew()}>
              <Plus className="size-4 text-muted-foreground" /> New invoice
            </Menu.Item>
            <Menu.Item className={item} onClick={() => window.print()}>
              <Download className="size-4 text-muted-foreground" /> Download PDF
            </Menu.Item>
            <Menu.Item className={item} onClick={() => navigate('invoices')}>
              <FileText className="size-4 text-muted-foreground" /> All invoices
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
