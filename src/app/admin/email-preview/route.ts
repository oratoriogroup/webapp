import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin';
import { registrationEmail } from '@/lib/email-template';
import type { ConnectType } from '@/lib/form';

export const dynamic = 'force-dynamic';

// Admin-only preview of the confirmation email: /admin/email-preview?type=attend
export async function GET(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const t = new URL(req.url).searchParams.get('type');
  const connect: ConnectType = t === 'online' || t === 'volunteer' || t === 'partner' ? t : 'attend';
  const { html } = registrationEmail({ fullName: 'Amoo John', refCode: 'OR26-PREVIEW1', connect });
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
