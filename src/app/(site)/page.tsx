import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock, MapPin, Radio, Navigation, Music, Mic2, Drama, Laugh, Footprints, Drum, Flame, PlayCircle } from 'lucide-react';
import Countdown from '@/components/Countdown';
import VideoEmbed from '@/components/VideoEmbed';
import MinisterCard from '@/components/MinisterCard';
import Backdrop from '@/components/Backdrop';
import { SOCIAL_ICON } from '@/components/icons';
import { EVENT, CONVENER, MINISTERS, SOCIALS, MAP_EMBED_URL, DIRECTIONS_URL } from '@/lib/event';
import { getSettings } from '@/lib/settings';
import { youtubeId } from '@/lib/youtube';

export const revalidate = 60;

const EXPERIENCE = [
  { icon: Music, tone: 'text-brand bg-brand-soft' },
  { icon: Mic2, tone: 'text-gold bg-gold-soft' },
  { icon: Drama, tone: 'text-brand-2 bg-brand-2/10' },
  { icon: Laugh, tone: 'text-brand bg-brand-soft' },
  { icon: Footprints, tone: 'text-gold bg-gold-soft' },
  { icon: Drum, tone: 'text-brand-2 bg-brand-2/10' },
  { icon: Flame, tone: 'text-brand bg-brand-soft' },
];

const delay = (i: number) => ({ ['--reveal-delay' as string]: `${i * 90}ms` });

export default async function HomePage() {
  const settings = await getSettings();
  const videoId = youtubeId(settings.featured_video_url);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-bg">
        <Backdrop />
        <div className="container-x relative grid min-h-[calc(100svh-4rem)] items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div data-reveal>
            <p className="eyebrow">{EVENT.organiser} presents</p>
            <h1 className="h-display mt-5 text-5xl leading-[1.02] sm:text-6xl lg:text-7xl xl:text-8xl">
              Oratorio 2026
              <span className="text-gradient mt-2 block pb-2 italic">{EVENT.theme}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{EVENT.tagline}. Live in Lagos and streaming worldwide.</p>

            <ul className="mt-8 space-y-3 text-[15px] font-medium sm:text-base">
              <li className="flex items-center gap-3"><CalendarDays className="size-5 shrink-0 text-brand" /> {EVENT.dateLabel}</li>
              <li className="flex items-center gap-3"><Clock className="size-5 shrink-0 text-brand" /> {EVENT.timeLabel}</li>
              <li className="flex items-center gap-3"><Radio className="size-5 shrink-0 text-brand" /> Live in Lagos and streaming worldwide</li>
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-brand" /> {EVENT.venueName}, {EVENT.venueAddress}</li>
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/register" className="btn-brand !px-8 !py-4 text-[15px]">
                Register now <ArrowRight className="size-4" />
              </Link>
              <Link href="/live" className="btn-outline !px-8 !py-4 text-[15px]">
                <Radio className="size-4 text-brand" /> Watch live
              </Link>
            </div>
          </div>

          <div data-reveal style={delay(2)} className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand/25 via-gold/25 to-brand-2/25 blur-2xl" />
            <img
              src="/images/flyer-convener.webp"
              alt="Oratorio 2026 flyer: The Sound of Thanks, with Dr. Oyindamola Adejumo-Ayibiowu"
              width={1200}
              height={1500}
              fetchPriority="high"
              className="w-full rounded-[2rem] border border-white/60 shadow-2xl shadow-brand/20 dark:border-white/10"
            />
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="relative -mt-6 pb-6">
        <div className="container-x">
          <div data-reveal className="mx-auto max-w-3xl rounded-3xl border border-line bg-surface p-6 text-center shadow-xl shadow-brand/5 sm:p-8">
            <p className="eyebrow">Counting down to 12 November 2026</p>
            <div className="mx-auto mt-3 h-0.5 w-12 rounded-full bg-brand" />
            <div className="mt-6"><Countdown tone="auto" /></div>
          </div>
        </div>
      </section>

      {/* Featured video */}
      <section id="video" className="container-x py-16 sm:py-24">
        <div data-reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Watch</p>
          <h2 className="h-display mt-3 text-4xl sm:text-5xl lg:text-6xl">A glimpse of Oratorio</h2>
        </div>
        <div data-reveal style={delay(1)} className="mx-auto mt-10 max-w-5xl">
          {videoId ? (
            <VideoEmbed id={videoId} title="Oratorio highlight" />
          ) : (
            <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-brand-soft via-surface to-gold-soft text-center">
              <PlayCircle className="size-14 text-brand" strokeWidth={1.3} />
              <p className="mt-3 text-lg font-semibold">Video coming soon</p>
              <p className="mt-1 text-sm text-muted">Check back shortly.</p>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative overflow-hidden border-y border-line bg-surface">
        <div className="container-x grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div data-reveal className="relative mx-auto w-full max-w-md">
            <div aria-hidden className="absolute -inset-3 -z-0 rotate-3 rounded-[2rem] bg-gradient-to-br from-brand via-gold to-brand-2 opacity-80" />
            <img src={CONVENER.photo} alt={CONVENER.name} width={847} height={1100} loading="lazy" className="relative aspect-[4/5] w-full rounded-[2rem] object-cover object-top shadow-xl" />
          </div>
          <div data-reveal style={delay(1)}>
            <p className="eyebrow">About Oratorio</p>
            <h2 className="h-display mt-3 text-4xl leading-tight sm:text-5xl lg:text-6xl">An evening set apart for gratitude.</h2>
            <div className="mt-6 space-y-5 text-[17px] leading-relaxed text-muted">
              <p>
                Oratorio is a concert of praise convened by <span className="font-semibold text-text">{CONVENER.name}</span> and the {EVENT.organiser}. This year&apos;s edition,{' '}
                <span className="font-semibold text-brand">{EVENT.theme}</span>, gathers worshippers, ministers and creatives for one evening of praise, gratitude and celebration.
              </p>
              <p>Join us at {EVENT.venueName}, {EVENT.venueAddress}, or watch the livestream from anywhere in the world. Registration is free and helps us prepare for you.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-brand">Register for free</Link>
              <a href="#lineup" className="btn-outline">See the lineup</a>
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="container-x py-16 sm:py-24">
        <div data-reveal className="max-w-2xl">
          <p className="eyebrow">The experience</p>
          <h2 className="h-display mt-3 text-4xl sm:text-5xl lg:text-6xl">Seven ways to give thanks.</h2>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-7">
          {EVENT.experiences.map((x, i) => {
            const { icon: Icon, tone } = EXPERIENCE[i]!;
            return (
              <li key={x} data-reveal style={delay(i)} className={`card group flex flex-col gap-8 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg sm:p-6 ${i === EVENT.experiences.length - 1 ? 'col-span-2 md:col-span-1' : ''}`}>
                <span className={`flex size-12 items-center justify-center rounded-2xl ${tone}`}><Icon className="size-6" strokeWidth={1.8} /></span>
                <p className="text-[15px] leading-snug font-semibold sm:text-base">{x}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Lineup */}
      <section id="lineup" className="relative overflow-hidden border-y border-line bg-surface">
        <div className="container-x py-16 sm:py-24">
          <div data-reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Lineup</p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl lg:text-6xl">Ministering at Oratorio 2026</h2>
          </div>
          <div className="mx-auto mt-12 max-w-xs sm:max-w-sm">
            <MinisterCard m={CONVENER} featured />
          </div>
          <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-7">
            {MINISTERS.map((m, i) => (
              <MinisterCard key={m.slug} m={m} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* Livestream band */}
      <section className="band relative overflow-hidden">
        <div aria-hidden className="anim-drift pointer-events-none absolute -top-24 right-0 size-96 rounded-full bg-white/10 blur-3xl" />
        <div data-reveal className="container-x relative flex flex-col items-start gap-6 py-14 sm:py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wider uppercase">
              <span className="size-2 animate-pulse rounded-full bg-white" /> Streaming worldwide
            </p>
            <h2 className="h-display mt-4 text-3xl sm:text-5xl">Can&apos;t be in Lagos? Join from anywhere.</h2>
            <p className="mt-2 text-white/80">The livestream plays right here on our website on {EVENT.dateShort} from {EVENT.timeLabel}.</p>
          </div>
          <Link href="/live" className="btn shrink-0 bg-white !px-8 !py-4 text-brand shadow-xl hover:-translate-y-0.5">
            Go to livestream <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Share your experience */}
      <section id="share" className="container-x py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <img data-reveal src="/images/flyer-experience.webp" alt="Have you experienced Oratorio? Share your story" width={1200} height={1200} loading="lazy" className="w-full rounded-[2rem] border border-line shadow-xl" />
          <div data-reveal style={delay(1)}>
            <p className="eyebrow">Have you experienced Oratorio?</p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl lg:text-6xl">We want to hear your story.</h2>
            <p className="mt-5 text-[17px] text-muted">Make a short video telling us:</p>
            <ol className="mt-4 space-y-3">
              {['What was your Oratorio experience like?', 'What stood out to you?', 'Why are you excited about the upcoming Oratorio concert?'].map((q, i) => (
                <li key={q} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
                  <span className="pt-1 text-[16px]">{q}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[17px] text-muted">Post it, tag us, and send us a collaborator request so we can share it together.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICON[s.key];
                return (
                  <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className="btn-outline !py-2.5">
                    <Icon className="size-4" /> {s.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Venue */}
      <section id="venue" className="border-t border-line bg-surface">
        <div className="container-x grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div data-reveal>
            <p className="eyebrow">Venue</p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl lg:text-6xl">Live in Lagos</h2>
            <address className="mt-6 not-italic">
              <p className="text-lg font-semibold">{EVENT.venueName}</p>
              <p className="mt-1 text-muted">{EVENT.venueAddress}</p>
            </address>
            <ul className="mt-6 space-y-3 text-[15px]">
              <li className="flex items-center gap-3"><CalendarDays className="size-5 text-brand" /> {EVENT.dateLabel}</li>
              <li className="flex items-center gap-3"><Clock className="size-5 text-brand" /> {EVENT.timeLabel}. Please arrive early, seating is limited.</li>
            </ul>
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn-brand mt-8">
              <Navigation className="size-4" /> Get directions
            </a>
          </div>
          <div data-reveal style={delay(1)} className="overflow-hidden rounded-3xl border border-line shadow-lg">
            <iframe src={MAP_EMBED_URL} title={`Map: ${EVENT.venueName}`} className="aspect-[4/3] w-full lg:h-full lg:min-h-[420px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-x py-16 sm:py-24">
        <div data-reveal className="band relative overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-12">
          <Backdrop className="opacity-40 mix-blend-overlay" />
          <div className="relative">
            <h2 className="h-display text-4xl sm:text-6xl">Be part of the Sound of Thanks.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">Attend in person, watch online, volunteer or partner with us. It takes about three minutes.</p>
            <Link href="/register" className="btn mt-8 bg-white !px-8 !py-4 text-[15px] text-brand shadow-xl hover:-translate-y-0.5">
              Register now <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
