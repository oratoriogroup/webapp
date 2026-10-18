'use client';

import dynamic from 'next/dynamic';

// The player is loaded as its own small chunk after the page paints. The
// placeholder keeps the exact 16:9 space, so nothing jumps when it arrives.
const LivePlayer = dynamic(() => import('./LivePlayer'), {
  ssr: false,
  loading: () => <div className="aspect-video w-full animate-pulse rounded-3xl bg-gradient-to-br from-[#2b0a12] via-[#1a0a0d] to-black" />,
});

export default function PlayerLoader({ pinnedVideoId }: { pinnedVideoId: string | null }) {
  return <LivePlayer pinnedVideoId={pinnedVideoId} />;
}
