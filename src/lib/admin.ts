import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { supabaseServer } from './supabase-server';
import { sql } from './db';

export const isAllowedAdmin = async (email: string | undefined | null) => {
  const e = String(email || '').trim().toLowerCase();
  if (!e) return false;
  const envList = String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  if (envList.includes(e)) return true;
  const rows = await sql`select 1 from public.admins where lower(email) = ${e} limit 1`;
  return rows.length > 0;
};

// getUser() validates the session with Supabase Auth on every call (unlike
// getSession(), which only reads the cookie), so a forged cookie cannot pass.
export const getAdmin = cache(async () => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;
  if (!(await isAllowedAdmin(data.user.email))) return null;
  return { id: data.user.id, email: data.user.email };
});

export const requireAdmin = async () => {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
};
