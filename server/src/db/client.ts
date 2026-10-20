import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { BOOTSTRAP_SQL, invoices } from './schema';

export function createDb(path: string) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const sqlite = new Database(path);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.exec(BOOTSTRAP_SQL);
  return drizzle(sqlite, { schema: { invoices } });
}

export type Db = ReturnType<typeof createDb>;

/** better-sqlite3 error, possibly wrapped by Drizzle. */
export function isUniqueViolation(err: unknown): boolean {
  let current: unknown = err;
  for (let depth = 0; current && depth < 3; depth++) {
    if ((current as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}
