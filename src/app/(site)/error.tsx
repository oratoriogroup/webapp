'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const isChunkError = (e: Error) => e?.name === 'ChunkLoadError' || /Loading (CSS )?chunk|dynamically imported module|Failed to fetch/i.test(String(e?.message));

// If the site was updated while this tab was open, the page may ask for a
// script file from the previous version. Reloading once fixes that. Answers
// and confirmations live in session storage, so nothing is lost.
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (!isChunkError(error)) return;
    try {
      const k = 'oratorio-reloaded-at';
      const last = Number(sessionStorage.getItem(k) || 0);
      if (Date.now() - last > 30_000) {
        sessionStorage.setItem(k, String(Date.now()));
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-12 text-center sm:py-16">
      <p className="eyebrow">One moment</p>
      <h1 className="h-display mt-3 text-3xl text-balance sm:text-4xl">This page needs a quick refresh</h1>
      <p className="mt-3 max-w-md text-balance text-muted">We have just updated the site. Your registration and answers are safe.</p>
      {/* Phones: full-width stacked buttons; larger screens: one row. */}
      <div className="mt-7 grid w-full max-w-sm gap-2.5 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-3">
        <button type="button" onClick={() => window.location.reload()} className="btn-brand min-h-12">Refresh page</button>
        <button type="button" onClick={reset} className="btn-outline min-h-12">Try again</button>
        <Link href="/" className="btn-outline min-h-12">Back to home</Link>
      </div>
    </div>
  );
}
