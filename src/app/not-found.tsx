import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Home, PenLine, Radio } from 'lucide-react';
import Backdrop from '@/components/Backdrop';
import StageLights from '@/components/StageLights';
import { Logo } from '@/components/SiteHeader';
import { WhatsAppIcon } from '@/components/icons';
import { CONTACTS, whatsappLink } from '@/lib/event';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

// Branded 404 (NOT_FOUND_22OCT2026): logo, a clear message and the three
// places most visitors want, with big tap targets on phones. Short screens
// (e.g. 320 x 568) get tighter spacing so it all fits without scrolling.
export default function NotFound() {
  const help = CONTACTS[0];
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-bg">
      <Backdrop className="opacity-70" />
      <StageLights />
      <header className="relative flex justify-center px-4 pt-6 sm:pt-8 [@media(max-height:620px)]:pt-4">
        <Link href="/" aria-label="Oratorio home"><Logo className="h-10 sm:h-11" /></Link>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-4 py-10 [@media(max-height:620px)]:py-5">
        <div className="w-full max-w-md text-center">
          <p className="h-display text-gradient text-[88px] leading-none font-bold sm:text-[112px] [@media(max-height:620px)]:text-[68px]">404</p>
          <h1 className="h-display mt-2 text-3xl text-balance sm:text-4xl">Page not found</h1>
          <p className="mt-3 text-[15px] text-balance text-muted sm:text-base">
            This link may be mistyped or no longer in use. Here is where you can go instead.
          </p>
          <div className="mt-7 grid gap-2.5 [@media(max-height:620px)]:mt-5">
            <Link href="/register" className="btn-brand min-h-12 w-full"><PenLine className="size-4" /> Register for Oratorio 2026 <ArrowRight className="size-4" /></Link>
            <Link href="/livestream" className="btn-outline min-h-12 w-full"><Radio className="size-4 text-brand" /> Watch the livestream</Link>
            <Link href="/" className="btn-outline min-h-12 w-full"><Home className="size-4" /> Back to home</Link>
          </div>
          {help && (
            <p className="mt-6 text-sm text-muted">
              Need help?{' '}
              <a href={whatsappLink(help.intl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#128C4B] underline-offset-4 hover:underline dark:text-[#4ade80]">
                <WhatsAppIcon className="size-4" /> WhatsApp {help.label}
              </a>
            </p>
          )}
        </div>
      </main>
      <p className="relative pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-xs text-muted">Copyright &copy; Oratorio 2026</p>
    </div>
  );
}
