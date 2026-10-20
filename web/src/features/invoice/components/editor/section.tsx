import { useId, type ReactNode } from 'react';

interface SectionProps {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({ title, meta, action, children }: SectionProps) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="rounded-[14px] border bg-card p-5">
      <header className="mb-3.5 flex items-baseline justify-between gap-3">
        <h2 id={id} className="text-[19px] leading-tight">
          {title}
        </h2>
        {meta && <span className="text-[12.5px] text-muted-foreground">{meta}</span>}
        {action}
      </header>
      {children}
    </section>
  );
}
