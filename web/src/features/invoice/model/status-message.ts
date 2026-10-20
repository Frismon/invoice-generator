import { formatDate, type Invoice } from '@invoice/shared';
import type { Status } from './types';

export function statusMessage(status: Status, saved: Invoice | null, isDirty: boolean): string {
  switch (status.kind) {
    case 'loading':
      return 'Loading…';
    case 'saving':
      return 'Saving…';
    case 'error':
      return status.message;
  }
  if (!saved) return 'Not saved yet';
  if (isDirty) return 'Unsaved changes';
  return saved.sentAt ? `Saved · emailed ${formatDate(saved.sentAt)}` : 'Saved';
}
