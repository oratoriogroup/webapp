'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WhatsAppIcon } from './icons';
import { WHATSAPP_GROUP_URL } from '@/lib/event';

// Floating "join the WhatsApp group" button, like the reference site.
// It steps out of the way while someone is typing in a form field, and
// shrinks to an icon once the visitor scrolls deep into the page.
// Phones: step aside once the footer shows, so its icons are not covered.
export const footerInView = () => {
  if (window.innerWidth >= 768) return false;
  const f = document.querySelector('footer');
  return !!f && f.getBoundingClientRect().top < window.innerHeight - 40;
};

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const [typing, setTyping] = useState(false);
  const [compact, setCompact] = useState(false);
  const [atFooter, setAtFooter] = useState(false);

  useEffect(() => {
    const isField = (t: EventTarget | null) => t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
    const onIn = (e: FocusEvent) => isField(e.target) && setTyping(true);
    const onOut = (e: FocusEvent) => isField(e.target) && setTyping(false);
    const onScroll = () => {
      setCompact(window.scrollY > 900);
      setAtFooter(footerInView());
    };
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Never cover the QR code on an attendee's pass (the pass page, and the
  // registration success page, which shows the pass and has its own group link).
  if (pathname?.startsWith('/pass/') || pathname === '/register/success') return null;

  return (
    <a
      href={WHATSAPP_GROUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join the Oratorio WhatsApp group"
      className={`wa-float fixed right-4 bottom-28 z-40 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] p-3.5 font-semibold text-white shadow-xl shadow-[#25D366]/35 transition-all duration-300 hover:-translate-y-1 md:right-8 md:bottom-8 ${
        compact ? '' : 'md:px-5'
      } ${typing || atFooter ? 'pointer-events-none translate-y-6 opacity-0' : 'opacity-100'}`}
    >
      <WhatsAppIcon className="size-6" />
      <span className={`hidden text-[15px] ${compact ? '' : 'md:inline'}`}>Join our WhatsApp group</span>
    </a>
  );
}
