/**
 * animations.ts
 * Centralised animation presets & helpers for Framer Motion and GSAP.
 * Import what you need — nothing is side-effect-heavy.
 */

import type { Variants, Transition } from 'framer-motion';

/* ─────────────────────────────────────────────
   EASINGS
   ───────────────────────────────────────────── */
export const ease = {
  spring:    [0.175, 0.885, 0.32, 1.275] as const,
  smooth:    [0.4, 0, 0.2, 1] as const,
  cinematic: [0.22, 1, 0.36, 1] as const,
  bounce:    [0.34, 1.56, 0.64, 1] as const,
  anticipate:[0.36, 0, 0.66, -0.56] as const,
} as const;

/* ─────────────────────────────────────────────
   TRANSITIONS
   ───────────────────────────────────────────── */
export const transition: Record<string, Transition> = {
  fast:    { duration: 0.25, ease: ease.smooth },
  default: { duration: 0.5,  ease: ease.cinematic },
  slow:    { duration: 0.8,  ease: ease.cinematic },
  spring:  { type: 'spring', stiffness: 400, damping: 30 },
  springGentle: { type: 'spring', stiffness: 200, damping: 28 },
  springBounce: { type: 'spring', stiffness: 300, damping: 18 },
};

/* ─────────────────────────────────────────────
   FRAMER MOTION VARIANT PRESETS
   ───────────────────────────────────────────── */
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.cinematic } },
};

export const fadeDown: Variants = {
  hidden:  { opacity: 0, y: -40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.cinematic } },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const fadeLeft: Variants = {
  hidden:  { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: ease.cinematic } },
};

export const fadeRight: Variants = {
  hidden:  { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: ease.cinematic } },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: ease.cinematic } },
};

export const scaleUp: Variants = {
  hidden:  { opacity: 0, scale: 0.7, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease: ease.bounce } },
};

export const clipReveal: Variants = {
  hidden:  { clipPath: 'inset(0 100% 0 0)' },
  visible: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 0.7, ease: ease.cinematic } },
};

export const blurIn: Variants = {
  hidden:  { opacity: 0, filter: 'blur(12px)', y: 16 },
  visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.6, ease: ease.cinematic } },
};

/* ─────────────────────────────────────────────
   STAGGER CONTAINERS
   ───────────────────────────────────────────── */
export function staggerContainer(staggerDelay = 0.1, delayChildren = 0): Variants {
  return {
    hidden:  {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
}

export function staggerFadeUp(yOffset = 40, duration = 0.55): Variants {
  return {
    hidden:  { opacity: 0, y: yOffset },
    visible: { opacity: 1, y: 0, transition: { duration, ease: ease.cinematic } },
  };
}

/* ─────────────────────────────────────────────
   HOVER PRESETS (use on whileHover/whileTap)
   ───────────────────────────────────────────── */
export const hoverLift = {
  scale: 1.03,
  y: -4,
  transition: transition.springGentle,
};

export const hoverGrow = {
  scale: 1.07,
  transition: transition.springGentle,
};

export const tapPress = {
  scale: 0.96,
  transition: transition.fast,
};

export const hoverGlow = (color = 'rgba(124,58,237,0.5)') => ({
  boxShadow: `0 0 40px ${color}`,
  transition: transition.fast,
});

/* ─────────────────────────────────────────────
   PAGE TRANSITION VARIANTS
   ───────────────────────────────────────────── */
export const pageEnter: Variants = {
  initial:  { opacity: 0, y: 20, filter: 'blur(8px)' },
  animate:  { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.55, ease: ease.cinematic } },
  exit:     { opacity: 0, y: -20, filter: 'blur(4px)', transition: { duration: 0.35, ease: ease.smooth } },
};

export const pageSlide: Variants = {
  initial:  { opacity: 0, x: 60 },
  animate:  { opacity: 1, x: 0, transition: { duration: 0.5, ease: ease.cinematic } },
  exit:     { opacity: 0, x: -60, transition: { duration: 0.35, ease: ease.smooth } },
};

/* ─────────────────────────────────────────────
   GSAP HELPER DEFAULTS
   ───────────────────────────────────────────── */
export const gsapDefaults = {
  scrollTrigger: {
    start: 'top 85%',
    end: 'bottom 15%',
    toggleActions: 'play none none reverse',
  },
  fadeUp: {
    from: { opacity: 0, y: 60, duration: 0.8, ease: 'power3.out' },
    scrollTriggerStart: 'top 90%',
  },
  stagger: {
    amount: 0.5,
    ease: 'power3.out',
  },
} as const;

/* ─────────────────────────────────────────────
   RESPONSIVE ANIMATION SCALE
   (reduces intensity on mobile)
   ───────────────────────────────────────────── */
export function getResponsiveMotion(isMobile: boolean) {
  return {
    yOffset: isMobile ? 24 : 48,
    xOffset: isMobile ? 24 : 60,
    duration: isMobile ? 0.4 : 0.65,
    stagger: isMobile ? 0.06 : 0.1,
    scale: isMobile ? 0.95 : 0.85,
  };
}
