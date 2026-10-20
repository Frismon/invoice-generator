import nodemailer from 'nodemailer';
import type { Env } from '../config/env';

export interface OutgoingMail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendResult {
  messageId: string;
  /** true when SMTP is not configured and the message was only logged. */
  preview: boolean;
}

export interface Mailer {
  send(mail: OutgoingMail): Promise<SendResult>;
}

export function createMailer(env: Env, log: (msg: string) => void = console.warn): Mailer {
  if (!env.SMTP_HOST) {
    const transport = nodemailer.createTransport({ jsonTransport: true });
    return {
      async send(mail) {
        const info = await transport.sendMail({ from: env.MAIL_FROM, ...mail });
        log(`[mail] SMTP not configured; email to ${mail.to} was logged, not delivered`);
        return { messageId: info.messageId, preview: true };
      },
    };
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });

  return {
    async send(mail) {
      const info = await transport.sendMail({ from: env.MAIL_FROM, ...mail });
      return { messageId: info.messageId, preview: false };
    },
  };
}
