import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden className={cn('size-7 shrink-0', className)}>
      <rect x="1" y="1" width="26" height="26" rx="7" fill="#2B5B45" />
      <path d="M9 8h10M9 12.5h10M9 17h6" stroke="#F4EFE7" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="19" cy="19" r="2.2" fill="#E9C46A" />
    </svg>
  );
}

export function BrandName({ className }: { className?: string }) {
  return <span className={cn('font-heading text-xl font-semibold tracking-tight', className)}>Invoice Studio</span>;
}
