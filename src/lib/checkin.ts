import { SITE_URL } from './event';

// The QR on every pass opens this address. Staff signed in to the admin land
// on the check-in screen; anyone else sees the attendee's own pass.
export const checkinUrl = (code: string) => `${SITE_URL}/c/${code}`;
export const passUrl = (code: string) => `${SITE_URL}/pass/${code}`;
export const CHECKIN_CODE_RE = /^[A-Za-z0-9_-]{22}$/;
