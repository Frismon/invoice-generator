import { useCallback, useEffect, useMemo, useReducer } from 'react';
import {
  InvoiceInputSchema,
  computeTotals,
  issuesByPath,
  toFieldIssues,
  type Invoice,
  type SendInvoiceResponse,
} from '@invoice/shared';
import { focusFirstInvalid } from '@/lib/dom';
import { ApiError, errorMessage } from '@/lib/http';
import { invoiceApi } from '../api/invoice-api';
import { invoiceDefaults } from '../lib/invoice-defaults';
import { invoiceUrl } from '../lib/invoice-url';
import { toDraft } from '../model/draft';
import { createInitialState, editorReducer } from '../model/editor-reducer';
import { termDays } from '../model/terms';
import type { Recipe } from '../model/types';
import { useLeaveGuard } from './use-leave-guard';

interface Options {
  onSaved?: () => void;
}

export function useInvoiceEditor({ onSaved }: Options = {}) {
  const [state, dispatch] = useReducer(editorReducer, undefined, createInitialState);
  const { draft, saved, status, touched, submitted, serverErrors } = state;

  const totals = useMemo(() => computeTotals(draft), [draft]);
  const validation = useMemo(() => InvoiceInputSchema.safeParse(draft), [draft]);
  const clientErrors = useMemo(
    () => (validation.success ? {} : issuesByPath(toFieldIssues(validation.error))),
    [validation],
  );

  const savedSnapshot = useMemo(() => saved && JSON.stringify(toDraft(saved)), [saved]);
  const isDirty = savedSnapshot !== JSON.stringify(draft);
  const hasUnsavedChanges = isDirty && saved !== null;

  useLeaveGuard(hasUnsavedChanges);

  const confirmDiscard = () => !hasUnsavedChanges || window.confirm('Discard unsaved changes?');

  const errorFor = useCallback(
    (path: string) =>
      serverErrors[path] ?? (submitted || touched.has(path) ? clientErrors[path] : undefined),
    [serverErrors, clientErrors, submitted, touched],
  );

  const update = useCallback((recipe: Recipe) => dispatch({ type: 'edit', recipe }), []);

  const markTouched = useCallback((path: string) => dispatch({ type: 'touch', path }), []);

  const opened = (invoice: Invoice) => {
    dispatch({ type: 'opened', invoice });
    invoiceUrl.write(invoice.id);
  };

  const load = useCallback(async (id: string) => {
    dispatch({ type: 'loading' });
    try {
      opened(await invoiceApi.get(id));
    } catch (err) {
      invoiceUrl.write(null);
      const notFound = err instanceof ApiError && err.status === 404;
      dispatch({ type: 'failed', message: notFound ? 'That invoice no longer exists.' : errorMessage(err) });
    }
  }, []);

  const open = (id: string) => {
    if (confirmDiscard()) void load(id);
  };

  const startNew = () => {
    if (!confirmDiscard()) return false;
    dispatch({ type: 'reset' });
    invoiceUrl.write(null);
    return true;
  };

  const save = useCallback(async (): Promise<Invoice | null> => {
    if (!validation.success) {
      dispatch({ type: 'invalid' });
      focusFirstInvalid();
      return null;
    }
    dispatch({ type: 'saving' });
    try {
      const invoice = saved
        ? await invoiceApi.update(saved.id, validation.data)
        : await invoiceApi.create(validation.data);
      opened(invoice);
      invoiceDefaults.write(validation.data, termDays(validation.data));
      onSaved?.();
      return invoice;
    } catch (err) {
      const issues = err instanceof ApiError ? err.issues : [];
      dispatch({ type: 'failed', message: errorMessage(err), issues });
      if (issues.length) focusFirstInvalid();
      return null;
    }
  }, [validation, saved, onSaved]);

  const send = useCallback(
    async (to: string): Promise<SendInvoiceResponse> => {
      const invoice = isDirty ? await save() : saved;
      if (!invoice) throw new Error('Fix the highlighted fields first, then send.');
      const result = await invoiceApi.send(invoice.id, to);
      if (result.sentAt) dispatch({ type: 'sent', sentAt: result.sentAt });
      onSaved?.();
      return result;
    },
    [isDirty, saved, save, onSaved],
  );

  useEffect(() => {
    const id = invoiceUrl.read();
    if (id) void load(id);
  }, [load]);

  return {
    draft,
    saved,
    totals,
    status,
    isDirty,
    errorFor,
    update,
    markTouched,
    save,
    send,
    open,
    startNew,
  };
}

export type InvoiceEditor = ReturnType<typeof useInvoiceEditor>;
