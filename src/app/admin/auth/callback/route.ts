import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { isAllowedAdmin } from '@/lib/admin';
import { SITE_URL } from '@/lib/event';

export const dynamic = 'force-dynamic';

// Return point for Google / Apple sign-in. Exchanges the one-time code for a
// session, then admits only emails on the admin list.
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get('code');
  if (!code) return NextResponse.redirect(`${SITE_URL}/admin/login?error=signin`);
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user?.email) return NextResponse.redirect(`${SITE_URL}/admin/login?error=signin`);
  if (!(await isAllowedAdmin(data.user.email))) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${SITE_URL}/admin/login?error=not_allowed`);
  }
  return NextResponse.redirect(`${SITE_URL}/admin`);
}
