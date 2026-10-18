// Concert stage feel: soft light beams that sweep from the top and small gold
// sparkles that twinkle. Decorative only and paused for reduced motion.
const SPARKS = [
  [8, 22, 0], [18, 64, 1.2], [27, 12, 2.4], [36, 78, 0.6], [47, 30, 1.8], [58, 70, 3], [66, 18, 0.9], [74, 52, 2.1], [83, 26, 1.5], [91, 68, 2.7], [12, 88, 3.3], [52, 90, 0.3],
];

export default function StageLights({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="beam beam-a" />
      <div className="beam beam-b" />
      <div className="beam beam-c" />
      {SPARKS.map(([x, y, d], i) => (
        <span key={i} className="spark" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s`, ['--s' as string]: `${i % 3 === 0 ? 10 : 6}px` }} />
      ))}
    </div>
  );
}
