import { NextResponse } from 'next/server';
import { CHECKIN_CODE_RE } from '@/lib/checkin';
import { getAdmin } from '@/lib/admin';
import { SITE_URL } from '@/lib/event';

export const dynamic = 'force-dynamic';

// Target of the QR code. Staff (signed in to the admin) go straight to the
// check-in screen; everyone else sees the attendee's pass page.
export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!CHECKIN_CODE_RE.test(code)) return NextResponse.redirect(`${SITE_URL}/`, 302);
  const admin = await getAdmin().catch(() => null);
  return NextResponse.redirect(`${SITE_URL}${admin ? `/admin/checkin/${code}` : `/pass/${code}`}`, 302);
}
