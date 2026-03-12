'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ScrollAnimationOptions {
  /** Tailwind / CSS class(es) applied on enter */
  enterClass?: string;
  /** Tailwind / CSS class(es) applied on leave (only when once=false) */
  leaveClass?: string;
  /** IntersectionObserver threshold 0-1 */
  threshold?: number;
  /** Root margin – same syntax as IntersectionObserver rootMargin */
  rootMargin?: string;
  /** If true the observer disconnects after first intersection */
  once?: boolean;
  /** Delay before adding enterClass (ms) */
  delay?: number;
  /** Called each time the element enters the viewport */
  onEnter?: (el: Element) => void;
  /** Called each time the element leaves the viewport */
  onLeave?: (el: Element) => void;
}

/**
 * useScrollAnimation
 * Attaches an IntersectionObserver to the returned ref and toggles CSS
 * classes when the element enters / leaves the viewport.
 *
 * @example
 *   const ref = useScrollAnimation({ enterClass: 'animate-fade-up', once: true });
 *   return <div ref={ref} className="opacity-0">...</div>;
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: ScrollAnimationOptions = {},
) {
  const {
    enterClass = 'opacity-100 translate-y-0',
    leaveClass = 'opacity-0 translate-y-8',
    threshold = 0.15,
    rootMargin = '-60px',
    once = true,
    delay = 0,
    onEnter,
    onLeave,
  } = options;

  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const apply = () => {
            enterClass.split(' ').forEach(c => c && el.classList.add(c));
            leaveClass.split(' ').forEach(c => c && el.classList.remove(c));
            onEnter?.(el);
            if (once) observer.disconnect();
          };
          delay > 0 ? setTimeout(apply, delay) : apply();
        } else {
          if (!once) {
            enterClass.split(' ').forEach(c => c && el.classList.remove(c));
            leaveClass.split(' ').forEach(c => c && el.classList.add(c));
            onLeave?.(el);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enterClass, leaveClass, threshold, rootMargin, once, delay, onEnter, onLeave]);

  return ref;
}

/**
 * useScrollAnimationGroup
 * Observes multiple elements (via a container ref) and staggers their reveal.
 *
 * @example
 *   const containerRef = useScrollAnimationGroup('.card', { staggerMs: 80 });
 *   return <div ref={containerRef}><Card /><Card /></div>;
 */
export function useScrollAnimationGroup<T extends HTMLElement = HTMLDivElement>(
  selector: string,
  options: ScrollAnimationOptions & { staggerMs?: number } = {},
) {
  const { staggerMs = 80, once = true, threshold = 0.1, rootMargin = '-40px' } = options;
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>(selector));

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            items.forEach((item, i) => {
              setTimeout(() => {
                item.classList.add('gsap-reveal-in');
                item.classList.remove('gsap-reveal-hidden');
              }, i * staggerMs);
            });
            if (once) observer.disconnect();
          }
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [selector, staggerMs, once, threshold, rootMargin]);

  return containerRef;
}

/**
 * useScrollProgress
 * Returns a numeric scroll progress value [0, 1] for a given container.
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const progressRef = useRef(0);

  const getProgress = useCallback(() => {
    const el = ref.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const { innerHeight } = window;
    const progress = 1 - (rect.bottom - innerHeight) / (rect.height + innerHeight);
    return Math.max(0, Math.min(1, progress));
  }, []);

  return { ref, getProgress, progressRef };
}
