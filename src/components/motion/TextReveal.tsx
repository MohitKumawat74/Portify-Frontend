'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { ReactNode } from 'react';

interface SplitTextProps {
  text: string;
  /** 'chars' | 'words' | 'lines' */
  splitBy?: 'chars' | 'words' | 'lines';
  className?: string;
  charClassName?: string;
  /** Animation to apply to each item */
  animation?: 'fadeUp' | 'slideUp' | 'blur' | 'scale' | 'rotate';
  /** Base delay in seconds */
  delay?: number;
  /** Stagger between items in seconds */
  stagger?: number;
  /** Time each item takes to animate */
  duration?: number;
  once?: boolean;
}

const ANIMATIONS = {
  fadeUp: {
    hidden: { opacity: 0, y: '120%' },
    visible: { opacity: 1, y: '0%' },
  },
  slideUp: {
    hidden: { y: '110%' },
    visible: { y: '0%' },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)', y: 10 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 },
  },
  rotate: {
    hidden: { opacity: 0, rotateX: 90, y: 30 },
    visible: { opacity: 1, rotateX: 0, y: 0 },
  },
};

/**
 * SplitText
 * Animates text by splitting it into chars / words / lines,
 * then stagger-reveals them with Framer Motion.
 *
 * @example
 *   <SplitText text="Build your portfolio" splitBy="words" animation="fadeUp" />
 */
export function SplitText({
  text,
  splitBy = 'chars',
  className = '',
  charClassName = '',
  animation = 'fadeUp',
  delay = 0,
  stagger = 0.03,
  duration = 0.5,
  once = true,
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, margin: '-80px' });

  const items =
    splitBy === 'chars'
      ? text.split('')
      : splitBy === 'words'
      ? text.split(' ')
      : [text];

  const preset = ANIMATIONS[animation];

  return (
    <span ref={ref} className={`inline-block ${className}`} aria-label={text}>
      {items.map((item, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden"
          style={{ whiteSpace: item === ' ' && splitBy === 'chars' ? 'pre' : undefined }}
        >
          <motion.span
            className={`inline-block ${charClassName}`}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={preset}
            transition={{
              duration,
              delay: delay + i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {item === ' ' ? '\u00A0' : item}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * RevealText
 * A clip-path–based line reveal. Wraps children inside a clipping container
 * so text slides up from behind a mask.
 */
export function RevealText({
  children,
  delay = 0,
  duration = 0.7,
  className = '',
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: '-60px' });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={inView ? { y: '0%', opacity: 1 } : { y: '100%', opacity: 0 }}
        transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * GradientText
 * Text that cycles through gradient colors via CSS animation.
 */
export function GradientText({
  children,
  className = '',
  from = '#7C3AED',
  via = '#0EA5E9',
  to = '#7C3AED',
  duration = 4,
}: {
  children: ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
  duration?: number;
}) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${from}, ${via}, ${to}, ${from})`,
        backgroundSize: '300% 100%',
        animation: `gradient-shift ${duration}s linear infinite`,
      }}
    >
      {children}
    </span>
  );
}
