import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useFormState } from './form-context';

export interface ControlProps {
  id: string;
  name: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

interface FieldProps {
  path: string;
  label: string;
  hint?: string;
  labelClassName?: string;
  className?: string;
  children: (control: ControlProps) => ReactNode;
}

const toId = (path: string) => `f-${path.replace(/\./g, '-')}`;

export function Field({ path, label, hint, labelClassName, className, children }: FieldProps) {
  const error = useFormState().errorFor(path);
  const id = toId(path);
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <label htmlFor={id} className={cn('text-[13px] font-medium', labelClassName)}>
        {label}
      </label>
      {children({ id, name: path, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {error ? (
        <p id={`${id}-error`} className="text-[13px] text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
