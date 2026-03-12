'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView, useAnimation, type Variant } from 'framer-motion';

type AnimationType =
  | 'fadeUp'
  | 'fadeDown'
  | 'fadeIn'
  | 'scale'
  | 'scaleUp'
  | 'slideLeft'
  | 'slideRight'
  | 'blur'
  | 'clip'
  | 'rotateIn'
  | 'zoomOut'
  | 'flipX'
  | 'flipY';

const VARIANTS: Record<AnimationType, { hidden: Variant; visible: Variant }> = {
  fadeUp: {
    hidden: { opacity: 0, y: 48 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -48 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 1.12 },
    visible: { opacity: 1, scale: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(12px)', y: 16 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
  },
  clip: {
    hidden: { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
    visible: { clipPath: 'inset(0 0% 0 0)', opacity: 1 },
  },
  rotateIn: {
    hidden: { opacity: 0, rotateX: 22, y: 24, transformPerspective: 600 },
    visible: { opacity: 1, rotateX: 0, y: 0, transformPerspective: 600 },
  },
  zoomOut: {
    hidden: { opacity: 0, scale: 1.14 },
    visible: { opacity: 1, scale: 1 },
  },
  flipX: {
    hidden: { opacity: 0, rotateY: 75, transformPerspective: 800 },
    visible: { opacity: 1, rotateY: 0, transformPerspective: 800 },
  },
  flipY: {
    hidden: { opacity: 0, rotateX: 75, transformPerspective: 800 },
    visible: { opacity: 1, rotateX: 0, transformPerspective: 800 },
  },
};

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  /** IntersectionObserver amount threshold (0–1). Default 0.1 */
  threshold?: number;
  /** IntersectionObserver rootMargin. Default '-80px' */
  rootMargin?: string;
}

export function AnimatedSection({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = 0.6,
  className,
  once = true,
  threshold = 0.1,
  rootMargin = '-80px',
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const inView = useInView(ref, { once, margin: rootMargin as `${number}px` });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [inView, controls, once]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={VARIANTS[animation]}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        visible: { transition: { staggerChildren: staggerDelay } },
        hidden: {},
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
