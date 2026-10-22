'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { LayoutDashboard, Users, Settings, LogOut, ExternalLink, Radio, Heart, ScanLine, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Logo } from '@/components/SiteHeader';
import { signOut } from '../actions';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/checkin', label: 'Check-in', icon: ScanLine },
  { href: '/admin/registrations', label: 'Registrations', icon: Users },
  { href: '/admin/testimonies', label: 'Testimonies', icon: Heart },
  { href: '/admin/settings', label: 'Livestream & settings', short: 'Settings', icon: Settings },
];

const COLLAPSE_KEY = 'oratorio-admin-sidebar';

// Confirmation before signing out, so a stray tap never logs staff out.
function LogoutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [pending, start] = useTransition();
  useEffect(() => {
    const read = (k: string) => {
      try {
        return localStorage.getItem(k) === 'dark' ? 'dark' : 'light';
      } catch {
        return 'light';
      }
    };
    document.documentElement.dataset.theme = read('admin-theme');
    return () => {
      document.documentElement.dataset.theme = read('theme');
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4" role="alertdialog" aria-modal="true" aria-labelledby="logout-title">
      <button type="button" aria-label="Cancel" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="pop-in relative w-full max-w-sm rounded-t-3xl border border-line bg-surface p-6 shadow-2xl sm:rounded-3xl">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand"><LogOut className="size-6" /></span>
        <p id="logout-title" className="h-display mt-4 text-2xl">Log out?</p>
        <p className="mt-1 text-sm text-muted">You will need to sign in again to use the Oratorio admin.</p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="btn-outline min-h-12" autoFocus>Cancel</button>
          <button type="button" disabled={pending} onClick={() => start(() => signOut())} className="btn-brand min-h-12">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />} Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = (n: (typeof NAV)[number]) => (n.exact ? pathname === n.href : pathname.startsWith(n.href));
  const [collapsed, setCollapsed] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
    } catch {}
  }, []);
  const toggle = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1');
      } catch {}
      return !c;
    });
  };

  const item = (n: { label: string }, isActive: boolean) =>
    `group relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors ${collapsed ? 'justify-center px-0' : 'px-3'} ${
      isActive ? 'bg-brand text-white shadow-lg shadow-brand/30' : 'text-muted hover:bg-brand-soft hover:text-brand'
    }`;
  const tip = (label: string) =>
    collapsed ? (
      <span className="pointer-events-none absolute left-full z-50 ml-3 rounded-lg bg-text px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-bg opacity-0 shadow-lg transition-opacity group-hover:opacity-100">{label}</span>
    ) : null;

  return (
    <div className={`admin-ui min-h-dvh bg-bg lg:grid lg:transition-[grid-template-columns] lg:duration-300 ${collapsed ? 'lg:grid-cols-[80px_1fr]' : 'lg:grid-cols-[264px_1fr]'}`}>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface lg:flex">
        <div className={`flex h-16 items-center border-b border-line ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
          {collapsed ? <img src="/images/mark.png" alt="Oratorio" width={36} height={36} className="size-9 object-contain" /> : <Logo className="h-8" />}
          {!collapsed && (
            <button type="button" onClick={toggle} aria-label="Collapse sidebar" title="Collapse sidebar" className="inline-flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text">
              <ChevronsLeft className="size-[18px]" />
            </button>
          )}
        </div>
        {collapsed ? (
          <button type="button" onClick={toggle} aria-label="Expand sidebar" title="Expand sidebar" className="mx-auto mt-3 inline-flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text">
            <ChevronsRight className="size-[18px]" />
          </button>
        ) : (
          <p className="px-5 pt-5 text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">Control centre</p>
        )}
        <nav className={`mt-2 flex-1 space-y-1 ${collapsed ? 'px-3' : 'px-3'}`} aria-label="Admin">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n) ? 'page' : undefined} aria-label={collapsed ? n.label : undefined} className={item(n, active(n))}>
              <n.icon className="size-[18px] shrink-0" /> {!collapsed && n.label}
              {tip(n.label)}
            </Link>
          ))}
          <a href="/livestream" target="_blank" rel="noopener" aria-label={collapsed ? 'View livestream' : undefined} className={item({ label: 'View livestream' }, false)}>
            <Radio className="size-[18px] shrink-0" /> {!collapsed && <>View livestream <ExternalLink className="ml-auto size-3.5" /></>}
            {tip('View livestream')}
          </a>
        </nav>
        <div className={`border-t border-line ${collapsed ? 'flex flex-col items-center gap-2 p-3' : 'p-4'}`}>
          {!collapsed && <p className="truncate text-xs text-muted" title={email}>{email}</p>}
          <div className={collapsed ? 'flex flex-col items-center gap-2' : 'mt-3 flex items-center gap-2'}>
            <ThemeToggle />
            {collapsed ? (
              <button type="button" onClick={() => setConfirmLogout(true)} aria-label="Log out" title="Log out" className="inline-flex size-10 items-center justify-center rounded-full border border-line text-muted hover:bg-surface-2 hover:text-text">
                <LogOut className="size-4" />
              </button>
            ) : (
              <button type="button" onClick={() => setConfirmLogout(true)} className="btn-outline flex-1 !py-2.5"><LogOut className="size-4" /> Log out</button>
            )}
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
          <Logo className="h-7" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button type="button" onClick={() => setConfirmLogout(true)} aria-label="Log out" className="inline-flex size-10 items-center justify-center rounded-full border border-line"><LogOut className="size-4" /></button>
          </div>
        </header>
        <main className="w-full max-w-none px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav aria-label="Admin" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
        <div className="flex px-1 pt-1.5 min-[400px]:px-2">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-1.5 text-[10px] font-medium tracking-tight min-[400px]:text-[11px] min-[400px]:tracking-normal ${active(n) ? 'text-brand' : 'text-muted'}`}>
              <span className={`flex h-8 w-14 items-center justify-center rounded-full ${active(n) ? 'bg-brand-soft' : ''}`}><n.icon className="size-5" /></span>
              <span className="max-w-full truncate">{n.short || n.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <LogoutDialog open={confirmLogout} onClose={() => setConfirmLogout(false)} />
    </div>
  );
}
