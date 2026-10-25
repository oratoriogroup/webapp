'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { footerInView } from './FloatingWhatsApp';
import { ArrowUp } from 'lucide-react';

// Fades [data-reveal] elements up as they scroll into view.
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    if (!('IntersectionObserver' in window)) return;
    root.classList.add('js-reveal');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-shown');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    document.querySelectorAll('[data-reveal]:not(.is-shown)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}

// "Back to top" arrow, shown once the visitor has scrolled down.
export function BackToTop() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700 && !footerInView());
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // Same pages as the floating WhatsApp button: on the pass and the
  // registration success page it covered the pass, the DP and Copy link.
  if (pathname?.startsWith('/pass/') || pathname === '/register/success') return null;
  // Phones: hidden. With the bottom dock and the WhatsApp button it made a
  // stack of floating buttons that covered text all down the page, and phones
  // already scroll to the top when the status bar is tapped.
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed right-5 bottom-48 z-40 hidden size-12 md:inline-flex items-center justify-center rounded-full bg-brand text-white shadow-xl shadow-brand/30 transition-all duration-300 hover:-translate-y-1 md:right-9 md:bottom-28 ${
        show ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <ArrowUp className="size-5" strokeWidth={2.4} />
    </button>
  );
}
