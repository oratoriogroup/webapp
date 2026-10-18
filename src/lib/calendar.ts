import { EVENT, SITE_URL, VENUE_QUERY } from './event';

const utcStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const DESCRIPTION = `${EVENT.tagline}. Live in Lagos and streaming worldwide. Watch live: ${SITE_URL}/livestream`;

export const googleCalendarUrl = () => {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${EVENT.name}: ${EVENT.theme}`,
    dates: `${utcStamp(EVENT.startISO)}/${utcStamp(EVENT.endISO)}`,
    details: DESCRIPTION,
    location: VENUE_QUERY,
    ctz: 'Africa/Lagos',
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
};

// RFC 5545 text escaping.
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export const icsContent = () =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Oratorio Music Foundation//Oratorio 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:oratorio-2026@oratoriogroup.org',
    `DTSTAMP:${utcStamp(new Date().toISOString())}`,
    `DTSTART:${utcStamp(EVENT.startISO)}`,
    `DTEND:${utcStamp(EVENT.endISO)}`,
    `SUMMARY:${esc(`${EVENT.name}: ${EVENT.theme}`)}`,
    `DESCRIPTION:${esc(DESCRIPTION)}`,
    `LOCATION:${esc(VENUE_QUERY)}`,
    `URL:${SITE_URL}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(`${EVENT.name} is tomorrow`)}`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(`${EVENT.name} starts in 2 hours`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
