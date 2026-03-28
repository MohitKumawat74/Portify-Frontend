'use client';

import { motion } from 'framer-motion';
import { Rocket, Wrench, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';

const RELEASES = [
  {
    version: 'v2.8.0',
    date: 'March 2026',
    type: 'Major',
    title: 'Template performance pass and smoother editor interactions',
    notes: [
      'Reduced initial template render cost for large project sections.',
      'Added staggered animation controls to improve perceived smoothness.',
      'Improved dashboard table readability and keyboard focus states.',
    ],
  },
  {
    version: 'v2.7.2',
    date: 'February 2026',
    type: 'Patch',
    title: 'Stability, fixes, and polish',
    notes: [
      'Fixed edge cases around social-login session hydration.',
      'Resolved intermittent publish-state sync issues on slow networks.',
      'Improved empty states in portfolio analytics views.',
    ],
  },
  {
    version: 'v2.7.0',
    date: 'January 2026',
    type: 'Feature',
    title: 'New skill modules and expanded portfolio sections',
    notes: [
      'Added richer skill groups with custom labels and descriptions.',
      'Shipped updated timeline and project card variants for templates.',
      'Improved theme token consistency across dark and tinted surfaces.',
    ],
  },
  {
    version: 'v2.6.4',
    date: 'December 2025',
    type: 'Patch',
    title: 'Accessibility improvements',
    notes: [
      'Improved contrast in muted text and action buttons.',
      'Added clearer focus rings for keyboard navigation.',
      'Refined semantic heading order in key marketing pages.',
    ],
  },
];

const TYPE_STYLE: Record<string, string> = {
  Major: 'text-purple-300 bg-purple-500/15 border-purple-400/30',
  Feature: 'text-cyan-300 bg-cyan-500/15 border-cyan-400/30',
  Patch: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30',
};

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Major: Rocket,
  Feature: Sparkles,
  Patch: Wrench,
};

export default function ChangelogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20 sm:pb-24 md:pb-28">
        <section className="relative overflow-hidden pb-12 pt-10 sm:pb-14 sm:pt-14 text-center">
          <div className="pointer-events-none absolute -top-36 left-1/2 h-125 w-125 -translate-x-1/2 rounded-full bg-(--color-accent) opacity-[0.06] blur-[120px]" />
          <Container maxWidth="md" className="relative z-10">
            <motion.span
              className="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.22em] text-(--color-accent)"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              Changelog
            </motion.span>
            <motion.h1
              className="font-space-grotesk mb-5 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              Product updates, <span className="gradient-text">shipped continuously</span>
            </motion.h1>
            <motion.p
              className="mx-auto text-base leading-relaxed text-(--color-text-muted) sm:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14 }}
            >
              Track improvements, fixes, and releases as we iterate on Portify every month.
            </motion.p>
          </Container>
        </section>

        <section>
          <Container maxWidth="lg">
            <div className="relative space-y-5">
              <div className="absolute left-4.5 top-0 h-full w-px bg-linear-to-b from-(--color-primary) via-(--color-secondary) to-transparent" />
              {RELEASES.map((release, i) => {
                const Icon = TYPE_ICON[release.type] ?? Sparkles;
                return (
                  <motion.article
                    key={release.version}
                    className="relative rounded-2xl border border-white/8 bg-white/2 p-5 pl-12 sm:p-7 sm:pl-14"
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.48, delay: i * 0.07 }}
                  >
                    <div className="absolute left-3.25 top-8 z-10 h-3 w-3 rounded-full bg-(--color-primary) ring-4 ring-background" />
                    <div className="mb-4 flex flex-wrap items-center gap-2.5">
                      <span className="text-sm font-bold text-white">{release.version}</span>
                      <span className="text-xs text-(--color-text-muted)">{release.date}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${TYPE_STYLE[release.type]}`}>
                        <Icon className="h-3 w-3" /> {release.type}
                      </span>
                    </div>
                    <h2 className="mb-3 text-lg font-bold text-white">{release.title}</h2>
                    <ul className="space-y-2 text-sm text-(--color-text-muted)">
                      {release.notes.map((note) => (
                        <li key={note} className="leading-relaxed">• {note}</li>
                      ))}
                    </ul>
                  </motion.article>
                );
              })}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
