import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useEditor } from '../../context/invoice-editor-context';
import { InvoicePreview } from '../preview/invoice-preview';

const DESKTOP = '(min-width: 1024px)';

function useFitToBox() {
  const box = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, width: 0, height: 0, active: false });

  useLayoutEffect(() => {
    const media = window.matchMedia(DESKTOP);
    const measure = () => {
      const outer = box.current;
      const inner = content.current;
      if (!outer || !inner) return;
      if (!media.matches) {
        setFit({ scale: 1, width: 0, height: 0, active: false });
        return;
      }
      const scale = Math.min(1, outer.clientWidth / inner.offsetWidth, outer.clientHeight / inner.offsetHeight);
      setFit({ scale, width: inner.offsetWidth * scale, height: inner.offsetHeight * scale, active: true });
    };
    const observer = new ResizeObserver(measure);
    if (box.current) observer.observe(box.current);
    if (content.current) observer.observe(content.current);
    media.addEventListener('change', measure);
    measure();
    return () => {
      observer.disconnect();
      media.removeEventListener('change', measure);
    };
  }, []);

  return { box, content, fit };
}

export function PreviewPane({ hidden }: { hidden: boolean }) {
  const { draft, totals } = useEditor();
  const { box, content, fit } = useFitToBox();

  return (
    <section
      id="pane-preview"
      role="tabpanel"
      aria-labelledby="tab-preview"
      aria-label="Live invoice preview"
      className={cn(
        'flex min-w-0 flex-col gap-2.5',
        'lg:h-full lg:min-h-0 lg:py-6',
        'print:static! print:block! print:h-auto!',
        hidden && 'max-lg:hidden',
      )}
    >
      <div className="flex items-center justify-between gap-3 px-1 text-[12.5px] text-muted-foreground print:hidden">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-1.5 rounded-full bg-primary" />
          Live preview
        </span>
        <span>This is exactly what prints</span>
      </div>
      <div ref={box} className="min-h-0 flex-1 lg:overflow-hidden print:overflow-visible!">
        <div
          style={fit.active ? { width: fit.width, height: fit.height } : undefined}
          className="mx-auto print:h-auto! print:w-auto!"
        >
          <div
            ref={content}
            style={fit.active ? { transform: `scale(${fit.scale})` } : undefined}
            className="origin-top-left lg:w-[816px] print:w-auto! print:[transform:none]!"
          >
            <InvoicePreview invoice={draft} totals={totals} />
          </div>
        </div>
      </div>
    </section>
  );
}
