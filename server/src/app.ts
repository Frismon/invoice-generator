import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyServerOptions } from 'fastify';
import { errorHandler } from './common/error-handler';
import type { Db } from './db/client';
import type { Mailer } from './mail/mailer';
import { customersModule } from './modules/customers';
import { invoicesModule } from './modules/invoices';
import { registerWebStatic } from './plugins/web-static';

interface AppDeps {
  db: Db;
  mailer: Mailer;
  corsOrigin?: string;
  /** Serve the built frontend from web/dist when it exists. */
  serveWeb?: boolean;
  logger?: FastifyServerOptions['logger'];
}

export async function buildApp({ db, mailer, corsOrigin, serveWeb = false, logger = false }: AppDeps) {
  const app = Fastify({ logger, bodyLimit: 256 * 1024 });

  if (corsOrigin) await app.register(cors, { origin: corsOrigin });
  await app.register(rateLimit, { global: false });
  app.setErrorHandler(errorHandler);

  app.get('/api/health', async () => ({ ok: true }));
  await app.register(invoicesModule({ db, mailer }), { prefix: '/api/invoices' });
  await app.register(customersModule({ db }), { prefix: '/api/customers' });

  if (serveWeb) await registerWebStatic(app);

  return app;
}
