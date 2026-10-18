import { NextResponse } from 'next/server';
import { createHash, randomBytes } from 'node:crypto';
import { sql } from '@/lib/db';
import { SECTIONS, otherKey, type Answers } from '@/lib/form';
import { clientIp, sameOrigin, rateLimited, cleanText } from '@/lib/security';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
const hash = (t: string) => createHash('sha256').update(t).digest('hex');
const fail = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status });

// Only answers to real form questions are kept, as plain capped strings.
const ALLOWED = new Map(SECTIONS.flatMap((s) => s.questions.flatMap((q) => [[q.entry, q] as const, ...(q.other ? [[otherKey(q.entry), q] as const] : [])])));
const sanitise = (input: unknown): Answers => {
  const out: Answers = {};
  if (!input || typeof input !== 'object') return out;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    const q = ALLOWED.get(k);
    if (!q) continue;
    if (Array.isArray(v)) out[k] = v.slice(0, 20).map((x) => cleanText(x, 300)).filter(Boolean);
    else if (v != null && v !== '') out[k] = cleanText(v, q.type === 'paragraph' ? 2000 : 300);
  }
  return out;
};

// Save (create or update) a draft. Returns the resume token.
export async function POST(req: Request) {
  const h = req.headers;
  if (!sameOrigin(h)) return fail(403, 'Request not allowed.');
  if (rateLimited(`draft-save:${clientIp(h)}`, 30, 10 * 60_000)) return fail(429, 'Too many saves. Please wait a few minutes.');
  if (Number(h.get('content-length') || 0) > 32_000) return fail(413, 'Request too large.');
  if ((await getSettings()).registration_open !== 'true') return fail(403, 'Registration is closed.');

  let body: { token?: unknown; answers?: unknown; step?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail(400, 'Invalid request.');
  }
  const answers = sanitise(body.answers);
  const step = Math.max(0, Math.min(3, Number(body.step) || 0));
  let token = typeof body.token === 'string' && TOKEN_RE.test(body.token) ? body.token : null;

  if (token) {
    const r = await sql`update public.registration_drafts set answers = ${sql.json(answers)}, step = ${step}, updated_at = now()
      where token_hash = ${hash(token)} and expires_at > now() returning 1`;
    if (r.length) return NextResponse.json({ ok: true, token });
  }
  token = randomBytes(32).toString('base64url');
  await sql`insert into public.registration_drafts (token_hash, answers, step) values (${hash(token)}, ${sql.json(answers)}, ${step})`;
  return NextResponse.json({ ok: true, token });
}

// Load a draft by its resume token.
export async function GET(req: Request) {
  if (rateLimited(`draft-load:${clientIp(req.headers)}`, 30, 10 * 60_000)) return fail(429, 'Too many attempts. Please wait a few minutes.');
  const token = new URL(req.url).searchParams.get('token') || '';
  if (!TOKEN_RE.test(token)) return fail(400, 'This link is not valid.');
  const [d] = await sql<{ answers: Answers; step: number }[]>`
    select answers, step from public.registration_drafts where token_hash = ${hash(token)} and expires_at > now() limit 1`;
  if (!d) return fail(404, 'This saved registration was not found. It may have been completed already.');
  return NextResponse.json({ ok: true, answers: d.answers, step: d.step }, { headers: { 'Cache-Control': 'no-store' } });
}
