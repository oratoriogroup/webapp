import 'server-only';
import { OTHER, otherKey, type Answers } from './form';

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
    for (const v of vals) body.append(`entry.${key}`, v);
    if (vals.includes(OTHER)) body.append(`entry.${key}.other_option_response`, String(answers[otherKey(key)] ?? ''));
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
