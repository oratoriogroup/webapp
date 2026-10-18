import 'server-only';
import nodemailer from 'nodemailer';
import { icsContent } from './calendar';
import { registrationEmail } from './email-template';
import type { ConnectType } from './form';

export const mailConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transport: nodemailer.Transporter | null = null;
const getTransport = () => {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      pool: true,
      maxConnections: 3,
    });
  }
  return transport;
};

export const sendRegistrationEmail = async (r: { fullName: string; email: string; refCode: string; connect: ConnectType }) => {
  const { subject, html, text } = registrationEmail(r);
  await getTransport().sendMail({
    from: process.env.MAIL_FROM,
    replyTo: process.env.MAIL_REPLY_TO || undefined,
    to: r.email,
    subject,
    text,
    html,
    attachments: [{ filename: 'oratorio-2026.ics', content: icsContent(), contentType: 'text/calendar; charset=utf-8' }],
  });
};
