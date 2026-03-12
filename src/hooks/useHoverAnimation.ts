'use client';

import { useRef, useCallback, useEffect } from 'react';

interface HoverAnimationOptions {
  /** Scale on hover */
  scale?: number;
  /** Y-offset on hover (px) */
  liftY?: number;
  /** Glow color (CSS color string) */
  glowColor?: string;
  /** Glow spread (px) */
  glowSpread?: number;
  /** Transition duration (ms) */
  duration?: number;
  /** Whether to add a magnetic pull effect */
  magnetic?: boolean;
  /** Strength of magnetic pull 0-1 */
  magneticStrength?: number;
  /** Disable on mobile */
  disableOnMobile?: boolean;
}

/**
 * useHoverAnimation
 * Attaches smooth CSS-transition hover and optional magnetic cursor pull to an element.
 *
 * @example
 *   const { ref } = useHoverAnimation({ scale: 1.05, liftY: 4, glowColor: 'rgba(124,58,237,0.4)' });
 *   return <button ref={ref}>...</button>;
 */
export function useHoverAnimation<T extends HTMLElement = HTMLDivElement>(
  options: HoverAnimationOptions = {},
) {
  const {
    scale = 1.03,
    liftY = 0,
    glowColor,
    glowSpread = 30,
    duration = 250,
    magnetic = false,
    magneticStrength = 0.3,
    disableOnMobile = true,
  } = options;

  const ref = useRef<T>(null);
  const originalTransform = useRef('');
  const originalShadow = useRef('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isMobile = disableOnMobile && window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return;

    el.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow ${duration}ms ease`;
    originalTransform.current = el.style.transform;
    originalShadow.current = el.style.boxShadow;

    const handleEnter = () => {
      el.style.transform = `scale(${scale}) translateY(-${liftY}px)`;
      if (glowColor) {
        el.style.boxShadow = `0 0 ${glowSpread}px ${glowColor}`;
      }
    };

    const handleLeave = () => {
      el.style.transform = originalTransform.current;
      el.style.boxShadow = originalShadow.current;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!magnetic) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * magneticStrength;
      const deltaY = (e.clientY - centerY) * magneticStrength;
      el.style.transform = `scale(${scale}) translate(${deltaX}px, ${deltaY}px) translateY(-${liftY}px)`;
    };

    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mouseleave', handleLeave);
    if (magnetic) el.addEventListener('mousemove', handleMouseMove);

    return () => {
      el.removeEventListener('mouseenter', handleEnter);
      el.removeEventListener('mouseleave', handleLeave);
      if (magnetic) el.removeEventListener('mousemove', handleMouseMove);
    };
  }, [scale, liftY, glowColor, glowSpread, duration, magnetic, magneticStrength, disableOnMobile]);

  return { ref };
}

/**
 * useMagneticEffect
 * Pure magnetic cursor-pull effect for buttons/icons.
 *
 * @example
 *   const ref = useMagneticEffect({ strength: 0.4 });
 *   return <button ref={ref}>...</button>;
 */
export function useMagneticEffect<T extends HTMLElement = HTMLButtonElement>(
  options: { strength?: number; disableOnMobile?: boolean } = {},
) {
  const { strength = 0.35, disableOnMobile = true } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isMobile = disableOnMobile && window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return;

    el.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };

    const handleLeave = () => {
      el.style.transform = 'translate(0,0)';
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [strength, disableOnMobile]);

  return ref;
}

/**
 * useCursorGlow
 * Creates a glowing cursor-follower effect on a container.
 */
export function useCursorGlow<T extends HTMLElement = HTMLDivElement>(
  color = 'rgba(124,58,237,0.15)',
  size = 400,
) {
  const ref = useRef<T>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  const cleanup = useCallback(() => {
    glowRef.current?.remove();
    glowRef.current = null;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const glow = document.createElement('div');
    glow.style.cssText = `
      position: absolute;
      pointer-events: none;
      border-radius: 50%;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, ${color} 0%, transparent 70%);
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 0;
    `;
    el.style.overflow = 'hidden';
    el.style.position = el.style.position || 'relative';
    el.appendChild(glow);
    glowRef.current = glow;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      glow.style.left = `${e.clientX - rect.left}px`;
      glow.style.top = `${e.clientY - rect.top}px`;
      glow.style.opacity = '1';
    };

    const handleLeave = () => {
      glow.style.opacity = '0';
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      cleanup();
    };
  }, [color, size, cleanup]);

  return ref;
}
