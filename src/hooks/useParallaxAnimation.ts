'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ParallaxOptions {
  /** Speed factor: positive = normal, negative = reverse. Range: -2 to 2. */
  speed?: number;
  /** Axis to animate */
  axis?: 'y' | 'x' | 'both';
  /** Only apply on desktop (disables on mobile) */
  disableOnMobile?: boolean;
  /** Scale the element based on scroll position */
  scale?: boolean;
  /** Opacity fade based on scroll */
  fade?: boolean;
  /** Rotate element based on scroll */
  rotate?: boolean;
  /** Rotation multiplier */
  rotateSpeed?: number;
}

/**
 * useParallaxAnimation
 * Drives CSS transform on an element as the page scrolls — no GSAP dependency.
 * Uses requestAnimationFrame for smooth 60fps updates.
 *
 * @example
 *   const ref = useParallaxAnimation({ speed: 0.4 });
 *   return <div ref={ref}>Background image</div>;
 */
export function useParallaxAnimation<T extends HTMLElement = HTMLDivElement>(
  options: ParallaxOptions = {},
) {
  const {
    speed = 0.3,
    axis = 'y',
    disableOnMobile = true,
    scale = false,
    fade = false,
    rotate = false,
    rotateSpeed = 0.05,
  } = options;

  const ref = useRef<T>(null);
  const rafId = useRef<number>(0);
  const isEnabled = useRef(true);

  useEffect(() => {
    if (disableOnMobile && window.matchMedia('(max-width: 768px)').matches) {
      isEnabled.current = false;
      return;
    }
    isEnabled.current = true;

    const el = ref.current;
    if (!el) return;

    const update = () => {
      if (!isEnabled.current || !ref.current) return;
      const rect = el.getBoundingClientRect();
      const { innerHeight } = window;

      // Normalised progress: -1 (above viewport) → 0 (center) → 1 (below viewport)
      const progress = (innerHeight / 2 - (rect.top + rect.height / 2)) / innerHeight;

      const translateY = axis !== 'x' ? progress * speed * 100 : 0;
      const translateX = axis !== 'y' ? progress * speed * 100 : 0;
      const scaleVal = scale ? 1 + Math.abs(progress) * 0.08 : 1;
      const opacity = fade ? 1 - Math.abs(progress) * 0.6 : undefined;
      const rotateVal = rotate ? progress * rotateSpeed * 360 : 0;

      let transform = `translate(${translateX}px, ${translateY}px) scale(${scaleVal}) rotate(${rotateVal}deg)`;
      el.style.transform = transform;
      if (opacity !== undefined) el.style.opacity = String(Math.max(0, opacity));

      rafId.current = requestAnimationFrame(update);
    };

    rafId.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId.current);
    };
  }, [speed, axis, disableOnMobile, scale, fade, rotate, rotateSpeed]);

  return ref;
}

/**
 * useMouseParallax
 * Moves an element relative to the mouse position — creates a "depth" effect.
 *
 * @example
 *   const ref = useMouseParallax({ depth: 0.05 });
 *   return <div ref={ref}>Floating card</div>;
 */
export function useMouseParallax<T extends HTMLElement = HTMLDivElement>(
  options: { depth?: number; disableOnMobile?: boolean; containerRef?: React.RefObject<HTMLElement> } = {},
) {
  const { depth = 0.04, disableOnMobile = true } = options;
  const ref = useRef<T>(null);
  const rafId = useRef<number>(0);
  const mouse = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (disableOnMobile && window.matchMedia('(max-width: 768px)').matches) return;

    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouse.current.x = (e.clientX / innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / innerHeight - 0.5) * 2;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      current.current.x = lerp(current.current.x, mouse.current.x, 0.06);
      current.current.y = lerp(current.current.y, mouse.current.y, 0.06);

      const tx = current.current.x * depth * 100;
      const ty = current.current.y * depth * 100;
      el.style.transform = `translate(${tx}px, ${ty}px)`;
      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMove);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [depth, disableOnMobile]);

  return ref;
}

/**
 * useScrollVelocity
 * Returns the current scroll velocity for inertia-based animations.
 */
export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0);
  const prevScrollY = useRef(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      const current = window.scrollY;
      setVelocity(current - prevScrollY.current);
      prevScrollY.current = current;
      rafId.current = requestAnimationFrame(update);
    };

    rafId.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  return velocity;
}

/**
 * useParallaxLayers
 * Returns multiple refs for layered parallax effect (depth 3D simulation).
 */
export function useParallaxLayers(
  layers: number,
  baseSpeed = 0.1,
  disableOnMobile = true,
) {
  const refs = Array.from({ length: layers }, () => useRef<HTMLElement>(null));

  useEffect(() => {
    if (disableOnMobile && window.matchMedia('(max-width: 768px)').matches) return;

    let rafId: number;

    const mouse = { x: 0, y: 0 };
    const lerped = { x: 0, y: 0 };

    const handleMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      lerped.x = lerp(lerped.x, mouse.x, 0.05);
      lerped.y = lerp(lerped.y, mouse.y, 0.05);

      refs.forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        const layerDepth = baseSpeed * (i + 1);
        const tx = lerped.x * layerDepth * 40;
        const ty = lerped.y * layerDepth * 40;
        el.style.transform = `translate(${tx}px, ${ty}px)`;
      });

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(rafId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, baseSpeed, disableOnMobile]);

  return refs;
}
