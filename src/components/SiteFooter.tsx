import Link from 'next/link';
import { EVENT, SOCIALS } from '@/lib/event';
import { SOCIAL_ICON } from './icons';

// Desktop: logo, Explore and Follow columns. Phones: the bottom dock already
// covers navigation, so the footer is just the logo, a row of social icons
// and the copyright line.
export default function SiteFooter() {
  return (
    <footer className="bg-gradient-to-br from-[#2b0a1f] via-[#24081c] to-[#1a0a24] text-white/80">
      <div className="container-x flex flex-col items-center gap-6 py-10 text-center md:grid md:grid-cols-[1.4fr_1fr_1fr] md:items-start md:gap-10 md:py-14 md:text-left">
        <img src="/images/logo-white.webp" alt="Oratorio Music Foundation" width={1777} height={493} className="h-10 w-auto" loading="lazy" />

        <div className="hidden md:block">
          <p className="text-sm font-semibold text-white">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-white" href="/register">Register</Link></li>
            <li><Link className="hover:text-white" href="/livestream">Livestream</Link></li>
            <li><Link className="hover:text-white" href="/#lineup">Lineup</Link></li>
            <li><Link className="hover:text-white" href="/#venue">Venue & directions</Link></li>
          </ul>
        </div>

        {/* Phones: icon row */}
        <ul className="flex flex-wrap justify-center gap-2 md:hidden" aria-label="Follow us">
          {SOCIALS.map((s) => {
            const Icon = SOCIAL_ICON[s.key];
            return (
              <li key={s.key}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="inline-flex size-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15">
                  <Icon className="size-5" />
                </a>
              </li>
            );
          })}
        </ul>

        {/* Desktop: labelled list */}
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-white">Follow</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SOCIALS.map((s) => {
              const Icon = SOCIAL_ICON[s.key];
              return (
                <li key={s.key}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 hover:text-white">
                    <Icon className="size-4" />
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center gap-1 py-5 pb-28 text-center text-xs text-white/50 sm:flex-row sm:justify-between sm:text-left md:pb-5">
          <p>Copyright &copy; Oratorio 2026</p>
          <p className="hidden sm:block">{EVENT.organiser}. {EVENT.motto}.</p>
        </div>
      </div>
    </footer>
  );
}
