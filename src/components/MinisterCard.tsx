import { initials, type Minister } from '@/lib/event';
import { Tilt } from './anim';

// Portrait card with a gentle 3D tilt and lift. The full photo is kept; the
// frame only chooses how much shows, anchored to the top so faces are never cut.
export default function MinisterCard({ m, featured = false }: { m: Minister; featured?: boolean }) {
  return (
    <figure className="group">
      <Tilt>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-surface-2 shadow-md transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-brand/20">
          {m.photo ? (
            <img src={m.photo} alt={m.name} width={800} height={1000} className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.05]" loading="lazy" decoding="async" />
          ) : (
            <span className="flex size-full items-center justify-center font-display text-5xl font-semibold text-brand" aria-hidden>
              {initials(m.name)}
            </span>
          )}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-brand-deep/70 via-brand-deep/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {featured && (
            <span className="absolute top-4 left-4 rounded-full bg-brand px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase shadow-lg">Convener</span>
          )}
        </div>
      </Tilt>
      <figcaption className="mt-4">
        <p className={`font-semibold ${featured ? 'text-xl' : 'text-base'}`}>{m.name}</p>
        <p className="mt-0.5 text-sm text-muted">{m.role || 'Guest Minister'}</p>
      </figcaption>
    </figure>
  );
}
