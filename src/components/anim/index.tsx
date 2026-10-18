'use client';

import { LazyMotion, domAnimation, m, useReducedMotion, type Variants } from 'framer-motion';
import { useRef, type ReactNode, type PointerEvent } from 'react';

// Framer Motion loaded lazily with only the DOM animation features (about a
// third of the full bundle). Every effect respects "reduce motion".

const EASE = [0.22, 1, 0.36, 1] as const;

export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

type RevealProps = { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'section' | 'li' | 'figure' };

// Fades its content up once it scrolls into view.
export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = m[as];
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ delay }}>
      {children}
    </Tag>
  );
}

// Parent that reveals its <StaggerItem> children one after another.
export function Stagger({ children, className, gap = 0.08, as = 'div' }: { children: ReactNode; className?: string; gap?: number; as?: 'div' | 'ul' }) {
  const reduce = useReducedMotion();
  const Tag = m[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' }) {
  const Tag = m[as];
  return (
    <Tag className={className} variants={fadeUp}>
      {children}
    </Tag>
  );
}

// Subtle 3D tilt that follows the pointer on desktop. Touch devices and
// reduced-motion users get the plain hover lift from CSS instead.
export function Tilt({ children, className = '', max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-8px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
  };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className={`transition-transform duration-300 ease-out will-change-transform hover:-translate-y-2 ${className}`}>
      {children}
    </div>
  );
}
