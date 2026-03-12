'use client';

import { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import type { ComponentType } from 'react';

type Item = {
  title: string;
  desc: string;
  icon?: ComponentType<{ className?: string }>;
  gradient?: string;
};

// px of scroll space given to each card's entrance animation
const PX_PER_CARD = 320;

function Card({
  item,
  index,
  total,
  scrollProgress,
}: {
  item: Item;
  index: number;
  total: number;
  scrollProgress: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const springX = useSpring(mvX, { stiffness: 170, damping: 26 });
  const springY = useSpring(mvY, { stiffness: 170, damping: 26 });
  const [spin, setSpin] = useState(false);
  const [hovered, setHovered] = useState(false);

  // visual stacking position
  const middle = Math.floor(total / 2);
  const offsetIndex = index - middle;
  const baseX = offsetIndex * 30;
  const baseY = Math.abs(offsetIndex) * 10;
  const baseRotate = offsetIndex * -3;

  // ── scroll-driven entrance ─────────────────────────────────────
  // progress 0→1 spans: cards  0/N+1 → 1/N+1 → … → N/N+1
  // after enterEnd the value is clamped to 1 → card STAYS VISIBLE
  const enterStart = index / (total + 1);
  const enterEnd = (index + 0.7) / (total + 1);

  const opacity = useTransform(
    scrollProgress,
    [enterStart, enterEnd, 1],
    [0, 1, 1],
    { clamp: true },
  );
  const yPos = useTransform(
    scrollProgress,
    [enterStart, enterEnd, 1],
    [60 + baseY, baseY, baseY],
    { clamp: true },
  );
  const scale = useTransform(
    scrollProgress,
    [enterStart, enterEnd, 1],
    [0.86, 1, 1],
    { clamp: true },
  );
  // rotate in from a tilted angle, settles at baseRotate
  const rotateZ = useTransform(
    scrollProgress,
    [enterStart, enterEnd, 1],
    [baseRotate + offsetIndex * 5, baseRotate, baseRotate],
    { clamp: true },
  );

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mvY.set((px - 0.5) * 28);
    mvX.set(-(py - 0.5) * 18);
  }

  function handleLeave() {
    mvY.set(0);
    mvX.set(0);
    setSpin(false);
    setHovered(false);
  }

  return (
    <motion.div
      ref={ref}
      className="absolute w-75 lg:w-85 rounded-2xl border border-white/6 p-6 shadow-2xl glass cursor-default"
      style={{
        x: baseX,
        y: yPos,
        rotate: rotateZ,
        rotateX: springX,
        rotateY: springY,
        perspective: 900,
        zIndex: hovered ? 999 : 200 + index,
        opacity,
        scale,
      }}
      onMouseMove={handleMove}
      onMouseEnter={() => { setSpin(true); setHovered(true); }}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.05 }}
    >
      <div className={`card-inner relative rounded-xl will-change-transform ${spin ? 'spin-360' : ''}`}>
        <div
          className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${item.gradient ?? 'from-violet-600 to-cyan-600'}`}
        >
          {item.icon ? <item.icon className="h-5 w-5 text-white" /> : null}
        </div>
        <h3 className="mb-2 text-base font-semibold text-white">{item.title}</h3>
        <p className="text-sm leading-relaxed text-(--color-text-muted)">{item.desc}</p>
      </div>
    </motion.div>
  );
}

export default function StackingCards({ items }: { items: Item[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // The tall container gives each card PX_PER_CARD px of scroll space,
  // plus 600px so all cards are fully shown before the section ends.
  const scrollHeight = items.length * PX_PER_CARD + 600;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    // 0 = top of container aligns with top of viewport
    // 1 = bottom of container aligns with top of viewport (fully scrolled through)
    offset: ['start start', 'end start'],
  });

  return (
    <div className="relative z-10">
      {/* ── Mobile: plain grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:hidden">
        {items.map((f) => (
          <div key={f.title} className="gradient-border glass rounded-xl p-5">
            <div
              className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br ${f.gradient}`}
            >
              {f.icon ? <f.icon className="h-5 w-5 text-white" /> : null}
            </div>
            <h3 className="mb-1.5 text-sm font-semibold text-white">{f.title}</h3>
            <p className="text-xs text-(--color-text-muted)">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Desktop: scroll-driven stacking ─────────────────────── */}
      {/* tall container — drives scrollYProgress */}
      <div
        ref={containerRef}
        className="hidden md:block relative"
        style={{ height: scrollHeight }}
      >
        {/* sticky visual stage — stays in view while parent scrolls */}
        <div className="sticky top-20 overflow-visible">
          {/* ambient glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-(--color-primary) opacity-[0.06] blur-[90px]" />

          {/* card stage */}
          <div className="relative h-115 w-full flex items-center justify-center">
            {items.map((f, i) => (
              <Card
                key={f.title}
                item={f}
                index={i}
                total={items.length}
                scrollProgress={scrollYProgress}
              />
            ))}
          </div>

          {/* scroll-hint label — fades as first card appears */}
          <motion.p
            className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/25"
            style={{
              opacity: useTransform(scrollYProgress, [0, 1 / (items.length + 1)], [1, 0], { clamp: true }),
            }}
          >
            scroll to explore
          </motion.p>
        </div>
      </div>
    </div>
  );
}
