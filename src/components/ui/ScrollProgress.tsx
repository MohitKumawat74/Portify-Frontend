'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[999] h-[3px] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent))',
      }}
    />
  );
}
