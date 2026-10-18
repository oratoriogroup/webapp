'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, CalendarPlus, Download, Navigation, Radio, Copy, Mail, ExternalLink } from 'lucide-react';
import { EVENT, SITE_URL, DIRECTIONS_URL } from '@/lib/event';
import { FacebookIcon, LinkedInIcon, WhatsAppIcon, XIcon } from '@/components/icons';
import DpMaker from './DpMaker';

type Done = { ref: string; name: string; email: string; connect: 'attend' | 'online' | 'volunteer' | 'partner' };

const LINES: Record<Done['connect'], string> = {
  attend: 'Your seat is noted. Please arrive early, as seating is limited.',
  online: 'You are set to watch online. The livestream plays on our website on the day.',
  volunteer: 'Thank you for offering to serve. The team will contact you about the next steps.',
  partner: 'Thank you for considering a partnership. The team will reach out to you shortly.',
};

export default function SuccessClient({ getdpUrl, calendarUrl }: { getdpUrl: string; calendarUrl: string }) {
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

  const first = done.name.trim().split(/\s+/)[0];
  const shareText = `I just registered for ${EVENT.name}: ${EVENT.theme}, ${EVENT.dateShort}, ${EVENT.timeLabel}, Lagos and online. Join me:`;
  const url = SITE_URL;
  const enc = encodeURIComponent;
  const shares = [
    { label: 'WhatsApp', icon: WhatsAppIcon, href: `https://wa.me/?text=${enc(`${shareText} ${url}`)}`, cls: 'bg-[#25D366] text-white' },
    { label: 'Facebook', icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, cls: 'bg-[#1877F2] text-white' },
    { label: 'X', icon: XIcon, href: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(url)}`, cls: 'bg-black text-white dark:bg-white dark:text-black' },
    { label: 'LinkedIn', icon: LinkedInIcon, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, cls: 'bg-[#0A66C2] text-white' },
    { label: 'Email', icon: Mail, href: `mailto:?subject=${enc(`Join me at ${EVENT.name}`)}&body=${enc(`${shareText} ${url}`)}`, cls: 'bg-surface-2 text-text border border-line' },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="container-x py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30">
            <Check className="size-10" strokeWidth={2.5} />
          </div>
          <p className="eyebrow mt-6">Registration confirmed</p>
          <h1 className="h-display mt-3 text-4xl leading-tight sm:text-5xl">You&apos;re in, {first}.</h1>
          <p className="mx-auto mt-4 max-w-lg text-[17px] text-muted">
            {LINES[done.connect]} A confirmation is on its way to <span className="font-semibold text-text underline decoration-brand underline-offset-4">{done.email}</span>.
          </p>
          <p className="mt-3 text-sm text-muted">
            Reference <span className="font-mono font-semibold text-text">{done.ref}</span>
          </p>
        </div>

        {/* Save the date */}
        <div className="band relative mt-10 overflow-hidden rounded-3xl p-6 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(70% 90% at 100% 0%, rgba(255,255,255,.18), transparent 70%)' }} />
          <div className="relative">
            <p className="text-xs font-semibold tracking-[0.2em] text-white/85 uppercase">Save the date</p>
            <p className="h-display mt-3 text-3xl sm:text-4xl">{EVENT.dateLabel}</p>
            <p className="mt-2 text-white/85">{EVENT.timeLabel}</p>
            <p className="mt-1 text-white/85">{EVENT.venueName}, {EVENT.venueAddress}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="btn bg-white !py-3.5 text-brand shadow-lg hover:-translate-y-0.5">
                <CalendarPlus className="size-4" /> Add to Google Calendar
              </a>
              <a href="/oratorio-2026.ics" download className="btn !border !border-white/25 !py-3.5 text-white hover:!bg-white/10">
                <Download className="size-4" /> Download .ics
              </a>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn !py-3 text-white/85 hover:!bg-white/10">
                <Navigation className="size-4" /> Get directions
              </a>
              <Link href="/live" className="btn !py-3 text-white/85 hover:!bg-white/10">
                <Radio className="size-4" /> Livestream page
              </Link>
            </div>
          </div>
        </div>

        {/* DP */}
        <div className="card mt-6 p-6 sm:p-8">
          <p className="eyebrow">Your Oratorio DP</p>
          <h2 className="h-display mt-2 text-3xl">Tell everyone you&apos;ll be there.</h2>
          <p className="mt-2 text-muted">Add your photo to the official Oratorio 2026 card, then download it or share it to your status.</p>
          <DpMaker name={done.name} />
          {getdpUrl && (
            <a href={getdpUrl} target="_blank" rel="noopener noreferrer" className="btn-outline mt-4 w-full">
              Prefer GetDP? Create it on getdp.co <ExternalLink className="size-4" />
            </a>
          )}
        </div>

        {/* Share */}
        <div className="mt-6 rounded-3xl border border-brand/20 bg-brand-soft p-6 sm:p-8">
          <h2 className="h-display text-center text-3xl">Spread the word</h2>
          <p className="mx-auto mt-2 max-w-md text-center text-muted">Invite friends, family and your church or campus to register.</p>
          <div className="mt-6 flex gap-2 rounded-2xl border border-line bg-surface p-2">
            <input readOnly value={url} aria-label="Website link" className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />
            <button type="button" onClick={copy} className="btn-primary !py-2.5">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {shares.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={`btn !rounded-xl !py-3 ${s.cls}`}>
                <s.icon className="size-4" /> {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
