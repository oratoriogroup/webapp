import 'server-only';
import { OTHER, otherKey, type Answers } from './form';

// Site answers that differ from the Google Form's own options. Each entry maps
// a site value to [Google option value] or to an "Other" text answer.
const GFORM_MAP: Record<string, Record<string, { value: string } | { other: string }>> = {
  // How did you hear about Oratorio 2026? (4 merged options on the site)
  '1707098136': {
    'Social media (Instagram, Facebook, TikTok, YouTube, WhatsApp)': { other: 'Social media' },
    'A friend or church member': { value: 'A friend / church member' },
    'Oratorio alumni': { value: 'Oratorio alumni' },
    'One of the guest ministers': { value: 'One of the guest ministers' },
  },
};

const FORM_RESPONSE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdo3_gG6YBSq2bhZMyMAjCsQwIVq4i5R81PuDqVV7FrAnlE-Q/formResponse';

// Copies a registration into the Google Form so its response sheet stays
// complete. Best effort: the database row is the record of truth, and a
// failure here is stored on the row for the admin to see.
export const forwardToGoogleForm = async (answers: Answers, path: number[]) => {
  // Set GFORM_FORWARD=off for local testing so test rows never reach the sheet.
  if (process.env.GFORM_FORWARD === 'off') return { ok: false as const, error: 'forwarding disabled' };
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(answers)) {
    if (key.endsWith('.other')) continue;
    const vals = Array.isArray(value) ? value : [value];
    const map = GFORM_MAP[key];
    const others: string[] = [];
    for (const v of vals) {
      const m = map?.[v];
      if (m && 'other' in m) others.push(m.other);
      else body.append(`entry.${key}`, m && 'value' in m ? m.value : v);
    }
    if (vals.includes(OTHER)) others.push(String(answers[otherKey(key)] ?? ''));
    if (others.length) {
      body.append(`entry.${key}`, OTHER);
      body.append(`entry.${key}.other_option_response`, others.join(', '));
    }
  }
  body.append('pageHistory', path.join(','));
  body.append('fvv', '1');
  try {
    const res = await fetch(FORM_RESPONSE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
    });
    // Google answers 200 (or a redirect to the thank-you page) on success.
    if (res.status === 200 || (res.status >= 300 && res.status < 400)) return { ok: true as const };
    return { ok: false as const, error: `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'request failed' };
  }
};
