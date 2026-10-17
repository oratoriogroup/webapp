import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock, MapPin, Radio, Navigation, Music, Mic2, Drama, Laugh, Footprints, Drum, Flame, PlayCircle } from 'lucide-react';
import Countdown from '@/components/Countdown';
import VideoEmbed from '@/components/VideoEmbed';
import MinisterCard from '@/components/MinisterCard';
import { SOCIAL_ICON } from '@/components/icons';
import { EVENT, CONVENER, MINISTERS, SOCIALS, MAP_EMBED_URL, DIRECTIONS_URL } from '@/lib/event';
import { getSettings } from '@/lib/settings';
import { youtubeId } from '@/lib/youtube';

export const revalidate = 60;

const EXPERIENCE_ICONS = [Music, Mic2, Drama, Laugh, Footprints, Drum, Flame];

export default async function HomePage() {
  const settings = await getSettings();
  const videoId = youtubeId(settings.featured_video_url);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: 'radial-gradient(60% 60% at 75% 20%, rgba(226,180,79,.22), transparent 70%), radial-gradient(50% 50% at 10% 90%, rgba(196,47,42,.18), transparent 70%)' }}
        />
        <div className="container-x relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="eyebrow !text-[#e2b44f]">{EVENT.organiser} presents</p>
            <h1 className="h-display mt-4 text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
              Oratorio 2026
              <span className="mt-2 block text-[#e2b44f] italic">{EVENT.theme}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">{EVENT.tagline}. Live in Lagos and streaming worldwide.</p>

            <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#e2b44f]" />
                <div><dt className="sr-only">Date</dt><dd className="font-medium">{EVENT.dateLabel}</dd></div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Clock className="mt-0.5 size-5 shrink-0 text-[#e2b44f]" />
                <div><dt className="sr-only">Time</dt><dd className="font-medium">{EVENT.timeLabel}</dd></div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <MapPin className="mt-0.5 size-5 shrink-0 text-[#e2b44f]" />
                <div><dt className="sr-only">Venue</dt><dd className="font-medium">Maryland, Lagos</dd></div>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-gold !px-7 !py-3.5 text-[15px]">
                Register now <ArrowRight className="size-4" />
              </Link>
              <Link href="/live" className="btn !border !border-white/20 !px-7 !py-3.5 text-[15px] text-white hover:!bg-white/10">
                <Radio className="size-4" /> Watch live
              </Link>
            </div>

            <div className="mt-10 max-w-md">
              <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-white/60 uppercase">Counting down to 12 November</p>
              <Countdown />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <img
              src="/images/flyer-convener.webp"
              alt="Oratorio 2026 flyer: The Sound of Thanks, with Dr. Oyindamola Adejumo-Ayibiowu"
              width={1200}
              height={1500}
              fetchPriority="high"
              className="w-full rounded-3xl border border-white/10 shadow-2xl shadow-black/50"
            />
          </div>
        </div>
      </section>

      {/* Featured video */}
      <section id="video" className="container-x py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Watch</p>
          <h2 className="h-display mt-3 text-4xl sm:text-5xl">A glimpse of Oratorio</h2>
        </div>
        <div className="mx-auto mt-10 max-w-4xl">
          {videoId ? (
            <VideoEmbed id={videoId} title="Oratorio highlight" />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface-2 text-center">
              <PlayCircle className="size-12 text-gold" strokeWidth={1.4} />
              <p className="mt-3 font-medium">Video coming soon</p>
              <p className="mt-1 text-sm text-muted">Check back shortly.</p>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-y border-line bg-surface">
        <div className="container-x grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">About Oratorio</p>
            <h2 className="h-display mt-3 text-4xl leading-tight sm:text-5xl">An evening set apart for gratitude.</h2>
          </div>
          <div className="space-y-5 text-[17px] leading-relaxed text-muted">
            <p>
              Oratorio is a concert of praise convened by {CONVENER.name} and the {EVENT.organiser}. This year&apos;s edition, <span className="text-text">{EVENT.theme}</span>, gathers worshippers,
              ministers and creatives for one evening of praise, gratitude and celebration.
            </p>
            <p>
              Join us at {EVENT.venueName}, {EVENT.venueAddress}, or watch the livestream from anywhere in the world. Registration is free and helps us prepare for you.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/register" className="btn-primary">Register for free</Link>
              <a href="#lineup" className="btn-outline">See the lineup</a>
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="container-x py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">The experience</p>
          <h2 className="h-display mt-3 text-4xl sm:text-5xl">Seven ways to give thanks.</h2>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {EVENT.experiences.map((x, i) => {
            const Icon = EXPERIENCE_ICONS[i]!;
            return (
              <li key={x} className={`card flex flex-col gap-6 p-5 sm:p-6 ${i === EVENT.experiences.length - 1 ? 'col-span-2 lg:col-span-1' : ''}`}>
                <Icon className="size-6 text-gold" strokeWidth={1.7} />
                <p className="text-[15px] leading-snug font-semibold sm:text-base">{x}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Lineup */}
      <section id="lineup" className="border-y border-line bg-surface">
        <div className="container-x py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Lineup</p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl">Ministering at Oratorio 2026</h2>
          </div>
          <div className="mt-12">
            <MinisterCard m={CONVENER} featured />
          </div>
          <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {MINISTERS.map((m) => (
              <MinisterCard key={m.slug} m={m} />
            ))}
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2">
            <img src="/images/flyer-poster.webp" alt="Oratorio 2026 official lineup flyer" width={1200} height={1500} loading="lazy" className="w-full rounded-2xl border border-line" />
            <img src="/images/flyer-lineup.webp" alt="Oratorio 2026 guest ministers flyer" width={1200} height={1500} loading="lazy" className="w-full rounded-2xl border border-line" />
          </div>
        </div>
      </section>

      {/* Livestream band */}
      <section className="bg-ink text-white">
        <div className="container-x flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-red px-3 py-1 text-xs font-bold tracking-wider uppercase">
              <Radio className="size-3.5" /> Streaming worldwide
            </p>
            <h2 className="h-display mt-4 text-3xl sm:text-4xl">Can&apos;t be in Lagos? Join from anywhere.</h2>
            <p className="mt-2 text-white/65">The livestream plays right here on our website on {EVENT.dateShort} from {EVENT.timeLabel}.</p>
          </div>
          <Link href="/live" className="btn-gold shrink-0 !px-7 !py-3.5">
            Go to livestream <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Share your experience */}
      <section id="share" className="container-x py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <img src="/images/flyer-experience.webp" alt="Have you experienced Oratorio? Share your story" width={1200} height={1200} loading="lazy" className="w-full rounded-3xl border border-line" />
          <div>
            <p className="eyebrow">Have you experienced Oratorio?</p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl">We want to hear your story.</h2>
            <p className="mt-5 text-[17px] text-muted">Make a short video telling us:</p>
            <ol className="mt-4 space-y-3">
              {['What was your Oratorio experience like?', 'What stood out to you?', 'Why are you excited about the upcoming Oratorio concert?'].map((q, i) => (
                <li key={q} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-sm font-bold text-gold">{i + 1}</span>
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
        <div className="container-x grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">Venue</p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl">Live in Lagos</h2>
            <address className="mt-6 not-italic">
              <p className="text-lg font-semibold">{EVENT.venueName}</p>
              <p className="mt-1 text-muted">{EVENT.venueAddress}</p>
            </address>
            <ul className="mt-6 space-y-3 text-[15px]">
              <li className="flex items-center gap-3"><CalendarDays className="size-5 text-gold" /> {EVENT.dateLabel}</li>
              <li className="flex items-center gap-3"><Clock className="size-5 text-gold" /> {EVENT.timeLabel}. Please arrive early, seating is limited.</li>
            </ul>
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8">
              <Navigation className="size-4" /> Get directions
            </a>
          </div>
          <div className="overflow-hidden rounded-3xl border border-line">
            <iframe
              src={MAP_EMBED_URL}
              title={`Map: ${EVENT.venueName}`}
              className="aspect-[4/3] w-full lg:h-full lg:min-h-[380px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-x py-16 sm:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-white sm:px-12">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(50% 80% at 50% 0%, rgba(226,180,79,.25), transparent 70%)' }} />
          <div className="relative">
            <h2 className="h-display text-4xl sm:text-5xl">Be part of the Sound of Thanks.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">Attend in person, watch online, volunteer or partner with us. It takes about three minutes.</p>
            <Link href="/register" className="btn-gold mt-8 !px-8 !py-3.5 text-[15px]">
              Register now <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
