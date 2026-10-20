import type { Invoice } from '@invoice/shared';
import type { Status } from './types';

export type StatusTone = 'neutral' | 'busy' | 'warning' | 'success' | 'error';

export interface StatusView {
  label: string;
  tone: StatusTone;
}

export function describeStatus(status: Status, saved: Invoice | null, isDirty: boolean, savedAgo: string): StatusView {
  switch (status.kind) {
    case 'loading':
      return { label: 'Loading…', tone: 'busy' };
    case 'saving':
      return { label: 'Saving…', tone: 'busy' };
    case 'error':
      return { label: status.message, tone: 'error' };
  }
  if (!saved) return { label: 'Not saved yet', tone: 'neutral' };
  if (isDirty) return { label: 'Unsaved changes', tone: 'warning' };
  return { label: `Saved ${savedAgo}`, tone: 'success' };
}
