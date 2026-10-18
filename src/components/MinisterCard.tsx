import { initials, type Minister } from '@/lib/event';

// Portrait card. The full photo is kept; the frame only chooses how much of it
// shows, anchored to the top so faces are never cut.
export default function MinisterCard({ m, featured = false, delay = 0 }: { m: Minister; featured?: boolean; delay?: number }) {
  return (
    <figure data-reveal style={{ ['--reveal-delay' as string]: `${delay}ms` }} className="group">
      <div className={`relative overflow-hidden rounded-3xl border border-line bg-surface-2 shadow-sm ${featured ? 'aspect-[4/5]' : 'aspect-[4/5]'}`}>
        {m.photo ? (
          <img src={m.photo} alt={m.name} className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]" loading="lazy" />
        ) : (
          <span className="flex size-full items-center justify-center font-display text-5xl font-semibold text-brand" aria-hidden>
            {initials(m.name)}
          </span>
        )}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <figcaption className="mt-4">
        <p className={`font-semibold ${featured ? 'text-xl' : 'text-base'}`}>{m.name}</p>
        <p className="mt-0.5 text-sm text-muted">{m.role || 'Guest Minister'}</p>
      </figcaption>
    </figure>
  );
}
