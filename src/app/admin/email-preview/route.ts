import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin';
import { registrationEmail } from '@/lib/email-template';
import type { ConnectType } from '@/lib/form';
import { CHECKIN_CODE_RE } from '@/lib/checkin';

export const dynamic = 'force-dynamic';

// Admin-only preview of the confirmation email: /admin/email-preview?type=attend
// Add &code=<a real check-in code> to include the QR pass section.
export async function GET(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const u = new URL(req.url);
  const t = u.searchParams.get('type');
  const c = u.searchParams.get('code') || '';
  const checkinCode = CHECKIN_CODE_RE.test(c) ? c : null;
  const connect: ConnectType = t === 'online' || t === 'volunteer' || t === 'partner' ? t : 'attend';
  const { html } = registrationEmail({ fullName: 'Amoo John', refCode: 'OR26-PREVIEW1', connect, checkinCode });
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
