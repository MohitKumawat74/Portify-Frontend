'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const controls = useAnimation();

  useEffect(() => {
    // subtle float animation for the hero number
    controls.start({ y: [0, -6, 0], transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } });
  }, [controls]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#071027] to-[#071225] flex items-center justify-center p-6">
      <div className="relative w-full max-w-5xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/90 backdrop-blur-md p-10 text-left shadow-[0_12px_60px_rgba(2,6,23,0.6)]">
        {/* floating accents */}
        <motion.div
          aria-hidden
          animate={{ x: [-30, 30, -30], y: [-10, 10, -10] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-pink-500 to-amber-400 opacity-12 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ x: [20, -20, 20], y: [0, -18, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
          className="pointer-events-none absolute -left-12 -bottom-8 h-40 w-40 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 opacity-10 blur-3xl"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <motion.h1
              className="text-7xl font-extrabold tracking-tight text-[var(--color-text)]"
              animate={controls}
            >
              404
            </motion.h1>

            <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text)]">Page not found</h2>
            <p className="mt-4 text-[15px] text-[var(--color-text-muted)] max-w-xl">
              Looks like the page you're looking for doesn't exist — it may have been moved or removed. Try one
              of the quick actions below or search for content.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/">
                <Button size="md" className="gap-2">
                  Home
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="ghost" size="md" className="gap-2">
                  Browse Templates
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="md" className="gap-2">
                  Contact Support
                </Button>
              </Link>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-xs font-medium text-[var(--color-text-muted)]">Quick search</label>
              <div className="flex gap-2">
                <input
                  aria-label="Search site"
                  placeholder="Search templates, users, portfolios…"
                  className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />
                <Button size="sm">Search</Button>
              </div>
            </div>

            <p className="mt-6 text-xs text-[var(--color-text-muted)]">Tip: Press <span className="rounded bg-white/3 px-2 py-0.5 text-[var(--color-text)]">/</span> to focus search.</p>
          </div>

          {/* Illustration / helpful links */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
            <div className="flex items-start gap-4">
              <div className="h-28 w-28 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
                <span>?</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[var(--color-text)]">Need help finding something?</h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Here are some places you might want to try.</p>

                <ul className="mt-4 grid gap-3">
                  <li className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text)]">Templates</div>
                      <div className="text-xs text-[var(--color-text-muted)]">Browse built-in templates</div>
                    </div>
                    <Link href="/templates">
                      <Button variant="ghost" size="sm">Open</Button>
                    </Link>
                  </li>

                  <li className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text)]">Dashboard</div>
                      <div className="text-xs text-[var(--color-text-muted)]">Go to your dashboard</div>
                    </div>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm">Open</Button>
                    </Link>
                  </li>

                  <li className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text)]">Contact</div>
                      <div className="text-xs text-[var(--color-text-muted)]">Report this issue</div>
                    </div>
                    <Link href="/contact">
                      <Button variant="ghost" size="sm">Contact</Button>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--color-text-muted)]">If you believe this is an error, please <Link href="/contact" className="text-[var(--color-primary)]">contact support</Link>.</p>
      </div>
    </main>
  );
}
