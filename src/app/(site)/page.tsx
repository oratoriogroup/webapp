import Link from 'next/link';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ArrowRight, CalendarDays, Clock, MapPin, Radio, Navigation, Music, Mic2, Drama, Laugh, Footprints, Drum, Flame, PlayCircle, MessageCircle, Phone } from 'lucide-react';
import Countdown from '@/components/Countdown';
import VideoShowcase from '@/components/VideoShowcase';
import MinisterCard from '@/components/MinisterCard';
import Backdrop from '@/components/Backdrop';
import StageLights from '@/components/StageLights';
import Marquee from '@/components/Marquee';
import HeroShowcase from '@/components/HeroShowcase';
import { Reveal, Stagger, StaggerItem } from '@/components/anim';
import { SOCIAL_ICON } from '@/components/icons';
import { EVENT, CONVENER, MINISTERS, SOCIALS, CONTACTS, MAP_EMBED_URL, DIRECTIONS_URL, whatsappLink } from '@/lib/event';
import { getSettings } from '@/lib/settings';
import { youtubeId } from '@/lib/youtube';

export const revalidate = 60;

const EXPERIENCE = [
  { icon: Music, tone: 'text-brand bg-brand-soft' },
  { icon: Mic2, tone: 'text-gold bg-gold-soft' },
  { icon: Drama, tone: 'text-brand-deep bg-brand-soft' },
  { icon: Laugh, tone: 'text-brand bg-brand-soft' },
  { icon: Footprints, tone: 'text-gold bg-gold-soft' },
  { icon: Drum, tone: 'text-brand-deep bg-brand-soft' },
  { icon: Flame, tone: 'text-brand bg-brand-soft' },
];

function SectionHead({ eyebrow, title, center = false }: { eyebrow: string; title: string; center?: boolean }) {
  return (
    <Reveal className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="h-display mt-3 text-3xl leading-tight sm:text-4xl lg:text-5xl">{title}</h2>
    </Reveal>
  );
}

export default async function HomePage() {
  const settings = await getSettings();
  const videoId = youtubeId(settings.featured_video_url);
  const isShort = /\/shorts\//.test(settings.featured_video_url);
  // A converted landscape file in public/videos wins over a YouTube link.
  const hasFile = existsSync(join(process.cwd(), 'public', 'videos', 'glimpse.mp4'));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <Backdrop />
        <StageLights />
        <div className="container-x relative grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16">
          <Stagger gap={0.1}>
            <StaggerItem><p className="eyebrow">{EVENT.organiser} presents</p></StaggerItem>
            <StaggerItem>
              <h1 className="h-display mt-4 text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl">
                Oratorio 2026
                <span className="text-gradient shimmer mt-1 block pb-2 italic">{EVENT.theme}</span>
              </h1>
            </StaggerItem>
            <StaggerItem><p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{EVENT.tagline}. Live in Lagos and streaming worldwide.</p></StaggerItem>
            <StaggerItem>
              <ul className="mt-6 grid gap-2.5 text-[15px] font-medium sm:grid-cols-2">
                <li className="flex items-center gap-3"><CalendarDays className="size-5 shrink-0 text-brand" /> {EVENT.dateLabel}</li>
                <li className="flex items-center gap-3"><Clock className="size-5 shrink-0 text-brand" /> {EVENT.timeLabel}</li>
                <li className="flex items-center gap-3"><Radio className="size-5 shrink-0 text-brand" /> Live in Lagos and online</li>
                <li className="flex items-center gap-3"><MapPin className="size-5 shrink-0 text-brand" /> Maryland, Lagos</li>
              </ul>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/register" className="btn-brand min-h-12 !px-7 text-[15px]">Register now <ArrowRight className="size-4" /></Link>
                <Link href="/livestream" className="btn-outline min-h-12 !px-7 text-[15px]"><Radio className="size-4 text-brand" /> Watch live</Link>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-8 max-w-md rounded-2xl border border-line bg-surface/80 p-4 backdrop-blur">
                <p className="mb-3 text-[11px] font-bold tracking-[0.2em] text-muted uppercase">Counting down to 12 November</p>
                <Countdown tone="auto" />
              </div>
            </StaggerItem>
          </Stagger>

          <Reveal delay={0.2} className="relative mx-auto w-full max-w-md lg:max-w-[560px]">
            <HeroShowcase />
          </Reveal>
        </div>
      </section>

      <Marquee />

      {/* Featured video */}
      <section id="video" className="container-x section-y">
        <SectionHead eyebrow="Watch" title="A glimpse of Oratorio" center />
        <Reveal delay={0.1} className="mx-auto mt-8 max-w-5xl">
          {hasFile ? (
            <VideoShowcase kind="file" src="/videos/glimpse.mp4" poster="/videos/glimpse.jpg" title="A glimpse of Oratorio" />
          ) : videoId ? (
            <VideoShowcase kind="youtube" id={videoId} vertical={isShort} title="A glimpse of Oratorio" />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-3xl border border-line bg-gradient-to-br from-brand-soft via-surface to-gold-soft text-center">
              <PlayCircle className="size-14 text-brand" strokeWidth={1.3} />
              <p className="mt-3 text-lg font-semibold">Video coming soon</p>
            </div>
          )}
        </Reveal>
      </section>

      {/* About */}
      <section id="about" className="border-y border-line bg-surface/70">
        <div className="container-x section-y grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal className="relative mx-auto w-full max-w-sm">
            <img src={CONVENER.photo} alt={CONVENER.name} width={847} height={1100} loading="lazy" decoding="async" className="halo relative aspect-[4/5] w-full rounded-[2rem] object-cover object-top" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow">About Oratorio</p>
            <h2 className="h-display mt-3 text-3xl leading-tight sm:text-4xl lg:text-5xl">An evening set apart for gratitude.</h2>
            <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-muted">
              <p>
                Oratorio is a concert of praise convened by <span className="font-semibold text-text">{CONVENER.name}</span> and the {EVENT.organiser}. This year&apos;s edition,{' '}
                <span className="font-semibold text-brand">{EVENT.theme}</span>, gathers worshippers, ministers and creatives for one evening of praise, gratitude and celebration.
              </p>
              <p>Join us at {EVENT.venueName}, {EVENT.venueAddress}, or watch the livestream from anywhere in the world. Registration is free and helps us prepare for you.</p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register" className="btn-brand min-h-12">Register for free</Link>
              <a href="#lineup" className="btn-outline min-h-12">See the lineup</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="container-x section-y">
        <SectionHead eyebrow="The experience" title="Seven ways to give thanks." />
        <Stagger as="ul" className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-7">
          {EVENT.experiences.map((x, i) => {
            const { icon: Icon, tone } = EXPERIENCE[i]!;
            return (
              <StaggerItem as="li" key={x} className={`card flex flex-col gap-6 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10 ${i === EVENT.experiences.length - 1 ? 'col-span-2 md:col-span-1' : ''}`}>
                <span className={`flex size-11 items-center justify-center rounded-2xl ${tone}`}><Icon className="size-5" strokeWidth={1.9} /></span>
                <p className="text-[15px] leading-snug font-semibold">{x}</p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Lineup */}
      <section id="lineup" className="border-y border-line bg-surface/70">
        <div className="container-x section-y">
          <SectionHead eyebrow="Lineup" title="Ministering at Oratorio 2026" center />
          <div className="mt-8 grid items-center gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
            <Reveal className="mx-auto w-full max-w-xs sm:max-w-sm"><MinisterCard m={CONVENER} featured /></Reveal>
            <Stagger className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4" gap={0.07}>
              {MINISTERS.map((m) => (
                <StaggerItem key={m.slug}><MinisterCard m={m} /></StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* Livestream band */}
      <section className="band relative overflow-hidden">
        <StageLights className="opacity-60" />
        <Reveal className="container-x relative flex flex-col items-start gap-5 py-10 sm:py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wider uppercase">
              <span className="size-2 animate-pulse rounded-full bg-white" /> Streaming worldwide
            </p>
            <h2 className="h-display mt-3 text-3xl sm:text-4xl">Can&apos;t be in Lagos? Join from anywhere.</h2>
            <p className="mt-2 text-white/85">The livestream plays here on {EVENT.dateShort} from {EVENT.timeLabel}.</p>
          </div>
          <Link href="/livestream" className="btn min-h-12 shrink-0 bg-white !px-7 text-brand-deep shadow-xl hover:-translate-y-0.5">
            Go to livestream <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </section>

      {/* Share your experience */}
      <section id="share" className="container-x section-y">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal><img src="/images/flyer-experience.webp" alt="Have you experienced Oratorio? Share your story" width={1200} height={1200} loading="lazy" decoding="async" className="halo w-full rounded-[2rem]" /></Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow">Have you experienced Oratorio?</p>
            <h2 className="h-display mt-3 text-3xl sm:text-4xl lg:text-5xl">We want to hear your story.</h2>
            <p className="mt-4 text-[17px] text-muted">Make a short video telling us:</p>
            <ol className="mt-4 space-y-3">
              {['What was your Oratorio experience like?', 'What stood out to you?', 'Why are you excited about the upcoming Oratorio concert?'].map((q, i) => (
                <li key={q} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
                  <span className="pt-1 text-[16px]">{q}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-[17px] text-muted">Post it, tag us, and send us a collaborator request. You can also share a written testimony on the livestream page.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICON[s.key];
                return (
                  <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className="btn-outline min-h-11 !py-2.5"><Icon className="size-4" /> {s.label}</a>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Venue */}
      <section id="venue" className="border-t border-line bg-surface/70">
        <div className="container-x section-y grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <Reveal>
            <p className="eyebrow">Venue</p>
            <h2 className="h-display mt-3 text-3xl sm:text-4xl lg:text-5xl">Live in Lagos</h2>
            <address className="mt-5 not-italic">
              <p className="text-lg font-semibold">{EVENT.venueName}</p>
              <p className="mt-1 text-muted">{EVENT.venueAddress}</p>
            </address>
            <ul className="mt-5 space-y-2.5 text-[15px]">
              <li className="flex items-center gap-3"><CalendarDays className="size-5 text-brand" /> {EVENT.dateLabel}</li>
              <li className="flex items-center gap-3"><Clock className="size-5 text-brand" /> {EVENT.timeLabel}. Please arrive early, seating is limited.</li>
            </ul>
            <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
              <p className="text-sm font-semibold">Enquiries and directions</p>
              <ul className="mt-2 space-y-2 text-sm">
                {CONTACTS.map((c) => (
                  <li key={c.intl} className="flex flex-wrap items-center gap-2">
                    <span className="min-w-28 font-semibold">{c.label}</span>
                    <a href={whatsappLink(c.intl)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-1.5 rounded-full bg-[#25D366]/15 px-4 font-semibold text-[#128C4B] dark:text-[#4ade80]"><MessageCircle className="size-4" /> Chat</a>
                    <a href={`tel:+${c.intl}`} className="inline-flex min-h-12 items-center gap-1.5 rounded-full bg-brand-soft px-4 font-semibold text-brand"><Phone className="size-4" /> Call</a>
                  </li>
                ))}
              </ul>
            </div>
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn-brand mt-6 min-h-12"><Navigation className="size-4" /> Get directions</a>
          </Reveal>
          <Reveal delay={0.1} className="overflow-hidden rounded-3xl border border-line shadow-xl shadow-brand/5">
            <iframe src={MAP_EMBED_URL} title={`Map: ${EVENT.venueName}`} className="aspect-[4/3] w-full lg:h-full lg:min-h-[440px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </Reveal>
        </div>
      </section>

      {/* Final CTA: full-bleed band, flush with the venue section and footer */}
      <section className="band relative mt-0 mb-0 overflow-hidden pt-0 pb-0">
        <StageLights className="opacity-70" />
        <Reveal className="container-x relative py-12 text-center sm:py-14">
          <h2 className="h-display text-3xl sm:text-5xl">Be part of the Sound of Thanks.</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">Attend in person, watch online, volunteer or partner with us. It takes about three minutes.</p>
          <Link href="/register" className="btn mt-7 min-h-12 bg-white !px-8 text-[15px] text-brand-deep shadow-xl hover:-translate-y-0.5">Register now <ArrowRight className="size-4" /></Link>
        </Reveal>
      </section>
    </>
  );
}
