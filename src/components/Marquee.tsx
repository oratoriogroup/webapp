import { EVENT } from '@/lib/event';

// Endless strip of the evening's experiences, set in the display face.
export default function Marquee() {
  const items = [...EVENT.experiences, EVENT.theme];
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden} className="marquee-track flex shrink-0 items-center gap-10 pr-10">
      {items.map((x) => (
        <li key={x} className="flex items-center gap-10 whitespace-nowrap">
          <span className="font-display text-3xl italic sm:text-5xl">{x}</span>
          <span className="text-2xl text-gold sm:text-3xl">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="band relative flex overflow-hidden py-5 sm:py-7" role="marquee" aria-label={items.join(', ')}>
      {row(false)}
      {row(true)}
    </div>
  );
}
