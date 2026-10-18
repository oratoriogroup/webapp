import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { validateAll, connectTypeOf, ENTRY, type Answers } from '@/lib/form';
import { clientIp, sameOrigin, rateLimited, newRefCode } from '@/lib/security';
import { getSettings } from '@/lib/settings';
import { mailConfigured, sendRegistrationEmail } from '@/lib/mailer';
import { createHash } from 'node:crypto';

export const dynamic = 'force-dynamic';

const fail = (status: number, error: string, fields?: Record<string, string>) =>
  NextResponse.json({ ok: false, error, fields }, { status });

const alreadyRegistered = (by: 'email' | 'phone') =>
  fail(
    409,
    by === 'email'
      ? 'This email address is already registered for Oratorio 2026. Check your inbox for your confirmation.'
      : 'This phone number is already registered for Oratorio 2026. Each person can register once.',
    { [by === 'email' ? ENTRY.email : ENTRY.whatsapp]: by === 'email' ? 'Already registered.' : 'Already registered.' },
  );

// International digits, e.g. 08012345678 and +234 801 234 5678 both become 2348012345678.
const normalisePhone = (raw: string) => {
  const d = raw.replace(/\D/g, '');
  return /^0\d{10}$/.test(d) ? `234${d.slice(1)}` : d;
};

export async function POST(req: Request) {
  const h = req.headers;
  if (!sameOrigin(h)) return fail(403, 'Request not allowed.');
  const ip = clientIp(h);
  if (rateLimited(`reg:${ip}`, 6, 10 * 60_000)) return fail(429, 'Too many attempts. Please wait a few minutes and try again.');

  const len = Number(h.get('content-length') || 0);
  if (len > 32_000) return fail(413, 'Request too large.');

  let body: { answers?: Answers; hp?: string; t?: number; draftToken?: string };
  try {
    body = await req.json();
  } catch {
    return fail(400, 'Invalid request.');
  }

  // Honeypot and time-on-form: bots fill hidden fields and submit instantly.
  if (body.hp) return NextResponse.json({ ok: true, ref: newRefCode() });
  if (typeof body.t !== 'number' || Date.now() - body.t < 4000) return fail(400, 'Please take a moment to complete the form.');

  const settings = await getSettings();
  if (settings.registration_open !== 'true') return fail(403, 'Registration is closed.');

  const input = body.answers && typeof body.answers === 'object' ? body.answers : {};
  const { errors, clean } = validateAll(input);
  if (Object.keys(errors).length) return fail(422, 'Please check the highlighted fields.', errors);

  const connect = connectTypeOf(clean)!;
  const fullName = String(clean[ENTRY.fullName]);
  const email = String(clean[ENTRY.email]).toLowerCase();

  // One registration per email address and one per phone number, whatever
  // the type. The database enforces the same rule with unique indexes.
  const phoneNorm = normalisePhone(String(clean[ENTRY.whatsapp]));
  const existing = await sql<{ email: string; phone_norm: string | null }[]>`
    select email, phone_norm from public.registrations
    where lower(email) = ${email} or phone_norm = ${phoneNorm}
    limit 1`;
  if (existing[0]) return alreadyRegistered(existing[0].email.toLowerCase() === email ? 'email' : 'phone');

  const refCode = newRefCode();
  let row: { id: string } | undefined;
  try {
  [row] = await sql<{ id: string }[]>`
    insert into public.registrations
      (ref_code, full_name, whatsapp, phone_norm, email, age_range, location, church, connect_type, party_size, volunteer_kind, answers, ip, user_agent)
    values
      (${refCode}, ${fullName}, ${String(clean[ENTRY.whatsapp])}, ${phoneNorm}, ${email}, ${(clean[ENTRY.age] as string) ?? null},
       ${(clean[ENTRY.location] as string) ?? null}, ${(clean[ENTRY.church] as string) ?? null}, ${connect},
       ${(clean[ENTRY.partySize] as string) ?? null}, ${(clean[ENTRY.volunteerKind] as string) ?? null},
       ${sql.json(clean)}, ${ip}, ${(h.get('user-agent') || '').slice(0, 300)})
    returning id`;
  } catch (e) {
    // Two submissions racing past the check above: the unique index decides.
    if ((e as { code?: string }).code === '23505') return alreadyRegistered(String((e as { constraint_name?: string }).constraint_name || '').includes('phone') ? 'phone' : 'email');
    throw e;
  }

  const mail = await (
    mailConfigured()
      ? sendRegistrationEmail({ fullName, email, refCode, connect }).then(
          () => ({ ok: true as const }),
          (e: unknown) => ({ ok: false as const, error: e instanceof Error ? e.message : 'send failed' }),
        )
      : Promise.resolve({ ok: false as const, error: 'email not configured' })
  );

  await sql`
    update public.registrations set
      email_sent_at = ${mail.ok ? sql`now()` : null},
      email_error = ${mail.ok ? null : mail.error.slice(0, 300)}
    where id = ${row!.id}`;

  if (typeof body.draftToken === 'string' && /^[A-Za-z0-9_-]{43}$/.test(body.draftToken)) {
    await sql`delete from public.registration_drafts where token_hash = ${createHash('sha256').update(body.draftToken).digest('hex')}`.catch(() => {});
  }

  return NextResponse.json({ ok: true, ref: refCode, name: fullName, email, connect });
}
