import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarPlus, Download, MessageCircle, Phone } from 'lucide-react';
import VideoEmbed from '@/components/VideoEmbed';
import Backdrop from '@/components/Backdrop';
import StageLights from '@/components/StageLights';
import { SOCIAL_ICON, WhatsAppIcon } from '@/components/icons';
import { EVENT, SOCIALS, CONTACTS, WHATSAPP_GROUP_URL } from '@/lib/event';
import { googleCalendarUrl } from '@/lib/calendar';
import { getSettings } from '@/lib/settings';
import { youtubeId } from '@/lib/youtube';
import ChannelPlayer from './ChannelPlayer';

export const metadata: Metadata = {
  title: 'Livestream',
  description: `Watch ${EVENT.name}: ${EVENT.theme} live from Lagos on ${EVENT.dateLabel}, ${EVENT.timeLabel}.`,
};

// Short revalidation so a stream link saved in the admin shows within seconds.
export const revalidate = 15;

export default async function LivePage() {
  const settings = await getSettings();
  // A specific video link set in the admin wins; otherwise the channel plays.
  const id = youtubeId(settings.livestream_url);

  return (
    <section className="relative isolate overflow-hidden bg-bg">
      <Backdrop className="opacity-70" />
      <StageLights />
      <div className="container-x relative py-10 sm:py-14">
        <div data-reveal>
          <p className="inline-flex items-center gap-2 rounded-full bg-brand px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-lg shadow-brand/30">
            <span className="size-2 animate-pulse rounded-full bg-white" /> Livestream
          </p>
          <h1 className="h-display mt-4 text-4xl sm:text-6xl">
            {EVENT.name}: <span className="text-gradient shimmer italic">{EVENT.theme}</span>
          </h1>
          <p className="mt-2 text-muted">{EVENT.dateLabel}, {EVENT.timeLabel}. Live from Lagos to the world.</p>
        </div>

        <div data-reveal className="mt-8">
          {id ? <VideoEmbed id={id} title={`${EVENT.name} livestream`} eager /> : <ChannelPlayer />}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div data-reveal className="card p-5">
            <p className="font-semibold">Save the date</p>
            <p className="mt-1 text-sm text-muted">Get a reminder before we start.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer" className="btn-brand !py-2.5"><CalendarPlus className="size-4" /> Google Calendar</a>
              <a href="/oratorio-2026.ics" className="btn-outline !py-2.5"><Download className="size-4" /> .ics</a>
            </div>
          </div>
          <div data-reveal style={{ ['--reveal-delay' as string]: '90ms' }} className="card p-5">
            <p className="font-semibold">Enquiries and directions</p>
            <ul className="mt-3 space-y-2 text-sm">
              {CONTACTS.map((c) => (
                <li key={c.intl} className="flex flex-wrap items-center gap-2">
                  <span className="min-w-28 font-semibold">{c.label}</span>
                  <a href={`https://wa.me/${c.intl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/15 px-3 py-1 font-semibold text-[#128C4B] dark:text-[#4ade80]"><MessageCircle className="size-3.5" /> Chat</a>
                  <a href={`tel:+${c.intl}`} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand"><Phone className="size-3.5" /> Call</a>
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal style={{ ['--reveal-delay' as string]: '180ms' }} className="card p-5">
            <p className="font-semibold">Follow and join the community</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] !py-2.5 text-white"><WhatsAppIcon className="size-4" /> WhatsApp group</a>
              {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICON[s.key];
                return (
                  <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="btn-outline !px-3 !py-2.5"><Icon className="size-4" /></a>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          Not registered yet?{' '}
          <Link href="/register" className="font-semibold text-brand underline-offset-4 hover:underline">Register for free</Link>
        </p>
      </div>
    </section>
  );
}
