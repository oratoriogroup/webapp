'use client';

import { useEffect, useState } from 'react';
import { EVENT } from '@/lib/event';

const target = new Date(EVENT.startISO).getTime();

const parts = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    { label: 'Days', value: Math.floor(s / 86400) },
    { label: 'Hours', value: Math.floor((s % 86400) / 3600) },
    { label: 'Minutes', value: Math.floor((s % 3600) / 60) },
    { label: 'Seconds', value: s % 60 },
  ];
};

export default function Countdown({ tone = 'dark' }: { tone?: 'dark' | 'auto' }) {
  // Rendered empty on the server so the static page never shows a stale time.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const live = now !== null && now >= target;
  const cell = tone === 'dark' ? 'border-white/15 bg-white/5 text-white' : 'border-line bg-surface text-text';
  const sub = tone === 'dark' ? 'text-white/60' : 'text-muted';

  if (live) {
    return (
      <p className={`text-sm font-semibold ${tone === 'dark' ? 'text-white' : 'text-text'}`}>
        <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-brand-red align-middle" />
        Oratorio 2026 is happening now.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-label="Time until Oratorio 2026">
      {parts(now === null ? 0 : target - now).map((p) => (
        <div key={p.label} className={`rounded-2xl border px-2 py-3 text-center sm:px-4 sm:py-4 ${cell}`}>
          <div className="font-display text-3xl font-semibold tabular-nums sm:text-4xl" suppressHydrationWarning>
            {now === null ? '--' : String(p.value).padStart(2, '0')}
          </div>
          <div className={`mt-1 text-[10px] font-semibold tracking-[0.18em] uppercase sm:text-[11px] ${sub}`}>{p.label}</div>
        </div>
      ))}
    </div>
  );
}
