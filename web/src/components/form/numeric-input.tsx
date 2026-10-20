import { useEffect, useRef, useState, type InputHTMLAttributes } from 'react';
import { centsToInput, parseMoneyInput } from '@invoice/shared';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Kind = 'money' | 'decimal';

interface NumericInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'prefix'> {
  kind: Kind;
  value: number;
  onValueChange: (value: number) => void;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

const pattern = (kind: Kind, decimals: number) =>
  kind === 'money' ? /^\d*(\.\d{0,2})?$/ : new RegExp(`^\\d*(\\.\\d{0,${decimals}})?$`);

const display = (kind: Kind, value: number) => {
  if (value === 0) return '';
  return kind === 'money' ? centsToInput(value) : String(value);
};

export function NumericInput({
  kind,
  value,
  onValueChange,
  decimals = 2,
  prefix,
  suffix,
  className,
  onFocus,
  onBlur,
  ...props
}: NumericInputProps) {
  const [draft, setDraft] = useState(() => display(kind, value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(display(kind, value));
  }, [kind, value]);

  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      <Input
        placeholder={kind === 'money' ? '0.00' : '0'}
        {...props}
        inputMode="decimal"
        autoComplete="off"
        value={draft}
        className={cn('tabular text-right', prefix && 'pl-6', suffix && 'pr-7', className)}
        onFocus={(e) => {
          focused.current = true;
          e.currentTarget.select();
          onFocus?.(e);
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[,\s$%]/g, '');
          if (!pattern(kind, decimals).test(raw)) return;
          setDraft(raw);
          const next = kind === 'money' ? (parseMoneyInput(raw) ?? 0) : raw === '' || raw === '.' ? 0 : Number(raw);
          onValueChange(next);
        }}
        onBlur={(e) => {
          focused.current = false;
          setDraft(display(kind, value));
          onBlur?.(e);
        }}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}
