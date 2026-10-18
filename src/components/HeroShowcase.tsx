'use client';

import { useEffect, useState } from 'react';

const SLIDES = [
  { base: 'hero-solo', alt: 'Oratorio 2026 poster: The Sound of Thanks, with Dr. Oyindamola Adejumo-Ayibiowu, Convener and Founder' },
  { base: 'hero-lineup', alt: 'Oratorio 2026 poster with the full guest minister lineup' },
];
const INTERVAL_MS = 4500;

// Hero poster showcase: the two official posters cross-fade every 4.5 seconds.
// Both images are full resolution WebP with a 800px version for phones, and
// they share the same 4:5 frame, so nothing moves when they switch. Pauses
// on hover, when the tab is hidden, and for visitors who prefer less motion.
export default function HeroShowcase() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => document.visibilityState === 'visible' && setI((n) => (n + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-[#dc2626]/30 via-[#e0a21b]/20 to-[#991b1b]/30 blur-3xl" />
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] bg-[#1a0a0d]"
        style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2), 0 30px 80px -20px rgba(220,38,38,0.35)' }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Oratorio 2026 posters"
      >
        {SLIDES.map((s, n) => (
          <img
            key={s.base}
            src={`/images/${s.base}.webp`}
            srcSet={`/images/${s.base}-800.webp 800w, /images/${s.base}.webp 1600w`}
            sizes="(min-width: 1024px) 560px, 92vw"
            alt={s.alt}
            width={1600}
            height={2000}
            fetchPriority={n === 0 ? 'high' : 'low'}
            loading={n === 0 ? 'eager' : 'lazy'}
            decoding="async"
            aria-hidden={n !== i}
            className={`absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              n === i ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0'
            }`}
          />
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {SLIDES.map((s, n) => (
          <button
            key={s.base}
            type="button"
            onClick={() => setI(n)}
            aria-label={`Show poster ${n + 1}`}
            aria-current={n === i}
            className="flex min-h-12 min-w-12 items-center justify-center"
          >
            <span className={`block h-2 rounded-full transition-all duration-500 ${n === i ? 'w-8 bg-brand' : 'w-2 bg-line'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
