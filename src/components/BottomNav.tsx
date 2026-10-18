'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Users, PenLine, Radio, Menu, X, MapPin, Info, Sparkles, Moon, Sun, Share2 } from 'lucide-react';
import { useTheme } from './ThemeToggle';
import { SOCIALS } from '@/lib/event';
import { SOCIAL_ICON } from './icons';

const TABS = [
  { href: '/', label: 'Home', icon: Home, match: (p: string) => p === '/' },
  { href: '/#lineup', label: 'Lineup', icon: Users, match: () => false },
  { href: '/register', label: 'Register', icon: PenLine, match: (p: string) => p.startsWith('/register') },
  { href: '/live', label: 'Live', icon: Radio, match: (p: string) => p.startsWith('/live') },
];

const MORE = [
  { href: '/#about', label: 'About Oratorio', icon: Info },
  { href: '/#experience', label: 'The Experience', icon: Sparkles },
  { href: '/#venue', label: 'Venue & Directions', icon: MapPin },
  { href: '/#share', label: 'Share your experience', icon: Share2 },
];

// Phone navigation: a fixed five tab bar, the way the HW app does it.
export default function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const item = 'flex flex-1 flex-col items-center gap-1 py-1.5 text-[11px] font-medium';
  const pill = (active: boolean) =>
    `flex h-8 w-14 items-center justify-center rounded-full transition-colors ${active ? 'bg-brand-soft text-brand' : 'text-muted'}`;

  return (
    <>
      <nav aria-label="Primary" className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch px-2 pt-1.5">
          {TABS.map((t) => {
            const active = t.match(pathname);
            return (
              <Link key={t.href} href={t.href} className={`${item} ${active ? 'text-brand' : 'text-muted'}`} aria-current={active ? 'page' : undefined}>
                <span className={pill(active)}>
                  <t.icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                </span>
                {t.label}
              </Link>
            );
          })}
          <button type="button" onClick={() => setOpen(true)} className={`${item} ${open ? 'text-brand' : 'text-muted'}`} aria-haspopup="dialog" aria-expanded={open}>
            <span className={pill(open)}>
              <Menu className="size-5" strokeWidth={1.8} />
            </span>
            More
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="More">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="pb-safe absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-line bg-surface p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="h-display text-2xl">Menu</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="inline-flex size-10 items-center justify-center rounded-full bg-surface-2">
                <X className="size-5" />
              </button>
            </div>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
              {MORE.map((m) => (
                <li key={m.href}>
                  <Link href={m.href} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-medium hover:bg-surface-2">
                    <m.icon className="size-5 text-brand" />
                    {m.label}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={toggle} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] font-medium hover:bg-surface-2">
                  {theme === 'dark' ? <Sun className="size-5 text-brand" /> : <Moon className="size-5 text-brand" />}
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
              </li>
            </ul>
            <div className="mt-5 flex justify-center gap-3">
              {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICON[s.key];
                return (
                  <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="inline-flex size-11 items-center justify-center rounded-full border border-line text-text hover:bg-surface-2">
                    <Icon className="size-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
