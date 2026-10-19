import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { clientIp, sameOrigin, rateLimited, cleanText } from '@/lib/security';

export const dynamic = 'force-dynamic';

const fail = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  const h = req.headers;
  if (!sameOrigin(h)) return fail(403, 'Request not allowed.');
  const ip = clientIp(h);
  if (rateLimited(`testimony:${ip}`, 12, 10 * 60_000)) return fail(429, 'You have shared a few already. Please try again later.');
  if (Number(h.get('content-length') || 0) > 8_000) return fail(413, 'Request too large.');

  let body: { name?: unknown; location?: unknown; message?: unknown; hp?: unknown; t?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail(400, 'Invalid request.');
  }
  if (body.hp) return NextResponse.json({ ok: true });
  if (typeof body.t !== 'number' || Date.now() - body.t < 3000) return fail(400, 'Please take a moment before sending.');

  const name = cleanText(body.name, 80);
  const location = cleanText(body.location, 80);
  const message = cleanText(body.message, 1000);
  if (name.length < 2) return fail(422, 'Please enter your name.');
  if (message.length < 10) return fail(422, 'Please write a little more about your testimony.');
  if ((message.match(/https?:\/\//g) || []).length > 1) return fail(422, 'Please remove the links from your message.');

  await sql`insert into public.testimonies (name, location, message, ip) values (${name}, ${location || null}, ${message}, ${ip})`;
  return NextResponse.json({ ok: true });
}
