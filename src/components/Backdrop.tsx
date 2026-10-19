// Decorative moving background: concentric rings that turn slowly in opposite
// directions plus two soft drifting lights. Purely visual, hidden from screen
// readers, and paused for people who prefer reduced motion.
export default function Backdrop({ className = '' }: { className?: string }) {
  const rings = [140, 220, 300, 380, 460, 540];
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="anim-drift absolute -top-40 -left-32 size-[38rem] rounded-full opacity-60 lg:blur-3xl" style={{ background: 'radial-gradient(circle, var(--hero-ring-2), transparent 70%)' }} />
      <div className="anim-drift absolute -right-40 -bottom-48 size-[42rem] rounded-full opacity-70 lg:blur-3xl [animation-delay:-9s]" style={{ background: 'radial-gradient(circle, var(--hero-ring), transparent 70%)' }} />
      <svg className="anim-spin absolute top-1/2 left-[62%] size-[1200px] -translate-x-1/2 -translate-y-1/2" viewBox="-600 -600 1200 1200" fill="none">
        {rings.map((r, i) => (
          <circle key={r} r={r} stroke={i % 2 ? 'var(--hero-ring-2)' : 'var(--hero-ring)'} strokeWidth={i % 3 === 0 ? 36 : 18} strokeDasharray={i % 2 ? `${r * 1.6} ${r * 0.9}` : `${r * 2.4} ${r * 0.7}`} strokeLinecap="round" />
        ))}
      </svg>
      <svg className="anim-spin-rev anim-pulse absolute top-1/2 left-[62%] size-[760px] -translate-x-1/2 -translate-y-1/2" viewBox="-380 -380 760 760" fill="none">
        {[90, 170, 250, 330].map((r, i) => (
          <circle key={r} r={r} stroke={i % 2 ? 'var(--hero-ring)' : 'var(--hero-ring-2)'} strokeWidth={10} strokeDasharray={`${r * 0.9} ${r * 0.5}`} strokeLinecap="round" />
        ))}
      </svg>
    </div>
  );
}
