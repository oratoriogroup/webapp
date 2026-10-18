import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export const NAV = [
  { href: '/#about', label: 'About' },
  { href: '/#lineup', label: 'Lineup' },
  { href: '/#venue', label: 'Venue' },
  { href: '/livestream', label: 'Livestream' },
];

export function Logo({ className = 'h-9' }: { className?: string }) {
  return (
    <>
      <img src="/images/logo-color.webp" alt="Oratorio Music Foundation" width={1777} height={493} className={`w-auto dark:hidden ${className}`} />
      <img src="/images/logo-white.webp" alt="" aria-hidden width={1777} height={493} className={`hidden w-auto dark:block ${className}`} />
    </>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Oratorio home" className="shrink-0">
          <Logo className="h-8 sm:h-9" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-brand-soft hover:text-brand">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/register" className="btn-brand hidden !py-2.5 sm:inline-flex">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
