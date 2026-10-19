import { SITE_URL } from './event';

// The QR on every pass opens this address. Staff signed in to the admin land
// on the check-in screen; anyone else sees the attendee's own pass.
export const checkinUrl = (code: string) => `${SITE_URL}/c/${code}`;
export const passUrl = (code: string) => `${SITE_URL}/pass/${code}`;
export const CHECKIN_CODE_RE = /^[A-Za-z0-9_-]{22}$/;

// Check-in opens on the event day, two hours before the 4PM start, so early
// arrivals can be admitted. Before then no pass can be checked in (staff can
// still scan a pass to confirm it is genuine).
export const CHECKIN_OPENS_ISO = '2026-11-12T14:00:00+01:00';
export const CHECKIN_OPENS_LABEL = 'Thursday 12 November, 2:00 PM WAT';
export const checkinOpen = (now = Date.now()) => now >= Date.parse(CHECKIN_OPENS_ISO);
