import QRCode from 'qrcode';
import { CHECKIN_CODE_RE, checkinUrl } from '@/lib/checkin';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// QR image for a pass (used in the confirmation email). Only real codes
// produce an image, so the endpoint cannot be used to make arbitrary QRs.
export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!CHECKIN_CODE_RE.test(code)) return new Response('Not found', { status: 404 });
  const [r] = await sql`select 1 from public.registrations where checkin_code = ${code} limit 1`;
  if (!r) return new Response('Not found', { status: 404 });
  const png = await QRCode.toBuffer(checkinUrl(code), { errorCorrectionLevel: 'M', margin: 2, width: 600, color: { dark: '#1a1114', light: '#ffffff' } });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'private, max-age=86400', 'X-Robots-Tag': 'noindex' } });
}
