import { icsContent } from '@/lib/calendar';

export const dynamic = 'force-static';

export function GET() {
  return new Response(icsContent(), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="oratorio-2026.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
