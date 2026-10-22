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
    // MOBILE_PASS_22OCT2026: compact header on phones so the whole pass
    // (QR, name and reference) shows on the first screen. On short phone
    // screens the intro line is dropped and the title fits on one line.
    <div className="container-x pt-5 pb-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow">Check-in pass</p>
        <h1 className="h-display mt-2 text-2xl text-balance max-[359px]:text-[21px] sm:mt-3 sm:text-4xl">Your pass for {EVENT.name}</h1>
        <p className="mt-2 text-sm text-balance text-muted sm:mt-3 sm:text-base [@media(max-height:740px)_and_(max-width:639px)]:hidden">Save it to your phone and show it at the registration stand. We will scan it and you are in.</p>
        <ul className="mx-auto mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs sm:mt-5 sm:gap-x-5 sm:gap-y-2 sm:text-sm">
          <li className="flex items-center gap-1.5 sm:gap-2"><CalendarDays className="size-3.5 text-brand sm:size-4" /> {EVENT.dateShort}</li>
          <li className="flex items-center gap-1.5 sm:gap-2"><Clock className="size-3.5 text-brand sm:size-4" /> {EVENT.timeLabel}</li>
          <li className="flex items-center gap-1.5 sm:gap-2"><MapPin className="size-3.5 text-brand sm:size-4" /> Maryland, Lagos</li>
        </ul>
      </div>
      <div className="mt-5 sm:mt-8">
        <PassCard code={code} name={r.full_name} refCode={r.ref_code} />
      </div>
    </div>
  );
}
