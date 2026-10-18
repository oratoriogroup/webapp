'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, LogOut, ExternalLink, Radio } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Logo } from '@/components/SiteHeader';
import { signOut } from '../actions';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/registrations', label: 'Registrations', icon: Users },
  { href: '/admin/settings', label: 'Livestream & settings', short: 'Settings', icon: Settings },
];

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = (n: (typeof NAV)[number]) => (n.exact ? pathname === n.href : pathname.startsWith(n.href));

  return (
    <div className="min-h-dvh bg-bg md:grid md:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface md:flex">
        <div className="flex h-16 items-center border-b border-line px-5">
          <Logo className="h-8" />
        </div>
        <p className="px-5 pt-5 text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">Control centre</p>
        <nav className="mt-2 flex-1 space-y-1 px-3" aria-label="Admin">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n) ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active(n) ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-surface-2 hover:text-text'}`}>
              <n.icon className="size-[18px]" /> {n.label}
            </Link>
          ))}
          <a href="/live" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-2 hover:text-text">
            <Radio className="size-[18px]" /> View live page <ExternalLink className="ml-auto size-3.5" />
          </a>
        </nav>
        <div className="border-t border-line p-4">
          <p className="truncate text-xs text-muted" title={email}>{email}</p>
          <div className="mt-3 flex items-center gap-2">
            <ThemeToggle />
            <form action={signOut} className="flex-1">
              <button className="btn-outline w-full !py-2.5"><LogOut className="size-4" /> Log out</button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur md:hidden">
          <Logo className="h-7" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOut}>
              <button aria-label="Log out" className="inline-flex size-10 items-center justify-center rounded-full border border-line"><LogOut className="size-4" /></button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 pb-28 sm:px-6 md:py-8 md:pb-10">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav aria-label="Admin" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden">
        <div className="flex px-2 pt-1.5">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`flex flex-1 flex-col items-center gap-1 py-1.5 text-[11px] font-medium ${active(n) ? 'text-brand' : 'text-muted'}`}>
              <span className={`flex h-8 w-14 items-center justify-center rounded-full ${active(n) ? 'bg-brand-soft' : ''}`}><n.icon className="size-5" /></span>
              {n.short || n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
