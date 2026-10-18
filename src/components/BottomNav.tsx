'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Info, Users, Radio, PenLine } from 'lucide-react';

const TABS = [
  { href: '/', label: 'Home', icon: Home, section: null as string | null },
  { href: '/#about', label: 'About', icon: Info, section: 'about' },
  { href: '/#lineup', label: 'Lineup', icon: Users, section: 'lineup' },
  { href: '/livestream', label: 'Live', icon: Radio, section: null },
  { href: '/register', label: 'Register', icon: PenLine, section: null },
];

// Floating app-style dock for phones (under 768px). On the home page it
// highlights the section currently on screen.
export default function BottomNav() {
  const pathname = usePathname();
  const [section, setSection] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== '/' || !('IntersectionObserver' in window)) return setSection(null);
    const els = ['about', 'lineup'].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setSection(vis.target.id);
        else if (window.scrollY < 300) setSection(null);
      },
      { threshold: [0.25, 0.5] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  const isActive = (t: (typeof TABS)[number]) => {
    if (t.section) return pathname === '/' && section === t.section;
    if (t.href === '/') return pathname === '/' && !section;
    return pathname.startsWith(t.href);
  };

  return (
    <nav aria-label="Primary" className="pb-safe fixed inset-x-0 bottom-0 z-50 px-3 md:hidden">
      <div className="mx-auto mb-2 flex max-w-md items-stretch rounded-2xl border border-line/80 bg-surface/90 p-1.5 shadow-2xl shadow-black/10 backdrop-blur-xl">
        {TABS.map((t) => {
          const active = isActive(t);
          const cta = t.href === '/register';
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold transition-colors ${
                cta ? 'bg-brand text-white shadow-lg shadow-brand/30' : active ? 'bg-brand-soft text-brand' : 'text-muted'
              }`}
            >
              <t.icon className="size-5" strokeWidth={active || cta ? 2.2 : 1.8} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
