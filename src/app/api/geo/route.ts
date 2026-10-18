import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Visitor's country from Cloudflare's CF-IPCountry header (no IP is stored or
// returned). Used to pre-fill the WhatsApp country code on the form.
export function GET(req: Request) {
  const c = (req.headers.get('cf-ipcountry') || '').toUpperCase();
  const country = /^[A-Z]{2}$/.test(c) && c !== 'XX' && c !== 'T1' ? c : null;
  return NextResponse.json({ country }, { headers: { 'Cache-Control': 'private, no-store' } });
}
