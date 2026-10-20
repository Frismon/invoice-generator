import { issuesByPath } from '@invoice/shared';
import { newDraft, toDraft } from './draft';
import type { EditorAction, EditorState } from './types';

export function createInitialState(): EditorState {
  return {
    draft: newDraft(),
    saved: null,
    status: { kind: 'idle' },
    touched: new Set(),
    submitted: false,
    serverErrors: {},
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'edit':
      return { ...state, draft: action.recipe(state.draft), serverErrors: {} };

    case 'touch':
      if (state.touched.has(action.path)) return state;
      return { ...state, touched: new Set(state.touched).add(action.path) };

    case 'loading':
      return { ...state, status: { kind: 'loading' } };

    case 'saving':
      return { ...state, submitted: true, status: { kind: 'saving' } };

    case 'invalid':
      return {
        ...state,
        submitted: true,
        status: { kind: 'error', message: 'Fix the highlighted fields before saving.' },
      };

    case 'opened':
      return {
        ...createInitialState(),
        draft: toDraft(action.invoice),
        saved: action.invoice,
      };

    case 'sent':
      return state.saved ? { ...state, saved: { ...state.saved, sentAt: action.sentAt } } : state;

    case 'failed':
      return {
        ...state,
        status: { kind: 'error', message: action.message },
        serverErrors: issuesByPath(action.issues ?? []),
      };

    case 'reset':
      return createInitialState();
  }
}
