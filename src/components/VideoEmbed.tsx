'use client';

import { Play } from 'lucide-react';
import { useState } from 'react';
import { embedUrl, thumbUrl } from '@/lib/youtube';

// Shows a lightweight thumbnail and loads the YouTube player only on tap, so
// the page stays fast. Pass eager to load the player immediately (live page).
export default function VideoEmbed({ id, title, eager = false }: { id: string; title: string; eager?: boolean }) {
  const [on, setOn] = useState(eager);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      {on ? (
        <iframe
          src={embedUrl(id, true)}
          title={title}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="group absolute inset-0 size-full" aria-label={`Play: ${title}`}>
          <img src={thumbUrl(id)} alt="" className="size-full object-cover opacity-90 transition-opacity group-hover:opacity-100" loading="lazy" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-white/95 text-ink shadow-xl transition-transform group-hover:scale-105 sm:size-20">
              <Play className="ml-1 size-7 fill-current sm:size-8" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
