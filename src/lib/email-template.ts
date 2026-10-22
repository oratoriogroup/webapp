// Registration confirmation email. Table layout and inline styles only, so it
// renders the same in Gmail, Outlook, Apple Mail and phone mail apps. Images
// are small JPG/PNG files hosted on the site (about 140KB in total).
import { EVENT, SITE_URL, DIRECTIONS_URL, CONTACTS, WHATSAPP_GROUP_URL, SOCIALS, YOUTUBE_CHANNEL_URL, whatsappLink } from './event';
import { googleCalendarUrl } from './calendar';
import type { ConnectType } from './form';
import { passUrl } from './checkin';

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
  `<a href="${href}" target="_blank" class="btn" style="display:inline-block;margin:6px 4px;padding:13px 22px;border-radius:999px;background:${bg};color:${color};border:1px solid ${border};font-family:${FONT};font-size:14px;font-weight:700;text-decoration:none;mso-padding-alt:0">${label}</a>`;

const row = (label: string, value: string, last = false) => {
  const b = last ? '' : `border-bottom:1px solid ${LINE};`;
  return `<tr><td class="lbl" style="padding:10px 0;${b}font-family:${FONT};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};width:110px;vertical-align:top">${label}</td><td class="val" style="padding:10px 0;${b}font-family:${FONT};font-size:15px;color:${INK};font-weight:600">${value}</td></tr>`;
};

export const registrationEmail = (r: { fullName: string; refCode: string; connect: ConnectType; checkinCode?: string | null }) => {
  // Full name as typed: many people write the surname first.
  const first = esc(r.fullName.trim().replace(/\s+/g, ' ') || 'there');
  const live = `${SITE_URL}/livestream`;
  const img = (p: string) => `${SITE_URL}/images/${p}`;
  const inPerson = r.connect !== 'online';

  const contacts = CONTACTS.map(
    (c, i) => `<tr>
      <td class="cnum" style="padding:12px 0;${i ? `border-top:1px solid ${LINE};` : ''}font-family:${FONT};font-size:16px;font-weight:700;color:${INK};white-space:nowrap">${c.label}</td>
      <td class="cbtn" align="right" style="padding:12px 0;${i ? `border-top:1px solid ${LINE};` : ''}">
        <a href="${whatsappLink(c.intl)}" target="_blank" style="display:inline-block;margin-top:4px;padding:8px 14px;border-radius:999px;background:${GREEN};color:#fff;font-family:${FONT};font-size:13px;font-weight:700;text-decoration:none">WhatsApp</a>
        <a href="tel:+${c.intl}" style="display:inline-block;margin:4px 0 0 6px;padding:8px 14px;border-radius:999px;background:#fde8ea;color:${RED};font-family:${FONT};font-size:13px;font-weight:700;text-decoration:none">Call</a>
      </td></tr>`,
  ).join('');

  // Brand icons as PNG (Gmail and Outlook do not show SVG).
  const socials = SOCIALS.map(
    (s) => `<a href="${s.url}" target="_blank" style="display:inline-block;margin:0 5px;text-decoration:none"><img src="${img(`social/${s.key}.png`)}" width="34" height="34" alt="${s.label}" title="${s.label}" style="display:block;width:34px;height:34px;border:0"></a>`,
  ).join('');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${EVENT.name}</title>
<style>
  @media only screen and (max-width:620px) {
    .shell { padding:0 !important; }
    .card { border-radius:0 !important; border-left:0 !important; border-right:0 !important; }
    .px { padding-left:20px !important; padding-right:20px !important; }
    .h1 { font-size:24px !important; }
    .lbl { width:84px !important; }
    .qr { width:200px !important; height:200px !important; }
    .btn { display:block !important; margin:8px 0 !important; text-align:center !important; }
    .pass { padding:20px 14px !important; }
  }
  /* Phones under ~420px: stack detail labels over their values, and put the
     WhatsApp / Call buttons under each number so nothing runs off screen. */
  @media only screen and (max-width:420px) {
    .px { padding-left:16px !important; padding-right:16px !important; }
    .box { padding:16px 16px 6px !important; }
    .lbl { display:block !important; width:auto !important; padding:10px 0 2px !important; border-bottom:0 !important; font-size:11px !important; }
    .val { display:block !important; padding:0 0 10px !important; }
    .cnum { display:block !important; padding:12px 0 6px !important; }
    .cbtn { display:block !important; text-align:left !important; padding:0 0 12px !important; border-top:0 !important; }
    .h1 { font-size:23px !important; }
  }
</style></head>
<body style="margin:0;padding:0;background:#f3eee9;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">You are registered for ${EVENT.name}: ${EVENT.theme}, ${EVENT.dateShort}, ${EVENT.timeLabel}. Your check-in pass is inside.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3eee9"><tr><td align="center" class="shell" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="card" style="max-width:640px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid ${LINE}">

<tr><td style="height:6px;background:${RED};background-image:linear-gradient(90deg,${RED},#e0a21b,#7a2a8f);font-size:0;line-height:0">&nbsp;</td></tr>

<tr><td align="center" class="px" style="padding:32px 44px 4px">
  <a href="${SITE_URL}" target="_blank"><img src="${img('logo-color.png')}" width="200" alt="Oratorio Music Foundation" style="display:block;width:200px;max-width:62%;height:auto;border:0"></a>
</td></tr>

<tr><td class="px" style="padding:26px 44px 4px">
  <p style="margin:0 0 10px;font-family:${FONT};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#15803d;font-weight:700">&#10003;&nbsp; Registration confirmed</p>
  <h1 class="h1" style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.25;color:${INK};font-weight:normal">Dear ${first},</h1>
  <p style="margin:0;font-family:${FONT};font-size:16px;line-height:1.65;color:#3d3240">${INTRO[r.connect]}</p>
</td></tr>

<tr><td class="px" style="padding:22px 44px 4px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffaf6;border:1px solid ${LINE};border-radius:14px"><tr><td class="box" style="padding:18px 22px 8px">
    <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:21px;color:${INK}">${EVENT.name}: <em style="color:${RED}">${EVENT.theme}</em></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row('Date', EVENT.dateLabel)}
      ${row('Time', EVENT.timeLabel)}
      ${row('Venue', `${esc(EVENT.venueName)}<br><span style="font-weight:400;color:${MUTED}">${esc(EVENT.venueAddress)}</span>`)}
      ${row('Reference', `<span style="font-family:Menlo,Consolas,monospace;letter-spacing:1px">${r.refCode}</span>`, true)}
    </table>
  </td></tr></table>
</td></tr>

${r.checkinCode ? `<tr><td class="px" style="padding:22px 44px 4px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed #f0a24a;border-radius:16px"><tr><td align="center" class="pass" style="padding:24px 18px">
    <p style="margin:0;font-family:${FONT};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${RED};font-weight:700">Your check-in pass</p>
    <p style="margin:8px 0 0;font-family:${FONT};font-size:14px;line-height:1.5;color:${MUTED}">Save it to your phone and show the QR code at the registration stand.</p>
    <img src="${SITE_URL}/api/pass/${r.checkinCode}" width="220" height="220" class="qr" alt="Your Oratorio 2026 check-in QR code" style="display:block;width:220px;height:220px;margin:18px auto 16px;border:0">
    ${button(passUrl(r.checkinCode), 'Save your pass to your phone', INK)}
  </td></tr></table>
</td></tr>` : ''}

<tr><td align="center" class="px" style="padding:20px 44px 4px">
  ${button(googleCalendarUrl(), 'Add to Google Calendar', RED)}
  <p style="margin:6px 0 0;font-family:${FONT};font-size:12px;color:${MUTED}">Apple Calendar or Outlook: open the attached calendar file.</p>
</td></tr>

${inPerson ? `<tr><td class="px" style="padding:24px 44px 4px">
  <a href="${DIRECTIONS_URL}" target="_blank"><img src="${img('email-map.jpg')}" width="552" alt="Map: ${esc(EVENT.venueName)}, ${esc(EVENT.venueAddress)}. Tap for directions." style="display:block;width:100%;max-width:552px;height:auto;border:0;border-radius:14px"></a>
  <p style="margin:10px 0 0;font-family:${FONT};font-size:13px;color:${MUTED};text-align:center">Tap the map for directions in Google Maps.</p>
</td></tr>` : `<tr><td align="center" class="px" style="padding:16px 44px 4px">
  ${button(live, 'Open the livestream page', INK)}
</td></tr>`}

<tr><td class="px" style="padding:24px 44px 4px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};border-radius:14px"><tr><td class="box" style="padding:16px 20px 12px">
    <p style="margin:0 0 4px;font-family:${FONT};font-size:15px;font-weight:700;color:${INK}">Questions? Talk to us</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${contacts}</table>
    <p style="margin:6px 0 4px;text-align:center"><a href="${WHATSAPP_GROUP_URL}" target="_blank" style="display:block;padding:12px 16px;border-radius:12px;background:#e9fbef;color:#128c4a;font-family:${FONT};font-size:14px;font-weight:700;text-decoration:none">Join the Oratorio WhatsApp group</a></p>
  </td></tr></table>
</td></tr>

<tr><td align="center" class="px" style="padding:26px 44px 4px">
  <a href="${SITE_URL}" target="_blank"><img src="${img('email-flyer.jpg')}" width="460" alt="${EVENT.name} lineup" style="display:block;width:100%;max-width:460px;height:auto;border:0;border-radius:14px"></a>
  ${inPerson ? `<p style="margin:14px 0 0;font-family:${FONT};font-size:14px;line-height:1.6;color:#3d3240">Cannot make it to Lagos? Watch live on <a href="${live}" target="_blank" style="color:${RED};font-weight:700">our website</a> or <a href="${YOUTUBE_CHANNEL_URL}" target="_blank" style="color:${RED};font-weight:700">YouTube</a>.</p>` : ''}
</td></tr>

<tr><td class="px" style="padding:26px 44px 32px">
  <p style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-style:italic;color:${INK};text-align:center">&ldquo;Enter into His gates with thanksgiving.&rdquo; Psalm 100:4</p>
  <p style="margin:0;font-family:${FONT};font-size:14px;line-height:1.6;color:${INK}">With gratitude,<br><strong>Dr. Oyindamola Adejumo-Ayibiowu</strong><br><span style="color:${MUTED}">Convener &amp; Founder, ${EVENT.organiser}</span></p>
</td></tr>

<tr><td align="center" class="px" style="background:#2b0a1f;padding:28px 44px 26px">
  <img src="${img('logo-white.png')}" width="140" alt="Oratorio Music Foundation" style="display:block;width:140px;height:auto;border:0;margin:0 auto">
  <p style="margin:18px 0 0;font-size:0;line-height:0">${socials}</p>
  <p style="margin:18px 0 0;font-family:${FONT};font-size:11px;line-height:1.6;color:#b9a3b1">Copyright &copy; Oratorio 2026<br>You received this email because you registered at <a href="${SITE_URL}" target="_blank" style="color:#e9d8e2;text-decoration:underline">oratoriogroup.org</a>.</p>
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
    ...(r.checkinCode ? ['', `Your check-in pass (show it at the registration stand): ${passUrl(r.checkinCode)}`] : []),
    '',
    `Add to Google Calendar: ${googleCalendarUrl()}`,
    `Directions: ${DIRECTIONS_URL}`,
    '',
    'Questions? WhatsApp or call:',
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
