import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';
import type { ApiErrorBody } from '@invoice/shared';

const webDist = resolve(import.meta.dirname, '../../../web/dist');

/** Serves the built frontend from web/dist, if it has been built. */
export async function registerWebStatic(app: FastifyInstance) {
  if (!existsSync(webDist)) return;
  await app.register(fastifyStatic, { root: webDist });
  // SPA fallback for /?id=… deep links; unknown /api routes stay JSON 404s.
  app.setNotFoundHandler((req, reply) =>
    req.url.startsWith('/api/')
      ? reply.status(404).send({ error: 'NotFound', message: 'Route not found' } satisfies ApiErrorBody)
      : reply.sendFile('index.html'),
  );
}
