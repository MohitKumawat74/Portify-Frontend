'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface StaggerOptions {
  /** CSS selector for child items inside the container */
  itemSelector?: string;
  /** Delay between each item reveal (ms) */
  staggerMs?: number;
  /** Initial delay before sequence starts (ms) */
  initialDelay?: number;
  /** IntersectionObserver threshold */
  threshold?: number;
  /** Root margin */
  rootMargin?: string;
  /** Only play once */
  once?: boolean;
  /** Class added when item reveals */
  visibleClass?: string;
  /** Class added to hide items before reveal */
  hiddenClass?: string;
}

/**
 * useStaggerAnimation
 * Observes a container element. When it enters the viewport, reveals each
 * matching child element in sequence with a stagger delay.
 *
 * Pre-add the `hiddenClass` to your items to set the initial hidden state.
 *
 * @example
 *   const ref = useStaggerAnimation({ itemSelector: '.card', staggerMs: 100 });
 *   return (
 *     <div ref={ref}>
 *       {items.map(i => <div key={i} className="card gsap-stagger-item">...</div>)}
 *     </div>
 *   );
 */
export function useStaggerAnimation<T extends HTMLElement = HTMLDivElement>(
  options: StaggerOptions = {},
) {
  const {
    itemSelector = '.stagger-item',
    staggerMs = 90,
    initialDelay = 0,
    threshold = 0.1,
    rootMargin = '-40px',
    once = true,
    visibleClass = 'stagger-visible',
    hiddenClass = 'stagger-hidden',
  } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          const items = Array.from(el.querySelectorAll<HTMLElement>(itemSelector));
          setTimeout(() => {
            items.forEach((item, i) => {
              setTimeout(() => {
                item.classList.add(visibleClass);
                item.classList.remove(hiddenClass);
              }, i * staggerMs);
            });
          }, initialDelay);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
          const items = Array.from(el.querySelectorAll<HTMLElement>(itemSelector));
          items.forEach(item => {
            item.classList.remove(visibleClass);
            item.classList.add(hiddenClass);
          });
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [itemSelector, staggerMs, initialDelay, threshold, rootMargin, once, visibleClass, hiddenClass]);

  return { ref, isVisible };
}

/**
 * useSequentialReveal
 * Imperatively reveals an array of elements in sequence.
 * Useful for programmatic stagger animations (e.g. on button click).
 */
export function useSequentialReveal() {
  const reveal = useCallback(
    (elements: HTMLElement[], options: { staggerMs?: number; initialDelay?: number } = {}) => {
      const { staggerMs = 80, initialDelay = 0 } = options;
      return new Promise<void>(resolve => {
        setTimeout(() => {
          elements.forEach((el, i) => {
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
              if (i === elements.length - 1) resolve();
            }, i * staggerMs);
          });
        }, initialDelay);
      });
    },
    [],
  );

  return { reveal };
}

/**
 * useStaggerRef
 * Returns a ref callback that collects child element refs for manual stagger.
 */
export function useStaggerRef() {
  const itemsRef = useRef<HTMLElement[]>([]);

  const addRef = useCallback((el: HTMLElement | null) => {
    if (el && !itemsRef.current.includes(el)) {
      itemsRef.current.push(el);
    }
  }, []);

  const clearRefs = useCallback(() => {
    itemsRef.current = [];
  }, []);

  return { itemsRef, addRef, clearRefs };
}
