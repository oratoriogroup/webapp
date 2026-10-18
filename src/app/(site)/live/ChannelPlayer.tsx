'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import Countdown from '@/components/Countdown';
import { YouTubeIcon } from '@/components/icons';
import { EVENT, YOUTUBE_CHANNEL_ID, YOUTUBE_CHANNEL_URL } from '@/lib/event';
import { channelLiveEmbedUrl } from '@/lib/youtube';

const OPEN_FROM = new Date(EVENT.startISO).getTime() - 60 * 60_000; // an hour before the start
const OPEN_UNTIL = new Date(EVENT.endISO).getTime() + 3 * 60 * 60_000;

// Plays the convener's channel live stream during the event window. Before
// that it shows the countdown and a way to subscribe, so nobody lands on
// YouTube's "offline" screen. Checks the clock every 20 seconds, so a page
// left open switches to the player on its own.
export default function ChannelPlayer() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 20_000);
    return () => clearInterval(id);
  }, []);

  const open = now !== null && now >= OPEN_FROM && now <= OPEN_UNTIL;

  if (open) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-2xl shadow-brand/20">
        <iframe
          src={channelLiveEmbedUrl(YOUTUBE_CHANNEL_ID)}
          title={`${EVENT.name} livestream`}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="relative flex aspect-auto w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-line bg-surface/85 px-4 py-14 text-center shadow-xl shadow-brand/5 backdrop-blur sm:aspect-video sm:py-0">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-[#ff0033] text-white shadow-lg shadow-[#ff0033]/30">
        <YouTubeIcon className="size-9" />
      </span>
      <p className="h-display mt-5 text-3xl sm:text-4xl">We go live on YouTube</p>
      <p className="mt-2 max-w-md text-sm text-muted sm:text-base">
        The stream plays right here from {EVENT.timeLabel} on {EVENT.dateShort}. Keep this page open, it switches on by itself.
      </p>
      <div className="mt-7 w-full max-w-md">
        <Countdown tone="auto" />
      </div>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <a href={`${YOUTUBE_CHANNEL_URL}?sub_confirmation=1`} target="_blank" rel="noopener noreferrer" className="btn bg-[#ff0033] text-white shadow-lg shadow-[#ff0033]/25 hover:-translate-y-0.5">
          <Bell className="size-4" /> Subscribe for a reminder
        </a>
        <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="btn-outline">
          <YouTubeIcon className="size-4 text-[#ff0033]" /> Open the channel
        </a>
      </div>
    </div>
  );
}
