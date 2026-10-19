'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase-server';
import { isAllowedAdmin, requireAdmin } from '@/lib/admin';
import { clientIp, rateLimited } from '@/lib/security';
import { saveSettings, type Settings } from '@/lib/settings';
import { youtubeId, isChannelUrl } from '@/lib/youtube';
import { sql } from '@/lib/db';
import { mailConfigured, sendRegistrationEmail } from '@/lib/mailer';
import type { ConnectType } from '@/lib/form';

export type ActionState = { error?: string; ok?: string };

export async function signIn(_: ActionState, form: FormData): Promise<ActionState> {
  const ip = clientIp(await headers());
  if (rateLimited(`login:${ip}`, 8, 15 * 60_000)) return { error: 'Too many attempts. Try again in 15 minutes.' };

  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  if (!email || !password || email.length > 200 || password.length > 200) return { error: 'Enter your email and password.' };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Same message for every failure so the form does not reveal which emails exist.
  if (error) return { error: 'Incorrect email or password.' };
  if (!(await isAllowedAdmin(email))) {
    await supabase.auth.signOut();
    return { error: 'Incorrect email or password.' };
  }
  redirect('/admin');
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

const httpsOrEmpty = (v: string) => !v || /^https:\/\/[^\s<>"']+$/.test(v);

export async function updateSettings(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const livestream = String(form.get('livestream_url') || '').trim();
  const featured = String(form.get('featured_video_url') || '').trim();
  const getdp = String(form.get('getdp_url') || '').trim();
  const open = form.get('registration_open') === 'on' ? 'true' : 'false';

  if (livestream && !youtubeId(livestream) && !isChannelUrl(livestream)) return { error: 'The livestream link must be a YouTube channel or video link.' };
  if (featured && !youtubeId(featured)) return { error: 'The featured video must be a YouTube link.' };
  if (getdp && !/^https:\/\/(www\.)?getdp\.co\//.test(getdp)) return { error: 'The GetDP link must start with https://getdp.co/' };
  if (![livestream, featured, getdp].every(httpsOrEmpty)) return { error: 'Links must start with https://' };

  const patch: Partial<Settings> = { livestream_url: livestream, featured_video_url: featured, getdp_url: getdp, registration_open: open };
  await saveSettings(patch, admin.email);
  revalidatePath('/admin/settings');
  return { ok: 'Saved. The website updates within a few seconds.' };
}

export async function resendEmail(id: string): Promise<ActionState> {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: 'Invalid registration.' };
  if (!mailConfigured()) return { error: 'Email is not configured yet.' };
  const [r] = await sql<{ full_name: string; email: string; ref_code: string; connect_type: ConnectType; checkin_code: string | null }[]>`
    select full_name, email, ref_code, connect_type, checkin_code from public.registrations where id = ${id} limit 1`;
  if (!r) return { error: 'Registration not found.' };
  try {
    await sendRegistrationEmail({ fullName: r.full_name, email: r.email, refCode: r.ref_code, connect: r.connect_type, checkinCode: r.checkin_code });
    await sql`update public.registrations set email_sent_at = now(), email_error = null where id = ${id}`;
    revalidatePath(`/admin/registrations/${id}`);
    return { ok: 'Confirmation email sent.' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'send failed';
    await sql`update public.registrations set email_error = ${msg.slice(0, 300)} where id = ${id}`;
    return { error: `Could not send: ${msg}` };
  }
}

// Sends confirmations that failed earlier (for example on a day the email
// provider's daily limit was reached). Oldest first, in batches, one at a
// time, and it stops at the first limit error so nothing is hammered.
let sendingPending = false;
export async function sendPendingEmails(): Promise<ActionState> {
  await requireAdmin();
  if (!mailConfigured()) return { error: 'Email is not configured yet.' };
  if (sendingPending) return { error: 'Already sending. Give it a minute.' };
  sendingPending = true;
  let sent = 0;
  try {
    const rows = await sql<{ id: string; full_name: string; email: string; ref_code: string; connect_type: ConnectType; checkin_code: string | null }[]>`
      select id, full_name, email, ref_code, connect_type, checkin_code from public.registrations
      where email_sent_at is null order by created_at limit 40`;
    if (!rows.length) return { ok: 'No pending emails.' };
    for (const r of rows) {
      try {
        await sendRegistrationEmail({ fullName: r.full_name, email: r.email, refCode: r.ref_code, connect: r.connect_type, checkinCode: r.checkin_code });
        await sql`update public.registrations set email_sent_at = now(), email_error = null where id = ${r.id}`;
        sent++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'send failed';
        await sql`update public.registrations set email_error = ${msg.slice(0, 300)} where id = ${r.id}`;
        if (/quota|limit|429|too many/i.test(msg)) {
          revalidatePath('/admin', 'layout');
          return { error: `Sent ${sent}. Stopped: the email provider's limit was reached (${msg.slice(0, 120)}). Try again later.` };
        }
      }
      await new Promise((res) => setTimeout(res, 600));
    }
    revalidatePath('/admin', 'layout');
    const [{ n }] = await sql<{ n: number }[]>`select count(*)::int n from public.registrations where email_sent_at is null`;
    return { ok: `Sent ${sent} of ${rows.length}.${n ? ` ${n} still pending, press again to continue.` : ' All caught up.'}` };
  } finally {
    sendingPending = false;
  }
}

export async function toggleCheckIn(id: string): Promise<ActionState> {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: 'Invalid registration.' };
  await sql`update public.registrations set checked_in_at = case when checked_in_at is null then now() else null end where id = ${id}`;
  revalidatePath(`/admin/registrations/${id}`);
  revalidatePath('/admin/registrations');
  return { ok: 'Updated.' };
}

export async function moderateTestimony(id: string, action: 'approve' | 'hide' | 'reject' | 'restore' | 'delete'): Promise<ActionState> {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !['approve', 'hide', 'reject', 'restore', 'delete'].includes(action)) return { error: 'Invalid request.' };
  if (action === 'delete') await sql`delete from public.testimonies where id = ${id}`;
  else if (action === 'approve') await sql`update public.testimonies set approved = true, archived = false, approved_at = now() where id = ${id}`;
  else if (action === 'reject') await sql`update public.testimonies set approved = false, archived = true, approved_at = null where id = ${id}`;
  else if (action === 'restore') await sql`update public.testimonies set archived = false where id = ${id}`;
  else await sql`update public.testimonies set approved = false, approved_at = null where id = ${id}`;
  revalidatePath('/admin/testimonies');
  revalidatePath('/livestream');
  return { ok: 'Updated.' };
}

export async function checkInByCode(code: string, undo = false): Promise<ActionState & { at?: string }> {
  const admin = await requireAdmin();
  if (!/^[A-Za-z0-9_-]{22}$/.test(code)) return { error: 'Invalid pass.' };
  if (undo) {
    await sql`update public.registrations set checked_in_at = null, checked_in_by = null where checkin_code = ${code}`;
  } else {
    // Only the first scan checks someone in; a second scan of the same pass
    // keeps the original time so reuse is obvious to staff.
    await sql`update public.registrations set checked_in_at = now(), checked_in_by = ${admin.email}
      where checkin_code = ${code} and checked_in_at is null`;
  }
  revalidatePath(`/admin/checkin/${code}`);
  revalidatePath('/admin/checkin');
  revalidatePath('/admin');
  return { ok: undo ? 'Check-in undone.' : 'Checked in.' };
}

// Google / Apple sign-in through Supabase Auth. The provider must be switched
// on in Supabase; the callback still only lets in emails on the admin list.
export async function oauthSignIn(provider: 'google' | 'apple'): Promise<ActionState> {
  if (provider !== 'google' && provider !== 'apple') return { error: 'Unknown provider.' };
  const supabase = await supabaseServer();
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://oratoriogroup.org').replace(/\/$/, '');
  const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${site}/admin/auth/callback` } });
  if (error || !data?.url) return { error: `${provider === 'google' ? 'Google' : 'Apple'} sign-in is not switched on yet. Use your email and password.` };
  redirect(data.url);
}
