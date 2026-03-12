'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ExternalLink } from 'lucide-react';
import { ROUTES } from '@/utils/constants';

// ── CSS-art template previews ─────────────────────────────────────────────────
function MockMinimal() {
  return (
    <div className="h-full bg-slate-950 p-3">
      <div className="flex gap-2.5 h-full">
        <div className="w-14 rounded-xl bg-slate-800/80 flex flex-col items-center gap-3 py-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700" />
          {[36, 28, 32, 24].map((w, i) => <div key={i} className="h-1.5 rounded-full bg-white/15" style={{ width: w }} />)}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-20 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-white/[0.08] flex items-center px-3">
            <div className="space-y-1.5">
              <div className="h-2.5 w-24 rounded-full bg-white/75" />
              <div className="h-1.5 w-16 rounded-full bg-white/35" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {[1,2,3,4].map(i => <div key={i} className="rounded-xl bg-slate-800/50 border border-white/[0.05]" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
function MockCreative() {
  return (
    <div className="h-full bg-gradient-to-br from-violet-950 to-slate-900 p-3">
      <div className="h-24 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 mb-2 flex items-end p-3">
        <div><div className="h-2.5 w-28 rounded-full bg-white/90 mb-1" /><div className="h-1.5 w-18 rounded-full bg-white/55" /></div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-white/[0.07] border border-white/[0.1]" />)}
      </div>
      <div className="h-7 rounded-lg bg-violet-600/25 border border-violet-500/25" />
    </div>
  );
}
function MockDeveloper() {
  return (
    <div className="h-full bg-gray-950 p-3 font-mono">
      <div className="bg-gray-900 rounded-xl mb-2 p-2.5">
        <div className="flex gap-1.5 mb-2">
          {['bg-red-400/80','bg-yellow-400/80','bg-green-400/80'].map((c,i) => <div key={i} className={`w-2 h-2 rounded-full ${c}`} />)}
        </div>
        {['w-full','w-3/4','w-1/2','w-2/3'].map((w,i) => <div key={i} className={`h-1.5 rounded-full mb-1 ${['bg-emerald-400/50','bg-cyan-400/40','bg-violet-400/50','bg-yellow-400/40'][i]} ${w}`} />)}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{l:'Projects',c:'text-violet-400',v:'12'},{l:'Stars',c:'text-yellow-400',v:'847'},{l:'Repos',c:'text-cyan-400',v:'34'}].map(s => (
          <div key={s.l} className="bg-gray-900/70 rounded-xl p-2 text-center border border-white/[0.06]">
            <div className={`text-sm font-bold ${s.c}`}>{s.v}</div>
            <div className="text-[8px] text-white/35">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function MockAgency() {
  return (
    <div className="h-full bg-black p-3">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="h-2 w-16 rounded-full bg-white/70" />
        <div className="flex gap-2">{[1,2,3].map(i => <div key={i} className="h-1.5 w-10 rounded-full bg-white/25" />)}</div>
      </div>
      <div className="relative h-24 rounded-xl overflow-hidden mb-2 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="absolute inset-0 flex flex-col justify-center px-4">
          <div className="h-3 w-32 rounded-full bg-white/90 mb-1.5" />
          <div className="h-2 w-20 rounded-full bg-white/55" />
        </div>
      </div>
      <div className="flex gap-2">
        {[1,2,3,4,5].map(i => <div key={i} className="h-10 flex-1 rounded-lg bg-white/[0.06] border border-white/[0.08]" />)}
      </div>
    </div>
  );
}
function MockPhotographer() {
  return (
    <div className="h-full bg-stone-950 p-2">
      <div className="grid grid-cols-3 gap-1.5 h-full">
        <div className="col-span-2 rounded-xl bg-gradient-to-br from-stone-700 to-stone-800 border border-white/[0.07] flex items-end p-2">
          <div className="h-2 w-16 rounded-full bg-white/80" />
        </div>
        <div className="flex flex-col gap-1.5">
          {['from-stone-600 to-stone-700','from-stone-700 to-stone-800','from-amber-900/50 to-stone-800'].map((g,i) => (
            <div key={i} className={`flex-1 rounded-xl bg-gradient-to-br ${g} border border-white/[0.07]`} />
          ))}
        </div>
        <div className="rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 border border-white/[0.07]" />
        <div className="col-span-2 rounded-xl bg-gradient-to-r from-stone-700 to-amber-900/40 border border-white/[0.07]" />
      </div>
    </div>
  );
}
function MockSaaS() {
  return (
    <div className="h-full bg-slate-900 p-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-500" />
        <div className="h-1.5 w-16 rounded-full bg-white/40" />
        <div className="ml-auto flex gap-1.5">{[1,2].map(i => <div key={i} className="h-5 w-12 rounded bg-white/10" />)}</div>
      </div>
      <div className="h-16 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-white/[0.07] mb-2 flex items-center px-3 gap-3">
        <div className="space-y-1"><div className="h-2 w-20 rounded-full bg-white/70" /><div className="h-1.5 w-14 rounded-full bg-white/35" /></div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-slate-800 border border-white/[0.06]" />)}
      </div>
    </div>
  );
}

const ALL_TEMPLATES = [
  { name: 'Minimal Pro', category: 'Minimal', tag: 'Popular', Mock: MockMinimal, colors: 'Violet & Slate' },
  { name: 'Creative Portfolio', category: 'Creative', tag: 'New', Mock: MockCreative, colors: 'Violet & Cyan' },
  { name: 'Developer Hub', category: 'Developer', tag: 'Featured', Mock: MockDeveloper, colors: 'Emerald & Cyan' },
  { name: 'Agency Bold', category: 'Agency', tag: 'Premium', Mock: MockAgency, colors: 'Amber & Black' },
  { name: 'Photographer', category: 'Photographer', tag: 'New', Mock: MockPhotographer, colors: 'Stone & Warm' },
  { name: 'SaaS Founder', category: 'SaaS', tag: 'Popular', Mock: MockSaaS, colors: 'Blue & Cyan' },
];

const CATEGORIES = ['All', 'Minimal', 'Creative', 'Developer', 'Agency', 'Photographer', 'SaaS'];

const TAG_COLORS: Record<string, string> = {
  Popular: 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/30',
  New: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Featured: 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border-[var(--color-secondary)]/30',
  Premium: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30',
};

export default function TemplatesPage() {
  const [selected, setSelected] = useState('All');
  const filtered = selected === 'All' ? ALL_TEMPLATES : ALL_TEMPLATES.filter(t => t.category === selected);

  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28">
        {/* Hero */}
        <section className="relative overflow-hidden pb-14 pt-10 text-center sm:pb-16 sm:pt-14 md:pb-20">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[var(--color-secondary)] opacity-[0.06] blur-[120px]" />
          <div className="pointer-events-none absolute top-10 left-1/4 h-[300px] w-[300px] rounded-full bg-[var(--color-primary)] opacity-[0.04] blur-[80px]" />
          <Container maxWidth="md" className="relative z-10">
            <motion.span
              className="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Templates
            </motion.span>
            <motion.h1
              className="font-space-grotesk mb-6 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              50+ premium templates,{' '}
              <span className="gradient-text">built to impress</span>
            </motion.h1>
            <motion.p
              className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)] sm:mb-10 sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Every template is designed by professionals, works perfectly on all devices,
              and ships with multiple colour themes.
            </motion.p>
          </Container>
        </section>

        {/* Category filter strip */}
        <div className="sticky top-16 z-40 border-b border-white/[0.06] bg-[var(--color-bg)]/90 backdrop-blur-xl sm:top-[70px]">
          <Container>
            <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelected(cat)}
                  className={`relative flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                    selected === cat
                      ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                      : 'border-white/10 text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/30 hover:text-white'
                  }`}
                >
                  {cat}
                  {selected === cat && (
                    <motion.span
                      layoutId="cat-pill"
                      className="absolute inset-0 rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </Container>
        </div>

        {/* Grid */}
        <section className="pb-20 pt-12 sm:pb-24 sm:pt-16 md:pb-28">
          <Container>
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {filtered.map((t, i) => (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-all duration-300 hover:-translate-y-2 hover:border-[var(--color-primary)]/40 hover:shadow-2xl hover:shadow-[var(--color-primary)]/12"
                  >
                    <div className="h-44 overflow-hidden border-b border-white/[0.06] sm:h-48">
                      <t.Mock />
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-white sm:text-base">{t.name}</h3>
                          <p className="text-xs text-[var(--color-text-muted)]">{t.category} · {t.colors}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${TAG_COLORS[t.tag] ?? 'bg-white/10 text-white/60'}`}>
                          {t.tag}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Preview
                        </Button>
                        <Link href={ROUTES.REGISTER} className="flex-1">
                          <Button variant="glow" size="sm" className="w-full text-xs">Use this</Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* "More coming" placeholder cards — only show on All */}
                {selected === 'All' && Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={`placeholder-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: (filtered.length + i) * 0.08 }}
                    className="flex h-52 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-center sm:h-64"
                  >
                    <div className="h-10 w-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center">
                      <span className="text-lg text-white/20">+</span>
                    </div>
                    <p className="text-xs text-white/25">More coming soon</p>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
