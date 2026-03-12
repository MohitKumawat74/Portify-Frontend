'use client';

import { useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import type { ReactNode, ComponentPropsWithoutRef } from 'react';

interface MagneticButtonProps extends ComponentPropsWithoutRef<'button'> {
  children: ReactNode;
  /** Strength of the magnetic pull (0 – 1). Default 0.4 */
  strength?: number;
  /** Radius in px beyond which the effect is ignored. Default 120 */
  radius?: number;
  /** Whether to animate a glow ring on hover */
  glowColor?: string;
  /** Extra className applied to the outer wrapper */
  wrapperClassName?: string;
  /** Disable the effect on small screens */
  disableOnMobile?: boolean;
}

/**
 * MagneticButton
 *
 * A button that follows the cursor when hovered nearby, simulating
 * a magnetic attraction effect using Framer Motion springs.
 *
 * @example
 *   <MagneticButton className="px-6 py-3 rounded-full bg-purple-600">
 *     Get Started
 *   </MagneticButton>
 */
export function MagneticButton({
  children,
  strength = 0.4,
  radius = 120,
  glowColor = 'rgba(124,58,237,0.45)',
  wrapperClassName = '',
  disableOnMobile = true,
  className = '',
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const scale = useTransform(x, [-radius, 0, radius], [0.97, 1, 0.97]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disableOnMobile && typeof window !== 'undefined' && window.innerWidth < 768) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);

    if (dist < radius) {
      x.set(dx * strength);
      y.set(dy * strength);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <div className={`relative inline-flex ${wrapperClassName}`}>
      {/* Glow ring */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        animate={isHovered ? { opacity: 1, scale: 1.2 } : { opacity: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          boxShadow: `0 0 32px 8px ${glowColor}`,
          borderRadius: 'inherit',
        }}
      />

      <motion.button
        ref={ref}
        style={{ x, y, scale }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileTap={{ scale: 0.95 }}
        className={className}
        {...(rest as ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {children}
      </motion.button>
    </div>
  );
}
