import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { validateAll, connectTypeOf, ENTRY, type Answers } from '@/lib/form';
import { clientIp, sameOrigin, rateLimited, newRefCode } from '@/lib/security';
import { getSettings } from '@/lib/settings';
import { mailConfigured, sendRegistrationEmail } from '@/lib/mailer';
import { forwardToGoogleForm } from '@/lib/gform';

export const dynamic = 'force-dynamic';

const fail = (status: number, error: string, fields?: Record<string, string>) =>
  NextResponse.json({ ok: false, error, fields }, { status });

export async function POST(req: Request) {
  const h = req.headers;
  if (!sameOrigin(h)) return fail(403, 'Request not allowed.');
  const ip = clientIp(h);
  if (rateLimited(`reg:${ip}`, 6, 10 * 60_000)) return fail(429, 'Too many attempts. Please wait a few minutes and try again.');

  const len = Number(h.get('content-length') || 0);
  if (len > 32_000) return fail(413, 'Request too large.');

  let body: { answers?: Answers; hp?: string; t?: number };
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
  const { path, errors, clean } = validateAll(input);
  if (Object.keys(errors).length) return fail(422, 'Please check the highlighted fields.', errors);

  const connect = connectTypeOf(clean)!;
  const fullName = String(clean[ENTRY.fullName]);
  const email = String(clean[ENTRY.email]).toLowerCase();

  // One registration per email per type. A repeat returns the existing
  // reference instead of creating a duplicate or sending a second email.
  const existing = await sql<{ ref_code: string }[]>`
    select ref_code from public.registrations
    where lower(email) = ${email} and connect_type = ${connect}
    limit 1`;
  if (existing[0]) {
    return NextResponse.json({ ok: true, ref: existing[0].ref_code, name: fullName, email, connect, duplicate: true });
  }

  const refCode = newRefCode();
  const [row] = await sql<{ id: string }[]>`
    insert into public.registrations
      (ref_code, full_name, whatsapp, email, age_range, location, church, connect_type, party_size, volunteer_kind, answers, ip, user_agent)
    values
      (${refCode}, ${fullName}, ${String(clean[ENTRY.whatsapp])}, ${email}, ${(clean[ENTRY.age] as string) ?? null},
       ${(clean[ENTRY.location] as string) ?? null}, ${(clean[ENTRY.church] as string) ?? null}, ${connect},
       ${(clean[ENTRY.partySize] as string) ?? null}, ${(clean[ENTRY.volunteerKind] as string) ?? null},
       ${sql.json(clean)}, ${ip}, ${(h.get('user-agent') || '').slice(0, 300)})
    returning id`;

  const [mail, gform] = await Promise.all([
    mailConfigured()
      ? sendRegistrationEmail({ fullName, email, refCode, connect }).then(
          () => ({ ok: true as const }),
          (e: unknown) => ({ ok: false as const, error: e instanceof Error ? e.message : 'send failed' }),
        )
      : Promise.resolve({ ok: false as const, error: 'email not configured' }),
    forwardToGoogleForm(clean, path),
  ]);

  await sql`
    update public.registrations set
      email_sent_at = ${mail.ok ? sql`now()` : null},
      email_error = ${mail.ok ? null : mail.error.slice(0, 300)},
      gform_status = ${gform.ok ? 'sent' : 'failed'},
      gform_error = ${gform.ok ? null : gform.error.slice(0, 300)}
    where id = ${row!.id}`;

  return NextResponse.json({ ok: true, ref: refCode, name: fullName, email, connect });
}
