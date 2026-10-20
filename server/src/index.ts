import { buildApp } from './app';
import { createDb } from './db/client';
import { loadEnv } from './config/env';
import { createMailer } from './mail/mailer';

const env = loadEnv();
const isProd = env.NODE_ENV === 'production';

const app = await buildApp({
  db: createDb(env.DATABASE_PATH),
  mailer: createMailer(env),
  // In dev the Vite proxy makes requests same-origin; CORS is only for split deploys.
  corsOrigin: env.CORS_ORIGIN,
  serveWeb: isProd,
  logger: isProd ? true : { transport: { target: 'pino-pretty', options: { ignore: 'pid,hostname' } } },
});

if (!env.SMTP_HOST) {
  app.log.warn('SMTP_HOST is not set: emails will be logged instead of delivered (see .env.example)');
}

try {
  await app.listen({ host: env.HOST, port: env.PORT });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => void app.close().then(() => process.exit(0)));
}
