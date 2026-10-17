import { initials, type Minister } from '@/lib/event';

// Headshot when one has been supplied, otherwise a clean monogram.
export default function MinisterCard({ m, featured = false }: { m: Minister; featured?: boolean }) {
  return (
    <figure className="group text-center">
      <div
        className={`relative mx-auto overflow-hidden rounded-full border border-line bg-surface-2 ${
          featured ? 'size-40 sm:size-48' : 'size-28 sm:size-32'
        }`}
      >
        {m.photo ? (
          <img src={m.photo} alt={m.name} className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
        ) : (
          <span className={`flex size-full items-center justify-center font-display font-semibold text-gold ${featured ? 'text-5xl' : 'text-3xl'}`} aria-hidden>
            {initials(m.name)}
          </span>
        )}
      </div>
      <figcaption className="mt-4">
        <p className={`font-semibold ${featured ? 'text-lg' : 'text-[15px]'}`}>{m.name}</p>
        <p className="mt-0.5 text-sm text-muted">{m.role || 'Guest Minister'}</p>
      </figcaption>
    </figure>
  );
}
