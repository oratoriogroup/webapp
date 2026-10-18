import { NextResponse } from 'next/server';
import { getLiveStatus } from '@/lib/live-status';
import { clientIp, rateLimited } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (rateLimited(`live:${clientIp(req.headers)}`, 30, 60_000)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  const s = await getLiveStatus();
  return NextResponse.json(s, { headers: { 'Cache-Control': 'public, max-age=15, s-maxage=15' } });
}
