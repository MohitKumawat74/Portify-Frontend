'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode, CSSProperties, ElementType } from 'react';

/** Minimal GSAP timeline interface used for callback typing */
interface GSAPTimelineType {
  to: (targets: unknown, vars: object) => GSAPTimelineType;
  from: (targets: unknown, vars: object) => GSAPTimelineType;
  fromTo: (targets: unknown, fromVars: object, toVars: object) => GSAPTimelineType;
  kill: () => void;
  pause: () => GSAPTimelineType;
  play: () => GSAPTimelineType;
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Animation preset */
  animation?: 'fadeUp' | 'fadeIn' | 'fadeLeft' | 'fadeRight' | 'scale' | 'blur' | 'clip';
  /** Delay before animation fires (ms) */
  delay?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** When in viewport to start: e.g. "top 85%" */
  start?: string;
  /** Y distance for fadeUp / xOffset for slideLeft/Right (px) */
  distance?: number;
  /** Stagger children with this class instead of root element */
  staggerSelector?: string;
  /** Stagger delay (ms) */
  staggerMs?: number;
  /** Only animate once */
  once?: boolean;
  /** HTML tag to render */
  as?: ElementType;
}

/**
 * ScrollReveal
 * Lightweight GSAP ScrollTrigger wrapper that gracefully degrades to
 * a CSS-class intersection observer if GSAP hasn't loaded yet.
 *
 * Dynamically imports GSAP only on the client side to keep the bundle clean.
 */
export function ScrollReveal({
  children,
  className = '',
  style,
  animation = 'fadeUp',
  delay = 0,
  duration = 800,
  start = 'top 88%',
  distance = 50,
  staggerSelector,
  staggerMs = 90,
  once = true,
  as: Tag = 'div',
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cleanup: (() => void) | undefined;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const durationS = duration / 1000;
        const delayS = delay / 1000;
        const ease = 'power3.out';

        const targets = staggerSelector
          ? Array.from(el.querySelectorAll<HTMLElement>(staggerSelector))
          : [el];

        const fromVars: Record<string, number | string> = {
          duration: durationS,
          ease,
          delay: delayS,
        };

        switch (animation) {
          case 'fadeUp':
            Object.assign(fromVars, { opacity: 0, y: distance });
            break;
          case 'fadeLeft':
            Object.assign(fromVars, { opacity: 0, x: -distance });
            break;
          case 'fadeRight':
            Object.assign(fromVars, { opacity: 0, x: distance });
            break;
          case 'scale':
            Object.assign(fromVars, { opacity: 0, scale: 0.82 });
            break;
          case 'blur':
            Object.assign(fromVars, { opacity: 0, filter: 'blur(12px)', y: 20 });
            break;
          case 'clip':
            Object.assign(fromVars, { clipPath: 'inset(0 100% 0 0)' });
            break;
          case 'fadeIn':
          default:
            Object.assign(fromVars, { opacity: 0 });
        }

        const scrollTriggerConfig = {
          trigger: el,
          start,
          toggleActions: once ? 'play none none none' : 'play none none reverse',
        };

        if (staggerSelector && targets.length > 1) {
          // Set initial state
          gsap.set(targets, { opacity: 0, y: animation === 'fadeUp' ? distance : 0 });

          const tl = gsap.timeline({
            scrollTrigger: scrollTriggerConfig,
            delay: delayS,
          });

          tl.to(targets, {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            filter: 'blur(0px)',
            clipPath: animation === 'clip' ? 'inset(0 0% 0 0)' : undefined,
            duration: durationS,
            ease,
            stagger: staggerMs / 1000,
          });

          cleanup = () => {
            tl.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
          };
        } else {
          const anim = gsap.fromTo(
            el,
            { ...fromVars },
            {
              opacity: 1,
              y: 0,
              x: 0,
              scale: 1,
              filter: 'blur(0px)',
              clipPath: animation === 'clip' ? 'inset(0 0% 0 0)' : undefined,
              duration: durationS,
              ease,
              delay: delayS,
              scrollTrigger: scrollTriggerConfig,
            },
          );

          cleanup = () => {
            anim.kill();
          };
        }
      });
    });

    return () => cleanup?.();
  }, [animation, delay, duration, start, distance, staggerSelector, staggerMs, once]);

  return (
    // @ts-expect-error - dynamic tag
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}

/**
 * GSAPTimeline
 * A declarative GSAP timeline that initialises on mount.
 * Pass children and a `build` function to construct the timeline.
 */
export function GSAPTimeline({
  children,
  className,
  onBuild,
}: {
  children: ReactNode;
  className?: string;
  onBuild: (tl: GSAPTimelineType, el: HTMLElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let tl: GSAPTimelineType | undefined;

    import('gsap').then((mod) => {
      const gsap = mod.default ?? (mod as unknown as { default: typeof mod.default }).default ?? mod;
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        (gsap as unknown as { registerPlugin: (...args: unknown[]) => void }).registerPlugin(ScrollTrigger);
        tl = (gsap as unknown as typeof import('gsap').default).timeline() as unknown as GSAPTimelineType;
        onBuild(tl, el);
      });
    });

    return () => {
      tl?.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
