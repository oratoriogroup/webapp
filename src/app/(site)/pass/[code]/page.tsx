import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import PassCard from '@/components/PassCard';
import { CHECKIN_CODE_RE } from '@/lib/checkin';
import { EVENT } from '@/lib/event';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Your check-in pass', robots: { index: false, follow: false } };

// Attendee view of a pass. Shows only the name and reference: the full bio
// data is visible to signed-in staff on the check-in screen, never here.
export default async function PassPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!CHECKIN_CODE_RE.test(code)) notFound();
  const [r] = await sql<{ full_name: string; ref_code: string }[]>`
    select full_name, ref_code from public.registrations where checkin_code = ${code} limit 1`;
  if (!r) notFound();
  return (
    <div className="container-x section-y">
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow">Check-in pass</p>
        <h1 className="h-display mt-3 text-3xl sm:text-4xl">Your pass for {EVENT.name}</h1>
        <p className="mt-3 text-muted">Download it to your phone and show it at the registration stand. We will scan it and you are in.</p>
        <ul className="mx-auto mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
          <li className="flex items-center gap-2"><CalendarDays className="size-4 text-brand" /> {EVENT.dateLabel}</li>
          <li className="flex items-center gap-2"><Clock className="size-4 text-brand" /> {EVENT.timeLabel}</li>
          <li className="flex items-center gap-2"><MapPin className="size-4 text-brand" /> Maryland, Lagos</li>
        </ul>
      </div>
      <div className="mt-8">
        <PassCard code={code} name={r.full_name} refCode={r.ref_code} />
      </div>
    </div>
  );
}
