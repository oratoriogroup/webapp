'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// While no stream is set, quietly re-checks every 30 seconds so viewers who
// opened the page early see the player as soon as the admin saves the link.
// Once a stream is showing it never refreshes, so playback is not interrupted.
export default function LiveRefresher({ hasStream }: { hasStream: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (hasStream) return;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh();
    }, 30_000);
    return () => clearInterval(id);
  }, [hasStream, router]);
  return null;
}
