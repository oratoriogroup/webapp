'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

type Props =
  | { kind: 'file'; src: string; poster?: string; title: string }
  | { kind: 'youtube'; id: string; vertical: boolean; title: string };

// Landscape video frame for the home page, in the style of the reference site:
// plays muted on a loop once it scrolls into view, with an unmute button.
// A vertical YouTube Short sits in the centre with its own picture blurred
// across the sides, so it fills the landscape frame without stretching.
export default function VideoShowcase(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !('IntersectionObserver' in window)) return setInView(true);
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pause the self-hosted video while it is off screen to save data.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (inView) void v.play().catch(() => {});
    else v.pause();
  }, [inView]);

  const toggleMute = () => {
    if (video.current) video.current.muted = !muted;
    setMuted((m) => !m);
  };

  if (props.kind === 'file') {
    return (
      <div ref={wrap} className="group relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-2xl shadow-brand/20">
        <video ref={video} className="absolute inset-0 size-full object-cover" src={props.src} poster={props.poster} muted loop playsInline preload="metadata" aria-label={props.title} />
        <button type="button" onClick={toggleMute} className="absolute top-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/75">
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />} {muted ? 'Unmute' : 'Mute'}
        </button>
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
