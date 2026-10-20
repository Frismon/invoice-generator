import type { FieldIssue } from '@invoice/shared';

export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly issues?: FieldIssue[],
  ) {
    super(message);
    this.name = code;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(404, 'NotFound', message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, issues?: FieldIssue[]) {
    super(409, 'Conflict', message, issues);
  }
}
