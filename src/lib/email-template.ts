// Registration confirmation email. Table layout and inline styles only, so it
// renders the same in Gmail, Outlook, Apple Mail and phone mail apps. Images
// are small JPG/PNG files hosted on the site (about 140KB in total).
import { EVENT, SITE_URL, DIRECTIONS_URL, CONTACTS, WHATSAPP_GROUP_URL, SOCIALS, YOUTUBE_CHANNEL_URL } from './event';
import { googleCalendarUrl } from './calendar';
import type { ConnectType } from './form';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const RED = '#c8202f';
const INK = '#1c1220';
const MUTED = '#6a5d6c';
const LINE = '#f0e2d8';
const GREEN = '#25D366';
const FONT = "'Helvetica Neue',Helvetica,Arial,sans-serif";

const INTRO: Record<ConnectType, string> = {
  attend: 'Thank you for registering to attend in person. Your place is noted. Please arrive early, as seating is limited.',
  online: 'Thank you for registering to watch online. The livestream plays on our website and YouTube channel on the day.',
  volunteer: 'Thank you for offering to serve. The team will review your application and contact you about orientation and next steps.',
  partner: 'Thank you for considering a partnership with us. A member of the team will reach out to you shortly.',
};

const button = (href: string, label: string, bg: string, color = '#ffffff', border = bg) =>
  `<a href="${href}" target="_blank" style="display:inline-block;margin:6px 4px;padding:13px 22px;border-radius:999px;background:${bg};color:${color};border:1px solid ${border};font-family:${FONT};font-size:14px;font-weight:700;text-decoration:none;mso-padding-alt:0">${label}</a>`;

const row = (label: string, value: string, last = false) => {
  const b = last ? '' : `border-bottom:1px solid ${LINE};`;
  return `<tr><td style="padding:10px 0;${b}font-family:${FONT};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};width:110px;vertical-align:top">${label}</td><td style="padding:10px 0;${b}font-family:${FONT};font-size:15px;color:${INK};font-weight:600">${value}</td></tr>`;
};

export const registrationEmail = (r: { fullName: string; refCode: string; connect: ConnectType }) => {
  // Full name as typed: many people write the surname first.
  const first = esc(r.fullName.trim().replace(/\s+/g, ' ') || 'there');
  const live = `${SITE_URL}/live`;
  const img = (p: string) => `${SITE_URL}/images/${p}`;

  const contacts = CONTACTS.map(
    (c) => `<tr>
      <td style="padding:8px 0;font-family:${FONT};font-size:16px;font-weight:700;color:${INK}">${c.label}</td>
      <td align="right" style="padding:8px 0">
        <a href="https://wa.me/${c.intl}" target="_blank" style="display:inline-block;padding:8px 14px;border-radius:999px;background:${GREEN};color:#fff;font-family:${FONT};font-size:13px;font-weight:700;text-decoration:none">WhatsApp</a>
        <a href="tel:+${c.intl}" style="display:inline-block;margin-left:6px;padding:8px 14px;border-radius:999px;background:#fde8ea;color:${RED};font-family:${FONT};font-size:13px;font-weight:700;text-decoration:none">Call</a>
      </td></tr>`,
  ).join('');

  const socials = SOCIALS.map((s) => `<a href="${s.url}" target="_blank" style="color:${MUTED};text-decoration:underline;margin:0 6px">${s.label}</a>`).join('');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${EVENT.name}</title></head>
<body style="margin:0;padding:0;background:#f6efe9;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">You are registered for ${EVENT.name}: ${EVENT.theme}, ${EVENT.dateShort}, ${EVENT.timeLabel}. Your reference is ${r.refCode}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6efe9"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid ${LINE}">

<tr><td style="height:6px;background:${RED};background-image:linear-gradient(90deg,${RED},#e0a21b,#7a2a8f);font-size:0;line-height:0">&nbsp;</td></tr>

<tr><td align="center" style="padding:28px 28px 8px">
  <a href="${SITE_URL}" target="_blank"><img src="${img('logo-color.png')}" width="190" alt="Oratorio Music Foundation" style="display:block;width:190px;max-width:60%;height:auto;border:0"></a>
</td></tr>

<tr><td style="padding:20px 32px 4px">
  <p style="margin:0 0 8px;font-family:${FONT};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${RED};font-weight:700">Registration confirmed</p>
  <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;color:${INK};font-weight:normal">Dear ${first},</h1>
  <p style="margin:0 0 6px;font-family:${FONT};font-size:15px;line-height:1.65;color:#3d3240">${INTRO[r.connect]}</p>
</td></tr>

<tr><td style="padding:18px 32px 6px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffaf6;border:1px solid ${LINE};border-radius:14px"><tr><td style="padding:16px 20px">
    <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${INK}">${EVENT.name}: <em style="color:${RED}">${EVENT.theme}</em></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row('Date', EVENT.dateLabel)}
      ${row('Time', EVENT.timeLabel)}
      ${row('Venue', `${esc(EVENT.venueName)}<br><span style="font-weight:400;color:${MUTED}">${esc(EVENT.venueAddress)}</span>`)}
      ${row('Reference', `<span style="font-family:Menlo,Consolas,monospace;letter-spacing:1px">${r.refCode}</span>`, true)}
    </table>
  </td></tr></table>
</td></tr>

<tr><td align="center" style="padding:14px 24px 4px">
  ${button(googleCalendarUrl(), 'Add to Google Calendar', RED)}
  ${button(DIRECTIONS_URL, 'Get directions', '#ffffff', INK, '#d9cbbf')}
  <p style="margin:8px 0 0;font-family:${FONT};font-size:12px;color:${MUTED}">Using Apple Calendar or Outlook? Open the attached calendar file.</p>
</td></tr>

<tr><td style="padding:24px 32px 6px">
  <a href="${DIRECTIONS_URL}" target="_blank"><img src="${img('email-map.jpg')}" width="536" alt="Map: ${esc(EVENT.venueName)}, ${esc(EVENT.venueAddress)}. Tap for directions." style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:12px"></a>
  <p style="margin:8px 0 0;font-family:${FONT};font-size:13px;color:${MUTED};text-align:center">Tap the map for turn by turn directions in Google Maps.</p>
</td></tr>

<tr><td style="padding:22px 32px 6px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};border-radius:14px"><tr><td style="padding:16px 20px">
    <p style="margin:0 0 4px;font-family:${FONT};font-size:15px;font-weight:700;color:${INK}">Enquiries and directions</p>
    <p style="margin:0 0 6px;font-family:${FONT};font-size:13px;color:${MUTED}">Chat with us on WhatsApp or give us a call.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${contacts}</table>
  </td></tr></table>
</td></tr>

<tr><td align="center" style="padding:16px 32px 6px">
  ${button(WHATSAPP_GROUP_URL, 'Join our WhatsApp group', GREEN)}
</td></tr>

<tr><td align="center" style="padding:20px 32px 4px">
  <a href="${SITE_URL}" target="_blank"><img src="${img('email-flyer.jpg')}" width="420" alt="${EVENT.name} lineup" style="display:block;width:100%;max-width:420px;height:auto;border:0;border-radius:12px"></a>
</td></tr>

<tr><td align="center" style="padding:18px 32px 6px">
  <p style="margin:0;font-family:${FONT};font-size:14px;line-height:1.6;color:#3d3240">Cannot make it to Lagos? Watch live on <a href="${live}" target="_blank" style="color:${RED};font-weight:700">oratoriogroup.org/live</a> or on <a href="${YOUTUBE_CHANNEL_URL}" target="_blank" style="color:${RED};font-weight:700">YouTube</a>.</p>
</td></tr>

<tr><td style="padding:22px 32px 26px">
  <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;color:${INK};text-align:center">&ldquo;Enter into His gates with thanksgiving.&rdquo; Psalm 100:4</p>
  <p style="margin:0;font-family:${FONT};font-size:14px;line-height:1.6;color:${INK}">With gratitude,<br><strong>Dr. Oyindamola Adejumo-Ayibiowu</strong><br><span style="color:${MUTED}">Convener &amp; Founder, ${EVENT.organiser}</span></p>
</td></tr>

<tr><td style="background:#2b0a1f;padding:22px 28px;text-align:center">
  <img src="${img('logo-white.png')}" width="130" alt="Oratorio Music Foundation" style="display:inline-block;width:130px;height:auto;border:0">
  <p style="margin:12px 0 6px;font-family:${FONT};font-size:12px;color:#d9c7d3">${socials.replace(new RegExp(MUTED, 'g'), '#d9c7d3')}</p>
  <p style="margin:0;font-family:${FONT};font-size:11px;color:#a8939f">Copyright &copy; Oratorio 2026. You received this email because you registered at oratoriogroup.org.</p>
</td></tr>

</table></td></tr></table></body></html>`;

  const text = [
    `Dear ${r.fullName.trim().replace(/\s+/g, ' ') || 'there'},`,
    '',
    INTRO[r.connect],
    '',
    `${EVENT.name}: ${EVENT.theme}`,
    `${EVENT.dateLabel}, ${EVENT.timeLabel}`,
    `${EVENT.venueName}, ${EVENT.venueAddress}`,
    `Reference: ${r.refCode}`,
    '',
    `Add to Google Calendar: ${googleCalendarUrl()}`,
    `Directions: ${DIRECTIONS_URL}`,
    '',
    'Enquiries and directions (WhatsApp or call):',
    ...CONTACTS.map((c) => `  ${c.label}`),
    `Join our WhatsApp group: ${WHATSAPP_GROUP_URL}`,
    '',
    `Watch live: ${live}`,
    '',
    'With gratitude,',
    'Dr. Oyindamola Adejumo-Ayibiowu',
    `Convener & Founder, ${EVENT.organiser}`,
    '',
    'Copyright (c) Oratorio 2026',
  ].join('\n');

  return { subject: `You are registered for ${EVENT.name}: ${EVENT.theme}`, html, text };
};
