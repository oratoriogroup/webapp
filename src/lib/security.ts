import 'server-only';
import { SITE_URL } from './event';

// Behind Cloudflare and nginx. nginx sets X-Real-IP from Cloudflare's
// CF-Connecting-IP (real_ip module, Cloudflare ranges only), so X-Real-IP is
// trusted first. Never trust X-Forwarded-For from the client.
export const clientIp = (h: Headers) =>
  (h.get('x-real-ip') || h.get('cf-connecting-ip') || '').trim().slice(0, 64) || 'unknown';

// CSRF defence for JSON route handlers: browsers always send Origin on a
// cross-site POST, so anything not from our own origin is refused.
export const sameOrigin = (h: Headers) => {
  const origin = h.get('origin');
  if (!origin) return false;
  const allowed = new Set([SITE_URL, SITE_URL.replace('://', '://www.')]);
  if (process.env.NODE_ENV !== 'production') allowed.add('http://localhost:3000').add('http://localhost:3100');
  // Local testing of a production build only. Never set on the server.
  for (const o of String(process.env.EXTRA_ALLOWED_ORIGINS || '').split(',')) if (o.trim()) allowed.add(o.trim());
  return allowed.has(origin);
};

// Small in-memory sliding window limiter. The app runs as one Node process,
// so this is shared by every request it serves.
const buckets = new Map<string, number[]>();
export const rateLimited = (key: string, max: number, windowMs: number) => {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return hits.length > max;
};

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const newRefCode = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return 'OR26-' + Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join('');
};

// Server-side text cleaning for anything people type. Removes HTML tags,
// control characters and zero-width characters, then trims and caps length.
// Output is still escaped wherever it is rendered (React and the email
// template both escape), so this is a second layer, not the only one.
export const cleanText = (raw: unknown, max: number) =>
  String(raw ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028\u2029\uFEFF]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
