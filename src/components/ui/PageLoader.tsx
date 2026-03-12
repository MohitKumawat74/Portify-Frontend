'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_NAME } from '@/utils/constants';

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);

  // Hide the loader after the animation completes
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2150);
    return () => clearTimeout(timer);
  }, []);

  // Animate the counter from 0 → 100 in sync with the progress bar (1.5 s, delayed 0.3 s)
  useEffect(() => {
    const steps = 100;
    const totalMs = 1500;
    const stepMs = totalMs / steps;
    const startDelay = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setCount(current);
        if (current >= 100) clearInterval(interval);
      }, stepMs);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(startDelay);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'var(--color-bg)' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97, filter: 'blur(14px)' }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Ambient glow blobs */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }}
          />
          <div
            className="pointer-events-none absolute left-1/3 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
            style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.14) 0%, transparent 70%)' }}
          />

          {/* Logo mark */}
          <motion.div
            className="relative mb-7 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.6, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Pulsing rings */}
            <motion.div
              className="absolute h-28 w-28 rounded-full border border-[var(--color-primary)]/25"
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0.08, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute h-20 w-20 rounded-full border border-[var(--color-secondary)]/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.05, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
            />
            {/* Logo image */}
            <div
              className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-2xl shadow-[0_0_60px_rgba(124,58,237,0.55)] overflow-hidden"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
            >
              <img src="/Portfolio.png" alt={APP_NAME} className="h-[56px] w-[56px] object-cover" />
            </div>
          </motion.div>

          {/* Brand name: letters animate in */}
          <div className="mb-8 flex overflow-hidden">
            {'Portify'.split('').map((char, i) => (
              <motion.span
                key={i}
                className="gradient-text inline-block text-[2.6rem] font-bold leading-none"
                initial={{ y: 48, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.42,
                  delay: 0.35 + i * 0.065,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* Progress track + live counter */}
          <div className="mb-2 flex items-center gap-3">
            <div className="relative h-[2px] w-44 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
              />
              {/* Shimmer overlay */}
              <motion.div
                className="absolute inset-y-0 w-12 rounded-full bg-white/30 blur-sm"
                animate={{ left: ['-20%', '110%'] }}
                transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
              />
            </div>
            {/* 0 → 100 live counter */}
            <motion.span
              className="w-10 text-right font-mono text-xs font-semibold tabular-nums"
              style={{ color: 'var(--color-primary)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {count}%
            </motion.span>
          </div>

          {/* Subtitle */}
          <motion.p
            className="mt-3 text-[0.68rem] uppercase tracking-[0.22em]"
            style={{ color: 'var(--color-text-muted)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            Crafting your portfolio experience…
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

