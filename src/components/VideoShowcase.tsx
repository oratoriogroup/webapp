'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';

type Props =
  | { kind: 'file'; src: string; poster?: string; title: string }
  | { kind: 'youtube'; id: string; vertical: boolean; title: string };

// Landscape video frame for the home page, in the style of the reference site.
// The self-hosted file plays muted on a loop once it scrolls into view, with
// an unmute button. Phones that block autoplay (for example iPhone in Low
// Power Mode) get a large play button instead of a frozen frame.
export default function VideoShowcase(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !('IntersectionObserver' in window)) return setInView(true);
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (inView) {
      v.muted = muted;
      v.play().then(
        () => setBlocked(false),
        () => setBlocked(true),
      );
    } else if (started.current) {
      // Only pause once it has actually played, to save data off screen.
      v.pause();
    }
  }, [inView, muted]);

  const toggleMute = () => setMuted((m) => !m);
  const tapPlay = () => {
    const v = video.current;
    if (!v) return;
    v.play().then(() => setBlocked(false), () => setBlocked(true));
  };

  if (props.kind === 'file') {
    return (
      <div ref={wrap} className="group relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-2xl shadow-brand/20">
        <video
          ref={video}
          className="absolute inset-0 size-full object-cover"
          src={props.src}
          poster={props.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          aria-label={props.title}
          onPlay={() => {
            started.current = true;
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
        />
        {blocked && !playing && (
          <button type="button" onClick={tapPlay} aria-label={`Play: ${props.title}`} className="absolute inset-0 flex items-center justify-center bg-black/25">
            <span className="flex size-16 items-center justify-center rounded-full bg-white/95 text-brand shadow-2xl sm:size-20">
              <Play className="ml-1 size-7 fill-current sm:size-8" />
            </span>
          </button>
        )}
        {!blocked && (
          <button type="button" onClick={toggleMute} className="absolute top-3 left-1/2 inline-flex min-h-10 -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/75">
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />} {muted ? 'Unmute' : 'Mute'}
          </button>
        )}
      </div>
    );
  }

  const { id, vertical, title } = props;
  // Muted autoplay loop; the viewer can unmute from the player controls.
  const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&rel=0&playsinline=1&modestbranding=1`;
  return (
    <div ref={wrap} className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-2xl shadow-brand/20">
      {vertical && (
        <>
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" aria-hidden className="absolute inset-0 size-full scale-125 object-cover opacity-80 blur-2xl" loading="lazy" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        </>
      )}
      <div className={vertical ? 'absolute inset-y-0 left-1/2 aspect-[9/16] h-full -translate-x-1/2 overflow-hidden shadow-2xl' : 'absolute inset-0'}>
        {inView ? (
          <iframe src={src} title={title} className="size-full" allow="autoplay; encrypted-media; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        ) : (
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="size-full object-cover" loading="lazy" />
        )}
      </div>
    </div>
  );
}
