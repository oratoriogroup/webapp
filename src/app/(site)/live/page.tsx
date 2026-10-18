import type { Metadata } from 'next';
import Link from 'next/link';
import { Radio, CalendarPlus, Download } from 'lucide-react';
import Countdown from '@/components/Countdown';
import Backdrop from '@/components/Backdrop';
import VideoEmbed from '@/components/VideoEmbed';
import { SOCIAL_ICON } from '@/components/icons';
import { EVENT, SOCIALS } from '@/lib/event';
import { googleCalendarUrl } from '@/lib/calendar';
import { getSettings } from '@/lib/settings';
import { youtubeId } from '@/lib/youtube';
import LiveRefresher from './LiveRefresher';

export const metadata: Metadata = {
  title: 'Livestream',
  description: `Watch ${EVENT.name}: ${EVENT.theme} live from Lagos on ${EVENT.dateLabel}, ${EVENT.timeLabel}.`,
};

// Short revalidation so a stream link saved in the admin shows within seconds.
export const revalidate = 15;

export default async function LivePage() {
  const settings = await getSettings();
  const id = youtubeId(settings.livestream_url);

  return (
    <section className="relative isolate overflow-hidden bg-bg">
      <Backdrop className="opacity-70" />
      <div className="container-x relative py-10 sm:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
              <Radio className="size-3.5" /> {id ? 'Live' : 'Livestream'}
            </p>
            <h1 className="h-display mt-3 text-4xl sm:text-5xl">
              {EVENT.name}: <span className="text-gradient italic">{EVENT.theme}</span>
            </h1>
            <p className="mt-2 text-muted">
              {EVENT.dateLabel}, {EVENT.timeLabel}. Live from Lagos.
            </p>
          </div>
        </div>

        <div className="mt-8">
          {id ? (
            <VideoEmbed id={id} title={`${EVENT.name} livestream`} eager />
          ) : (
            <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface/80 backdrop-blur px-4 text-center">
              <p className="h-display text-2xl sm:text-3xl">The stream will appear here</p>
              <p className="mt-2 max-w-md text-sm text-muted">Keep this page open on the day. It updates on its own when we go live, or refresh at {EVENT.timeLabel}.</p>
              <div className="mt-6 w-full max-w-md">
                <Countdown tone="auto" />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <p className="font-semibold">Save the date</p>
            <p className="mt-1 text-sm text-muted">Get a reminder before we start.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer" className="btn-brand !py-2.5">
                <CalendarPlus className="size-4" /> Google Calendar
              </a>
              <a href="/oratorio-2026.ics" className="btn-outline !py-2.5">
                <Download className="size-4" /> Download .ics
              </a>
            </div>
          </div>
          <div className="card p-5">
            <p className="font-semibold">Also streaming on</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICON[s.key];
                return (
                  <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className="btn-outline !py-2.5">
                    <Icon className="size-4" /> {s.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          Not registered yet?{' '}
          <Link href="/register" className="font-semibold text-brand underline-offset-4 hover:underline">
            Register for free
          </Link>
        </p>
      </div>
      <LiveRefresher hasStream={!!id} />
    </section>
  );
}

