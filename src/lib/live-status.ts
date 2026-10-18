import 'server-only';
import { YOUTUBE_CHANNEL_ID } from './event';

export type LiveStatus = { status: 'live' | 'upcoming' | 'offline' | 'unknown'; videoId: string | null; checkedAt: number };

let cache: LiveStatus | null = null;
let inflight: Promise<LiveStatus> | null = null;
const TTL_MS = 30_000;

// Asks YouTube what the channel's /live address points at. When the channel
// is live (or has a scheduled stream), that page resolves to the stream's
// watch URL. One request per 30 seconds is shared by every visitor.
const fetchStatus = async (): Promise<LiveStatus> => {
  try {
    const res = await fetch(`https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}/live`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
        'Accept-Language': 'en-GB,en;q=0.9',
        // Skips the EU cookie consent interstitial.
        Cookie: 'SOCS=CAI; CONSENT=YES+1',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    const canon = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})"/);
    const videoId = canon?.[1] ?? null;
    if (!videoId) return { status: 'offline', videoId: null, checkedAt: Date.now() };
    // YouTube's own playback verdict for that video is the source of truth.
    //   OK + videoDetails.isLive        -> streaming now
    //   LIVE_STREAM_OFFLINE             -> scheduled stream, waiting room
    const playability = html.match(/"playabilityStatus":\{"status":"(\w+)"/)?.[1] ?? '';
    const details = html.match(/"videoDetails":\{[^]*?"isLive(?:Content)?":(true|false)/)?.[0] ?? '';
    const isLiveNow = playability === 'OK' && /"isLive":true/.test(details);
    if (isLiveNow) return { status: 'live', videoId, checkedAt: Date.now() };
    if (playability === 'LIVE_STREAM_OFFLINE' || /"isUpcoming":true/.test(html)) return { status: 'upcoming', videoId, checkedAt: Date.now() };
    return { status: 'offline', videoId: null, checkedAt: Date.now() };
  } catch {
    return { status: 'unknown', videoId: null, checkedAt: Date.now() };
  }
};

export const getLiveStatus = async (): Promise<LiveStatus> => {
  if (cache && Date.now() - cache.checkedAt < TTL_MS) return cache;
  inflight ??= fetchStatus().finally(() => (inflight = null));
  const s = await inflight;
  // Keep the last good answer through a brief YouTube hiccup.
  if (s.status === 'unknown' && cache && Date.now() - cache.checkedAt < 5 * 60_000) return cache;
  cache = s;
  return s;
};
