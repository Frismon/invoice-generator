import { describe, expect, it } from 'vitest';
import type { Invoice } from '@invoice/shared';
import { newDraft } from './draft';
import { createInitialState, editorReducer } from './editor-reducer';

const invoice: Invoice = {
  ...newDraft(),
  id: 'inv-1',
  createdAt: '2026-10-20T10:00:00.000Z',
  updatedAt: '2026-10-20T10:00:00.000Z',
  sentAt: null,
};

describe('editorReducer', () => {
  it('clears server errors on edit', () => {
    const failed = editorReducer(createInitialState(), {
      type: 'failed',
      message: 'Conflict',
      issues: [{ path: 'number', message: 'Taken' }],
    });
    expect(failed.serverErrors).toEqual({ number: 'Taken' });

    const edited = editorReducer(failed, { type: 'edit', recipe: (d) => ({ ...d, number: 'INV-2' }) });
    expect(edited.draft.number).toBe('INV-2');
    expect(edited.serverErrors).toEqual({});
  });

  it('keeps the same state when a path is touched twice', () => {
    const once = editorReducer(createInitialState(), { type: 'touch', path: 'number' });
    expect(editorReducer(once, { type: 'touch', path: 'number' })).toBe(once);
  });

  it('opening an invoice resets form state and strips server fields from the draft', () => {
    let state = editorReducer(createInitialState(), { type: 'touch', path: 'number' });
    state = editorReducer(state, { type: 'invalid' });
    state = editorReducer(state, { type: 'opened', invoice });

    expect(state.saved).toBe(invoice);
    expect(state.draft).not.toHaveProperty('id');
    expect(state.submitted).toBe(false);
    expect(state.touched.size).toBe(0);
    expect(state.status).toEqual({ kind: 'idle' });
  });

  it('records sentAt only on a saved invoice', () => {
    expect(editorReducer(createInitialState(), { type: 'sent', sentAt: 'x' }).saved).toBeNull();
    const opened = editorReducer(createInitialState(), { type: 'opened', invoice });
    expect(editorReducer(opened, { type: 'sent', sentAt: 'x' }).saved?.sentAt).toBe('x');
  });
});
