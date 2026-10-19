'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, CalendarPlus, Download, Navigation, Radio, Copy } from 'lucide-react';
import { EVENT, SITE_URL, DIRECTIONS_URL } from '@/lib/event';
import { FacebookIcon, WhatsAppIcon, XIcon } from '@/components/icons';
import DpMaker from './DpMaker';
import PassCard from '@/components/PassCard';
import StageLights from '@/components/StageLights';
import Backdrop from '@/components/Backdrop';

type Done = { ref: string; name: string; email: string; connect: 'attend' | 'online' | 'volunteer' | 'partner'; pass?: string; emailed?: boolean };

const LINES: Record<Done['connect'], string> = {
  attend: 'Your seat is noted. Please arrive early, as seating is limited.',
  online: 'You are set to watch online. The livestream plays on our website on the day.',
  volunteer: 'Thank you for offering to serve. The team will contact you about the next steps.',
  partner: 'Thank you for considering a partnership. The team will reach out to you shortly.',
};

export default function SuccessClient({ calendarUrl }: { getdpUrl?: string; calendarUrl: string }) {
  const [done, setDone] = useState<Done | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('oratorio-reg-done');
      setDone(raw ? JSON.parse(raw) : null);
    } catch {
      setDone(null);
    }
  }, []);

  if (done === undefined) return <div className="min-h-[60vh]" />;
  if (done === null) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="h-display text-4xl">No registration found on this device</h1>
        <p className="mt-3 text-muted">If you registered, check your email for the confirmation.</p>
        <Link href="/register" className="btn-primary mt-8">Go to registration</Link>
      </div>
    );
  }

  // Full name as typed: many people write the surname first.
  const first = done.name.trim().replace(/\s+/g, ' ');
  const shareText = `I just registered for ${EVENT.name}: ${EVENT.theme}, ${EVENT.dateShort}, ${EVENT.timeLabel}, Lagos and online. Join me:`;
  const url = SITE_URL;
  const enc = encodeURIComponent;
  const shares = [
    { label: 'WhatsApp', icon: WhatsAppIcon, href: `https://wa.me/?text=${enc(`${shareText} ${url}`)}`, cls: 'bg-[#25D366] text-white' },
    { label: 'Facebook', icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, cls: 'bg-[#1877F2] text-white' },
    { label: 'X', icon: XIcon, href: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(url)}`, cls: 'bg-black text-white dark:bg-white dark:text-black' },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="relative isolate overflow-hidden">
      <Backdrop className="opacity-60" />
      <StageLights />
    <div className="container-x relative section-y">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="pop-in relative mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-b from-[#22c55e] to-[#15803d] text-white shadow-lg shadow-[#16a34a]/35 ring-8 ring-[#16a34a]/12">
            <Check className="size-10" strokeWidth={3} />
          </div>
          <p className="mt-6 text-xs font-semibold tracking-[0.22em] text-[#15803d] uppercase dark:text-[#4ade80]">Registration confirmed</p>
          <h1 className="h-display mt-3 text-4xl leading-tight sm:text-5xl">You&apos;re in, {first}.</h1>
          <p className="mx-auto mt-4 max-w-lg text-[17px] text-muted">
            {LINES[done.connect]} {done.emailed === false ? 'Your details are saved under' : 'A confirmation is on its way to'} <span className="font-semibold text-text underline decoration-brand underline-offset-4">{done.email}</span>.
          </p>
        </div>

        {/* Check-in pass */}
        {done.pass && (
          <div className="card mt-10 p-6 text-center sm:p-8">
            <p className="eyebrow">Your check-in pass</p>
            <p className="mx-auto mt-2 max-w-md text-muted">Save it to your phone and show the QR code at the registration stand.</p>
            <div className="mt-6"><PassCard code={done.pass} name={done.name} refCode={done.ref} /></div>
          </div>
        )}

        {/* DP */}
        <div className="card mt-6 p-6 sm:p-8">
          <p className="eyebrow">Your Oratorio DP</p>
          <h2 className="h-display mt-2 text-3xl">Tell everyone you&apos;ll be there.</h2>
          <p className="mt-2 text-muted">Add your photo, then download it for your status. On WhatsApp, tap <strong>HD</strong> before sending.</p>
          <DpMaker name={done.name} />
        </div>

        {/* Save the date */}
        <div className="band relative mt-6 overflow-hidden rounded-3xl p-6 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(70% 90% at 100% 0%, rgba(255,255,255,.18), transparent 70%)' }} />
          <div className="relative">
            <p className="text-xs font-semibold tracking-[0.2em] text-white/85 uppercase">Save the date</p>
            <p className="h-display mt-3 text-3xl sm:text-4xl">{EVENT.dateLabel}</p>
            <p className="mt-2 text-white/85">{EVENT.timeLabel}, {EVENT.venueName}, {EVENT.venueAddress}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="btn bg-white !py-3.5 text-brand shadow-lg hover:-translate-y-0.5">
                <CalendarPlus className="size-4" /> Add to Google Calendar
              </a>
              <a href="/oratorio-2026.ics" download className="btn !border !border-white/25 !py-3.5 text-white hover:!bg-white/10">
                <Download className="size-4" /> Download .ics
              </a>
            </div>
            <a href={done.connect === 'online' ? '/livestream' : DIRECTIONS_URL} target={done.connect === 'online' ? undefined : '_blank'} rel="noopener noreferrer" className="btn mt-3 w-full !py-3 text-white/85 hover:!bg-white/10">
              {done.connect === 'online' ? <><Radio className="size-4" /> Livestream page</> : <><Navigation className="size-4" /> Get directions</>}
            </a>
          </div>
        </div>

        {/* Share */}
        <div className="mt-6 rounded-3xl border border-brand/20 bg-brand-soft p-6 sm:p-8">
          <h2 className="h-display text-center text-3xl">Spread the word</h2>
          <p className="mx-auto mt-2 max-w-md text-center text-muted">Invite friends, family and your church to register.</p>
          <div className="mt-6 flex gap-2 rounded-2xl border border-line bg-surface p-2">
            <input readOnly value={url} aria-label="Website link" className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />
            <button type="button" onClick={copy} className="btn-primary !py-2.5">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {shares.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={`btn !flex-col !gap-1.5 !rounded-xl !px-2 !py-3 text-xs sm:!flex-row sm:!gap-2 sm:text-sm ${s.cls}`}>
                <s.icon className="size-5 shrink-0 sm:size-4" /> {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
