'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, MessageSquare, RefreshCw, Share2, Check, X } from 'lucide-react';
import Countdown from '@/components/Countdown';
import { YouTubeIcon } from '@/components/icons';
import { EVENT, SITE_URL, YOUTUBE_CHANNEL_ID, YOUTUBE_CHANNEL_URL } from '@/lib/event';
import { channelLiveEmbedUrl, embedUrl } from '@/lib/youtube';

type Status = { status: 'live' | 'upcoming' | 'offline' | 'unknown'; videoId: string | null };

const OPEN_FROM = new Date(EVENT.startISO).getTime() - 60 * 60_000;
const OPEN_UNTIL = new Date(EVENT.endISO).getTime() + 3 * 60 * 60_000;

// Livestream player.
// - Asks /api/live-status which video the channel is streaming, and plays that
//   exact video (most reliable embed) with YouTube live chat beside it.
// - Re-checks every 30 seconds while the page is visible. If the stream
//   restarts under a new video id, the player reconnects to it by itself.
// - If the status check cannot answer during the event, falls back to the
//   channel's own live embed so viewers are never left without a player.
// - A fixed 16:9 frame from the first paint, so nothing shifts when it loads.
export default function LivePlayer({ pinnedVideoId }: { pinnedVideoId: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  const [st, setSt] = useState<Status | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const failures = useRef(0);

  const inWindow = now !== null && now >= OPEN_FROM && now <= OPEN_UNTIL;

  const check = useCallback(async () => {
    try {
      const r = await fetch('/api/live-status', { cache: 'no-store' });
      if (!r.ok) throw new Error();
      const s = (await r.json()) as Status;
      failures.current = 0;
      setSt((prev) => (prev?.videoId === s.videoId && prev?.status === s.status ? prev : s));
    } catch {
      failures.current += 1;
      if (failures.current >= 2) setSt({ status: 'unknown', videoId: null });
    }
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 20_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (pinnedVideoId) return;
    void check();
    const t = setInterval(() => document.visibilityState === 'visible' && check(), 30_000);
    const onVis = () => document.visibilityState === 'visible' && check();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [check, pinnedVideoId]);

  const videoId = pinnedVideoId || (st && (st.status === 'live' || (st.status === 'upcoming' && inWindow)) ? st.videoId : null);
  const fallbackChannel = !videoId && inWindow && (st?.status === 'unknown' || st?.status === 'offline');
  const showPlayer = !!videoId || fallbackChannel;
  const isLive = pinnedVideoId ? true : st?.status === 'live';

  const share = async () => {
    const url = `${SITE_URL}/livestream`;
    const text = `Watch ${EVENT.name}: ${EVENT.theme} live`;
    try {
      if (navigator.share) await navigator.share({ title: EVENT.name, text, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <div className={`grid gap-4 ${videoId ? 'lg:grid-cols-[1fr_360px]' : ''}`}>
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-2xl shadow-brand/20">
          {showPlayer ? (
            <iframe
              key={`${videoId ?? 'channel'}-${reloadKey}`}
              src={videoId ? embedUrl(videoId, true) : channelLiveEmbedUrl(YOUTUBE_CHANNEL_ID)}
              title={`${EVENT.name} livestream`}
              className="absolute inset-0 size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#2b0a12] via-[#1a0a0d] to-black px-4 text-center text-white">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#ff0033] shadow-lg shadow-[#ff0033]/30 sm:size-16"><YouTubeIcon className="size-8 sm:size-9" /></span>
              <p className="h-display mt-4 text-2xl sm:text-4xl">We go live on YouTube</p>
              <p className="mt-2 max-w-md text-sm text-white/70">The stream plays here from {EVENT.timeLabel} on {EVENT.dateShort}. Keep this page open, it switches on by itself.</p>
              <div className="mt-5 hidden w-full max-w-md sm:block"><Countdown /></div>
            </div>
          )}
          {isLive && showPlayer && (
            <span className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#ff0033] px-2.5 py-1 text-[11px] font-bold tracking-wider text-white uppercase shadow-lg">
              <span className="size-1.5 animate-pulse rounded-full bg-white" /> Live
            </span>
          )}
        </div>

        {videoId && (
          <div className={`${chatOpen ? 'block' : 'hidden'} overflow-hidden rounded-3xl border border-line bg-surface lg:block`}>
            <iframe
              src={`https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${new URL(SITE_URL).hostname}`}
              title="Live chat"
              className="h-[420px] w-full lg:h-full lg:min-h-[420px]"
              loading="lazy"
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!showPlayer && (
          <a href={`${YOUTUBE_CHANNEL_URL}?sub_confirmation=1`} target="_blank" rel="noopener noreferrer" className="btn min-h-11 bg-[#ff0033] text-white shadow-lg shadow-[#ff0033]/25 hover:-translate-y-0.5">
            <Bell className="size-4" /> Subscribe for a reminder
          </a>
        )}
        {videoId && (
          <button type="button" onClick={() => setChatOpen((o) => !o)} className="btn-outline min-h-11 lg:hidden">
            {chatOpen ? <X className="size-4" /> : <MessageSquare className="size-4" />} {chatOpen ? 'Hide live chat' : 'Live chat'}
          </button>
        )}
        <button type="button" onClick={share} className="btn-outline min-h-11">
          {copied ? <Check className="size-4 text-brand" /> : <Share2 className="size-4" />} {copied ? 'Link copied' : 'Share livestream'}
        </button>
        {showPlayer && (
          <button type="button" onClick={() => { setReloadKey((k) => k + 1); void check(); }} className="btn-outline min-h-11">
            <RefreshCw className="size-4" /> Reload player
          </button>
        )}
        <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="btn-outline min-h-11">
          <YouTubeIcon className="size-4 text-[#ff0033]" /> Open on YouTube
        </a>
      </div>
      {!showPlayer && <div className="mt-5 sm:hidden"><Countdown tone="auto" /></div>}
    </div>
  );
}
