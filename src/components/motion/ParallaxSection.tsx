'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode, CSSProperties } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** How much the section moves relative to scroll. Negative = counter-scroll. */
  speed?: number;
  /** Animate child element matching this selector instead of root */
  childSelector?: string;
  /** Add a pinned scroll section (GSAP pin) */
  pin?: boolean;
  /** Duration in scroll pixels for pinned section */
  pinLength?: string;
}

/**
 * ParallaxSection
 * GSAP ScrollTrigger-based parallax. The wrapped element translates on Y-axis
 * as the user scrolls through it.
 */
export function ParallaxSection({
  children,
  className = '',
  style,
  speed = 0.3,
  childSelector,
  pin = false,
  pinLength = '200%',
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined') return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return; // disable on mobile for perf

    let cleanup: (() => void) | undefined;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const target = childSelector
          ? el.querySelector<HTMLElement>(childSelector)
          : el;

        if (!target) return;

        const anim = gsap.to(target, {
          y: () => el.offsetHeight * speed * -1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: pin ? `+=${pinLength}` : 'bottom top',
            scrub: true,
            pin: pin ? el : false,
          },
        });

        cleanup = () => {
          anim.kill();
          ScrollTrigger.getAll().forEach(t => t.kill());
        };
      });
    });

    return () => cleanup?.();
  }, [speed, childSelector, pin, pinLength]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/**
 * HorizontalScrollSection
 * Creates a horizontal scroll storytelling section — content scrolls left
 * while user scrolls down (pinned section).
 */
export function HorizontalScrollSection({
  children,
  className = '',
  panelSelector = '.h-panel',
}: {
  children: ReactNode;
  className?: string;
  panelSelector?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined') return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return;

    let cleanup: (() => void) | undefined;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const panels = Array.from(el.querySelectorAll<HTMLElement>(panelSelector));
        if (panels.length === 0) return;

        const totalWidth = panels.reduce((acc, p) => acc + p.offsetWidth, 0);

        const anim = gsap.to(panels, {
          xPercent: -100 * (panels.length - 1),
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            pin: true,
            scrub: 1,
            end: () => `+=${totalWidth}`,
            snap: { snapTo: 1 / (panels.length - 1), duration: 0.5, ease: 'power2.inOut' },
          },
        });

        cleanup = () => {
          anim.kill();
          ScrollTrigger.getAll().forEach(t => t.kill());
        };
      });
    });

    return () => cleanup?.();
  }, [panelSelector]);

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${className}`}
      style={{ display: 'flex', flexWrap: 'nowrap' }}
    >
      {children}
    </div>
  );
}
