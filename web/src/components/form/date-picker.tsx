import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Popover } from '@base-ui/react/popover';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { addDaysISO, formatDate, toISODate } from '@invoice/shared';
import { cn } from '@/lib/utils';

const WEEKDAYS = [
  ['Su', 'Sunday'],
  ['Mo', 'Monday'],
  ['Tu', 'Tuesday'],
  ['We', 'Wednesday'],
  ['Th', 'Thursday'],
  ['Fr', 'Friday'],
  ['Sa', 'Saturday'],
] as const;

const isISODate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const monthStart = (iso: string) => `${iso.slice(0, 7)}-01`;
const weekday = (iso: string) => utc(iso).getUTCDay();

function addMonths(iso: string, months: number): string {
  const d = utc(iso);
  const day = d.getUTCDate();
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

function monthGrid(month: string): string[][] {
  const first = addDaysISO(month, -weekday(month));
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDaysISO(first, w * 7 + d)));
}

const monthLabel = (month: string) =>
  utc(month).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const longLabel = (iso: string) =>
  utc(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

interface DatePickerProps {
  id: string;
  name: string;
  value: string;
  onChange: (iso: string) => void;
  min?: string;
  rangeStart?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export function DatePicker({ id, name, value, onChange, min, rangeStart, ...aria }: DatePickerProps) {
  const today = toISODate(new Date());
  const selected = isISODate(value) ? value : '';
  const minDate = min && isISODate(min) ? min : '';
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(selected || today);
  const [month, setMonth] = useState(monthStart(selected || today));
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      grid.current?.querySelector<HTMLButtonElement>(`[data-iso="${focused}"]`)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, focused, month]);

  const onOpenChange = (next: boolean) => {
    if (next) {
      const start = selected || (minDate > today ? minDate : today);
      setFocused(start);
      setMonth(monthStart(start));
    }
    setOpen(next);
  };

  const moveTo = (iso: string) => {
    setFocused(iso);
    if (monthStart(iso) !== month) setMonth(monthStart(iso));
  };

  const isDisabled = (iso: string) => Boolean(minDate) && iso < minDate;

  const pick = (iso: string) => {
    if (isDisabled(iso)) return;
    onChange(iso);
    setOpen(false);
  };

  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, () => string> = {
      ArrowLeft: () => addDaysISO(focused, -1),
      ArrowRight: () => addDaysISO(focused, 1),
      ArrowUp: () => addDaysISO(focused, -7),
      ArrowDown: () => addDaysISO(focused, 7),
      Home: () => addDaysISO(focused, -weekday(focused)),
      End: () => addDaysISO(focused, 6 - weekday(focused)),
      PageUp: () => addMonths(focused, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, e.shiftKey ? 12 : 1),
    };
    const step = steps[e.key];
    if (!step) return;
    e.preventDefault();
    moveTo(step());
  };

  const showMonth = (delta: number) => {
    const next = addMonths(month, delta);
    setMonth(next);
    setFocused(monthStart(next) === monthStart(focused) ? focused : next);
  };

  const inRange = (iso: string) =>
    Boolean(rangeStart && selected && isISODate(rangeStart) && iso > rangeStart && iso < selected);

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger
        id={id}
        name={name}
        aria-invalid={aria['aria-invalid']}
        aria-describedby={aria['aria-describedby']}
        aria-haspopup="dialog"
        className={cn(
          'flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-white px-3 text-left text-sm',
          'transition-[border-color,box-shadow] outline-none hover:border-input-hover',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/18',
          'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/10',
          'data-[popup-open]:border-ring data-[popup-open]:ring-3 data-[popup-open]:ring-ring/18',
        )}
      >
        <span className={cn('truncate tabular', !selected && 'text-subtle')}>
          {selected ? formatDate(selected) : 'Pick a date'}
        </span>
        <CalendarDays aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
          <Popover.Popup
            initialFocus={false}
            aria-label="Choose a date"
            className={cn(
              'w-[19rem] rounded-xl border bg-popover p-3 text-popover-foreground outline-none',
              'shadow-[0_1px_2px_rgba(60,45,20,.06),0_18px_40px_-12px_rgba(60,45,20,.28)]',
              'origin-[var(--transform-origin)] transition-[opacity,transform] duration-150',
              'data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2 pl-1.5">
              <p aria-live="polite" className="font-heading text-base font-medium">
                {monthLabel(month)}
              </p>
              <div className="flex gap-0.5">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => showMonth(-1)}
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-hover-soft hover:text-foreground"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => showMonth(1)}
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-hover-soft hover:text-foreground"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            <div ref={grid} role="grid" aria-label={monthLabel(month)} onKeyDown={onGridKey} className="flex flex-col gap-0.5">
              <div role="row" className="grid grid-cols-7">
                {WEEKDAYS.map(([short, full]) => (
                  <span
                    key={short}
                    role="columnheader"
                    aria-label={full}
                    className="flex h-8 items-center justify-center text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    {short}
                  </span>
                ))}
              </div>
              {monthGrid(month).map((week) => (
                <div key={week[0]} role="row" className="grid grid-cols-7">
                  {week.map((iso) => {
                    const outside = monthStart(iso) !== month;
                    const isSelected = iso === selected;
                    const isToday = iso === today;
                    const disabled = isDisabled(iso);
                    const between = inRange(iso);
                    return (
                      <div
                        key={iso}
                        role="gridcell"
                        aria-selected={isSelected}
                        className={cn('flex justify-center py-px', between && 'bg-accent', iso === rangeStart && selected > iso && 'rounded-l-lg bg-accent')}
                      >
                        <button
                          type="button"
                          data-iso={iso}
                          tabIndex={iso === focused ? 0 : -1}
                          aria-label={`${longLabel(iso)}${isToday ? ', today' : ''}`}
                          aria-current={isToday ? 'date' : undefined}
                          aria-disabled={disabled || undefined}
                          onClick={() => pick(iso)}
                          className={cn(
                            'relative flex size-9 items-center justify-center rounded-lg text-sm tabular transition-colors outline-none',
                            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-popover',
                            isSelected
                              ? 'bg-primary font-semibold text-primary-foreground hover:bg-primary-hover'
                              : disabled
                                ? 'cursor-not-allowed text-subtle/45'
                                : cn('hover:bg-hover-soft', outside ? 'text-subtle' : 'text-foreground', between && 'text-accent-foreground hover:bg-[#d5e5da]'),
                            isToday && !isSelected && 'font-semibold ring-1 ring-primary/45 ring-inset',
                          )}
                        >
                          {Number(iso.slice(8))}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-hairline pt-2.5">
              <span className="pl-1.5 text-xs text-muted-foreground">
                {selected ? formatDate(selected) : 'No date picked'}
              </span>
              <button
                type="button"
                disabled={isDisabled(today)}
                onClick={() => pick(today)}
                className="h-8 rounded-md px-2.5 text-[13px] font-semibold text-primary hover:bg-hover-soft disabled:cursor-not-allowed disabled:opacity-40"
              >
                Today
              </button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
