import type { Metadata } from 'next';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import RegisterForm from './RegisterForm';
import Backdrop from '@/components/Backdrop';
import StageLights from '@/components/StageLights';
import { EVENT } from '@/lib/event';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Register',
  description: `Register for ${EVENT.name}: ${EVENT.theme}. Attend in Lagos, watch online, volunteer or partner with us.`,
};

export const revalidate = 60;

export default async function RegisterPage() {
  const settings = await getSettings();
  const open = settings.registration_open === 'true';

  return (
    // REGISTER_DESKTOP_24OCT2026: overflow-hidden made this wrapper the scroll
    // box for the sticky intro, so on desktop it scrolled away and left an
    // empty column beside the long form. overflow: clip still trims the
    // backdrop but keeps sticky working (old browsers fall back to hidden).
    <div className="relative isolate overflow-hidden supports-[overflow:clip]:overflow-clip">
      <Backdrop className="opacity-60" />
      <StageLights />
    <div className="container-x relative section-y">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] [&>*]:min-w-0">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow">Registration</p>
          <h1 className="h-display mt-3 text-4xl leading-tight sm:text-6xl">Join us for the <span className="text-gradient shimmer italic">Sound of Thanks.</span></h1>
          <p className="mt-4 text-muted">
            Whether you are coming to the venue, watching online, or would like to sing, pray or serve with us, register here. It takes about three minutes.
          </p>
          <ul className="mt-6 space-y-3 text-[15px]">
            <li className="flex items-center gap-3"><CalendarDays className="size-5 text-brand" /> {EVENT.dateLabel}</li>
            <li className="flex items-center gap-3"><Clock className="size-5 text-brand" /> {EVENT.timeLabel}</li>
            <li className="flex items-start gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-brand" /> {EVENT.venueName}, {EVENT.venueAddress}</li>
          </ul>
        </aside>
        <div>
          {open ? (
            <RegisterForm />
          ) : (
            <div className="card p-8 text-center">
              <p className="h-display text-3xl">Registration is closed</p>
              <p className="mt-2 text-muted">You can still watch the livestream on the day.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
