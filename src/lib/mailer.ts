import 'server-only';
import nodemailer from 'nodemailer';
import { EVENT, SITE_URL, DIRECTIONS_URL } from './event';
import { googleCalendarUrl, icsContent } from './calendar';
import { escapeHtml } from './security';
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

const INTRO: Record<ConnectType, string> = {
  attend: 'Your place at the venue is noted. Please arrive early, as seating is limited.',
  online: 'You are registered to watch online. The livestream will be on our website on the day.',
  volunteer: 'Thank you for offering to serve. The team will review your application and contact you about the next steps.',
  partner: 'Thank you for considering a partnership. A member of the team will reach out to you shortly.',
};

const button = (href: string, label: string, primary = false) =>
  `<a href="${href}" style="display:inline-block;margin:6px 4px;padding:12px 20px;border-radius:999px;font-weight:600;font-size:14px;text-decoration:none;${
    primary ? 'background:#17120E;color:#ffffff;' : 'background:#ffffff;color:#17120E;border:1px solid #d9cfc2;'
  }">${label}</a>`;

export const sendRegistrationEmail = async (r: { fullName: string; email: string; refCode: string; connect: ConnectType }) => {
  const first = escapeHtml(r.fullName.trim().split(/\s+/)[0] || 'there');
  const live = `${SITE_URL}/live`;
  const html = `<!doctype html><html><body style="margin:0;background:#f5f0e8;font-family:Helvetica,Arial,sans-serif;color:#17120E">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#0d0a08;padding:28px;text-align:center"><img src="${SITE_URL}/images/logo-white.png" alt="Oratorio Music Foundation" width="200" style="max-width:200px;height:auto"></td></tr>
<tr><td style="padding:32px 28px 8px">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#b8862b;font-weight:700">Registration confirmed</p>
<h1 style="margin:0 0 14px;font-size:26px;line-height:1.25">You are registered, ${first}.</h1>
<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#4a4038">${INTRO[r.connect]}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6ef;border-radius:12px"><tr><td style="padding:18px 20px;font-size:14px;line-height:1.7">
<strong style="font-size:17px">${EVENT.name}: ${EVENT.theme}</strong><br>
${EVENT.dateLabel}, ${EVENT.timeLabel}<br>
${escapeHtml(EVENT.venueName)}<br>${escapeHtml(EVENT.venueAddress)}<br>
<span style="color:#6b6158">Reference: <strong style="color:#17120E">${r.refCode}</strong></span>
</td></tr></table>
<p style="text-align:center;margin:22px 0 6px">
${button(googleCalendarUrl(), 'Add to Google Calendar', true)}
${button(r.connect === 'online' ? live : DIRECTIONS_URL, r.connect === 'online' ? 'Livestream page' : 'Get directions')}
</p>
<p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#6b6158;text-align:center">The calendar file is attached to this email for Apple Calendar and Outlook.</p>
</td></tr>
<tr><td style="padding:24px 28px 28px;font-size:12px;color:#8a7f74;text-align:center;line-height:1.6">
Streaming worldwide at <a href="${live}" style="color:#8a7f74">${live.replace('https://', '')}</a><br>Copyright &copy; Oratorio 2026
</td></tr></table></td></tr></table></body></html>`;

  const text = `You are registered, ${r.fullName}.\n\n${INTRO[r.connect]}\n\n${EVENT.name}: ${EVENT.theme}\n${EVENT.dateLabel}, ${EVENT.timeLabel}\n${EVENT.venueName}, ${EVENT.venueAddress}\nReference: ${r.refCode}\n\nAdd to Google Calendar: ${googleCalendarUrl()}\nLivestream: ${live}\n\nCopyright (c) Oratorio 2026`;

  await getTransport().sendMail({
    from: process.env.MAIL_FROM,
    replyTo: process.env.MAIL_REPLY_TO || undefined,
    to: r.email,
    subject: `You are registered for ${EVENT.name}`,
    text,
    html,
    attachments: [{ filename: 'oratorio-2026.ics', content: icsContent(), contentType: 'text/calendar; charset=utf-8' }],
  });
};
