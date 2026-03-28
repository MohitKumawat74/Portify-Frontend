'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_NAME } from '@/utils/constants';

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const brand = useMemo(() => APP_NAME.split(''), []);

  useEffect(() => {
    if (!visible) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    const lenis = (window as Window & {
      __lenis?: { stop: () => void; start: () => void };
    }).__lenis;
    lenis?.stop();

    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      lenis?.start();
    };

    const duration = reducedMotion ? 250 : 1400;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const raw = Math.min(1, elapsed / duration);
      const pct = Math.min(100, Math.round(easeOutCubic(raw) * 100));
      setProgress(pct);

      if (raw < 1) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      setTimeout(() => {
        setVisible(false);
        unlock();
      }, 140);
    };

    rafId = window.requestAnimationFrame(tick);

    const fallback = window.setTimeout(() => {
      setProgress(100);
      window.cancelAnimationFrame(rafId);
      setVisible(false);
      unlock();
    }, 3000);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(fallback);
      unlock();
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[var(--color-bg)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.36 }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center rounded-lg bg-white/5 p-3">
              <Image src="/Portfolio.png" alt={APP_NAME} width={48} height={48} priority className="h-12 w-12 object-cover" />
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xl font-bold">{brand.join('')}</div>
            </div>

            <div className="mt-2 w-64">
              <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/8">
                <motion.div
                  className="pointer-events-none absolute inset-y-0 -left-20 w-20 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  animate={{ x: [0, 360] }}
                  transition={{ duration: 1.15, repeat: Infinity, ease: 'linear' }}
                />
                <div
                  style={{ width: `${progress}%` }}
                  className="relative h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] via-cyan-300 to-[var(--color-secondary)] shadow-[0_0_14px_rgba(56,189,248,0.42)] transition-all duration-100"
                />
              </div>
              <div className="mt-2 text-right text-xs font-mono font-semibold" style={{ color: 'var(--color-primary)' }}>
                {progress}%
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

