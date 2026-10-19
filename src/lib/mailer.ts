import 'server-only';
import nodemailer from 'nodemailer';
import { icsContent } from './calendar';
import { registrationEmail } from './email-template';
import type { ConnectType } from './form';

// Resend (preferred) when RESEND_API_KEY is set, otherwise SMTP.
const useResend = () => !!process.env.RESEND_API_KEY;
export const mailConfigured = () => useResend() || !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transport: ReturnType<typeof nodemailer.createTransport> | null = null;
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

const sendViaResend = async (m: { to: string; subject: string; html: string; text: string; ics: string }) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [m.to],
      reply_to: process.env.MAIL_REPLY_TO || undefined,
      subject: m.subject,
      html: m.html,
      text: m.text,
      attachments: [{ filename: 'oratorio-2026.ics', content: Buffer.from(m.ics).toString('base64') }],
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
};

export const sendRegistrationEmail = async (r: { fullName: string; email: string; refCode: string; connect: ConnectType; checkinCode?: string | null }) => {
  const { subject, html, text } = registrationEmail(r);
  if (useResend()) return sendViaResend({ to: r.email, subject, html, text, ics: icsContent() });
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
