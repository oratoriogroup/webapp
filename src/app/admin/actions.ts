'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase-server';
import { isAllowedAdmin, requireAdmin } from '@/lib/admin';
import { clientIp, rateLimited } from '@/lib/security';
import { saveSettings, type Settings } from '@/lib/settings';
import { youtubeId } from '@/lib/youtube';
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

  if (livestream && !youtubeId(livestream)) return { error: 'The livestream link must be a YouTube link (watch, live or youtu.be).' };
  if (featured && !youtubeId(featured)) return { error: 'The featured video must be a YouTube link.' };
  if (getdp && !/^https:\/\/(www\.)?getdp\.co\//.test(getdp)) return { error: 'The GetDP link must start with https://getdp.co/' };
  if (![livestream, featured, getdp].every(httpsOrEmpty) && !youtubeId(livestream)) return { error: 'Links must start with https://' };

  const patch: Partial<Settings> = { livestream_url: livestream, featured_video_url: featured, getdp_url: getdp, registration_open: open };
  await saveSettings(patch, admin.email);
  revalidatePath('/admin/settings');
  return { ok: 'Saved. The website updates within a few seconds.' };
}

export async function resendEmail(id: string): Promise<ActionState> {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: 'Invalid registration.' };
  if (!mailConfigured()) return { error: 'Email is not configured yet.' };
  const [r] = await sql<{ full_name: string; email: string; ref_code: string; connect_type: ConnectType }[]>`
    select full_name, email, ref_code, connect_type from public.registrations where id = ${id} limit 1`;
  if (!r) return { error: 'Registration not found.' };
  try {
    await sendRegistrationEmail({ fullName: r.full_name, email: r.email, refCode: r.ref_code, connect: r.connect_type });
    await sql`update public.registrations set email_sent_at = now(), email_error = null where id = ${id}`;
    revalidatePath(`/admin/registrations/${id}`);
    return { ok: 'Confirmation email sent.' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'send failed';
    await sql`update public.registrations set email_error = ${msg.slice(0, 300)} where id = ${id}`;
    return { error: `Could not send: ${msg}` };
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
