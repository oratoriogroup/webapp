import { WhatsAppIcon } from './icons';
import { WHATSAPP_GROUP_URL } from '@/lib/event';

// Floating "join the WhatsApp group" pill, like the reference site. Sits above
// the phone bottom menu and collapses to a round button on small screens.
export default function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_GROUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join the Oratorio WhatsApp group"
      className="wa-float fixed right-4 bottom-24 z-40 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] p-3.5 font-semibold text-white shadow-xl shadow-[#25D366]/35 transition-transform duration-300 hover:-translate-y-1 md:right-8 md:bottom-8 md:px-5 md:py-3.5"
    >
      <WhatsAppIcon className="size-6" />
      <span className="hidden text-[15px] md:inline">Join our WhatsApp group</span>
    </a>
  );
}
