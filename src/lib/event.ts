// Single source of truth for event facts shown across the site, emails and
// calendar files. Change a fact here and it changes everywhere.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://oratoriogroup.org').replace(/\/$/, '');

export const EVENT = {
  name: 'Oratorio 2026',
  theme: 'The Sound of Thanks',
  tagline: 'An Evening of Praise, Gratitude & Celebration',
  organiser: 'Oratorio Music Foundation',
  motto: 'Inspiring our generation',
  // 4PM WAT. WAT is UTC+1 all year (no daylight saving).
  startISO: '2026-11-12T16:00:00+01:00',
  // End time is an estimate used only for calendar entries.
  endISO: '2026-11-12T21:00:00+01:00',
  dateLabel: 'Thursday, 12 November 2026',
  dateShort: 'Thu 12 Nov 2026',
  timeLabel: '4PM WAT',
  venueName: "The Freudes Place (FP's Event Place)",
  venueAddress: '23 Ikorodu Road, Wasimi, Maryland, Lagos',
  experiences: ['Music', 'Worship', 'Drama', 'Comedy', 'Dance', 'Cultural Praise', 'Life-changing Ministrations'],
} as const;

export const VENUE_QUERY = `${EVENT.venueName}, ${EVENT.venueAddress}, Nigeria`;
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(VENUE_QUERY)}&output=embed`;
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(VENUE_QUERY)}`;

export const SOCIALS = [
  { key: 'facebook', label: 'Facebook', handle: 'officialoyindaadejumo', url: 'https://www.facebook.com/officialoyindaadejumo' },
  { key: 'instagram', label: 'Instagram', handle: '@officialoyindaadejumo', url: 'https://www.instagram.com/officialoyindaadejumo' },
  { key: 'tiktok', label: 'TikTok', handle: '@officialoyindaadejumo', url: 'https://www.tiktok.com/@officialoyindaadejumo' },
  { key: 'youtube', label: 'YouTube', handle: 'Oyindamola Adejumo Ayibiowu', url: 'https://www.youtube.com/@OyindamolaAdejumoAyibiowu' },
] as const;

export type Minister = { slug: string; name: string; role?: string; photo?: string };

export const CONVENER: Minister = {
  slug: 'oyindamola-adejumo-ayibiowu',
  name: 'Dr. Oyindamola Adejumo-Ayibiowu',
  role: 'Convener & Founder, Oratorio Music Foundation',
  photo: '/images/ministers/oyindamola-adejumo-ayibiowu.webp',
};

export const MINISTERS: Minister[] = [
  { slug: 'pelumi-deborah', name: 'Pelumi Deborah', photo: '/images/ministers/pelumi-deborah.webp' },
  { slug: 'adeyinka-alaseyori', name: 'Adeyinka Alaseyori', photo: '/images/ministers/adeyinka-alaseyori.webp' },
  { slug: 'woli-agba', name: 'Woli Agba', photo: '/images/ministers/woli-agba.webp' },
  { slug: 'tope-flourish', name: 'Tope Flourish', photo: '/images/ministers/tope-flourish.webp' },
  { slug: 'george-sax', name: 'George Sax', photo: '/images/ministers/george-sax.webp' },
  { slug: 'elijah-daniels', name: 'Elijah Daniels', photo: '/images/ministers/elijah-daniels.webp' },
  { slug: 'ester-jesus-baby', name: 'Ester Jesus Baby', photo: '/images/ministers/ester-jesus-baby.webp' },
];

export const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
