import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { toFieldIssues, type ApiErrorBody } from '@invoice/shared';
import { AppError } from './errors';


export function errorHandler(err: FastifyError | Error, req: FastifyRequest, reply: FastifyReply) {
  if (err instanceof ZodError) {
    return reply.status(400).send({
      error: 'ValidationError',
      message: 'Some fields need attention',
      issues: toFieldIssues(err),
    } satisfies ApiErrorBody);
  }

  if (err instanceof AppError) {
    return reply.status(err.statusCode).send({
      error: err.code,
      message: err.message,
      issues: err.issues,
    } satisfies ApiErrorBody);
  }

  const statusCode = 'statusCode' in err && err.statusCode && err.statusCode < 500 ? err.statusCode : 500;
  if (statusCode === 500) {
    req.log.error(err);
    return reply.status(500).send({
      error: 'InternalError',
      message: 'Something went wrong on our side',
    } satisfies ApiErrorBody);
  }
  return reply.status(statusCode).send({ error: err.name, message: err.message } satisfies ApiErrorBody);
}
