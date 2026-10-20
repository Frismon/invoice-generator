import type { ZodError } from 'zod';
import type { FieldIssue } from './types';

/** Zod issues → [{ path: "items.0.quantity", message }] */
export function toFieldIssues(error: ZodError): FieldIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

/** First message per path, for quick lookup in the form. */
export function issuesByPath(issues: FieldIssue[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of issues) map[issue.path] ??= issue.message;
  return map;
}
