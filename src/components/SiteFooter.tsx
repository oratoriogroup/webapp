import Link from 'next/link';
import { EVENT, SOCIALS } from '@/lib/event';
import { SOCIAL_ICON } from './icons';

export default function SiteFooter() {
  return (
    <footer className="bg-gradient-to-br from-[#2b0a1f] via-[#24081c] to-[#1a0a24] text-white/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img src="/images/logo-white.webp" alt="Oratorio Music Foundation" width={1777} height={493} className="h-10 w-auto" loading="lazy" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-white" href="/register">Register</Link></li>
            <li><Link className="hover:text-white" href="/livestream">Livestream</Link></li>
            <li><Link className="hover:text-white" href="/#lineup">Lineup</Link></li>
            <li><Link className="hover:text-white" href="/#venue">Venue & directions</Link></li>
          </ul>
        </div>
        <div>
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
        <div className="container-x flex flex-col gap-2 py-6 pb-28 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between md:pb-6">
          <p>Copyright &copy; Oratorio 2026</p>
          <p>{EVENT.organiser}. {EVENT.motto}.</p>
        </div>
      </div>
    </footer>
  );
}
