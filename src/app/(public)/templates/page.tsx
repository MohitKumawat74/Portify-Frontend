'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Eye, Search, Lock, Crown } from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import { templateService } from '@/services/templateService';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import type { Template } from '@/types';
import { UpgradeModal } from '@/components/dashboard/UpgradeModal';
import { isTemplateLockedForPlan } from '@/utils/plan';

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

const MOCK_BY_KEY = {
  template1: MockMinimal,
  template2: MockCreative,
  template3: MockDeveloper,
  template4: MockDeveloper,
} as const;

const TAG_COLORS: Record<string, string> = {
  Popular: 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/30',
  New: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Featured: 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border-[var(--color-secondary)]/30',
  Premium: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30',
};

export default function TemplatesPage() {
  const { isAuthenticated, planId } = useAuthStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('All');
  const [search, setSearch] = useState('');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    templateService
      .getAll(1, 100)
      .then((res) => {
        setTemplates((res.data ?? []).filter((t) => t.isActive));
      })
      .catch(() => {
        toast.error('Failed to load templates.');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(templates.map((t) => (t.category || 'Other').trim()))).filter(Boolean);
    return ['All', ...unique.map((c) => c.charAt(0).toUpperCase() + c.slice(1))];
  }, [templates]);

  const filtered = useMemo(() => {
    const byCategory = selected === 'All'
      ? templates
      : templates.filter((t) => (t.category || '').toLowerCase() === selected.toLowerCase());

    const query = search.trim().toLowerCase();
    if (!query) return byCategory;
    return byCategory.filter((t) =>
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      (t.category || '').toLowerCase().includes(query),
    );
  }, [templates, selected, search]);

  function resolveTemplatePreviewKey(template: Template): 'template1' | 'template2' | 'template3' | 'template4' {
    const id = template.id.toLowerCase();
    const name = template.name.toLowerCase();
    const category = (template.category || '').toLowerCase();

    if (id === 'template1' || id === 'template2' || id === 'template3' || id === 'template4') {
      return id;
    }
    if (/3d|immersive|interactive/.test(name) || /3d|immersive|interactive/.test(category)) {
      return 'template4';
    }
    if (/creative|agency|photographer|saas/.test(name) || /creative|agency|photographer|saas/.test(category)) {
      return 'template2';
    }
    if (/professional|classic|corporate/.test(name) || /professional|corporate/.test(category)) {
      return 'template3';
    }
    return 'template1';
  }

  function getTag(template: Template): string {
    if (template.isPremium) return 'Premium';
    return 'Popular';
  }

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

            <div className="mx-auto max-w-md">
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)]/60 focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* Category filter strip */}
        <div className="sticky top-16 z-40 border-b border-white/[0.06] bg-[var(--color-bg)]/90 backdrop-blur-xl sm:top-[70px]">
          <Container>
            <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
              {categories.map((cat) => (
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
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={`loading-${i}`}
                      className="h-[270px] animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.02]"
                    />
                  ))
                  : filtered.map((t, i) => {
                    const previewKey = resolveTemplatePreviewKey(t);
                    const Mock = MOCK_BY_KEY[previewKey];
                    const tag = getTag(t);
                    const previewHref = `/preview/${previewKey}?source=${encodeURIComponent(t.id)}`;
                    const isLocked = isTemplateLockedForPlan(t.id, t.isPremium, planId);
                    const useHref = isAuthenticated
                      ? `${ROUTES.CREATE_PORTFOLIO}?template=${encodeURIComponent(t.id)}`
                      : ROUTES.LOGIN;

                    return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-all duration-300 hover:-translate-y-2 hover:border-[var(--color-primary)]/40 hover:shadow-2xl hover:shadow-[var(--color-primary)]/12"
                  >
                    {isLocked ? (
                      <button
                        type="button"
                        onClick={() => setUpgradeOpen(true)}
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/45 backdrop-blur-[2px]"
                        aria-label="Upgrade to unlock premium template"
                      >
                        <span className="rounded-full bg-amber-500/25 p-2.5 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                          <Lock size={16} />
                        </span>
                        <span className="rounded-full border border-amber-400/30 bg-amber-500/20 px-2.5 py-1 text-[10px] font-semibold text-amber-200">
                          Unlock with Pro
                        </span>
                      </button>
                    ) : null}

                    <div className="h-44 overflow-hidden border-b border-white/[0.06] sm:h-48">
                      {t.previewImage || t.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.previewImage || t.thumbnail} alt={`${t.name} preview`} className="h-full w-full object-cover" />
                      ) : (
                        <Mock />
                      )}
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-white sm:text-base">{t.name}</h3>
                          <p className="text-xs text-[var(--color-text-muted)]">{(t.category || 'Template').charAt(0).toUpperCase() + (t.category || 'template').slice(1)}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${TAG_COLORS[tag] ?? 'bg-white/10 text-white/60'}`}>
                          {t.isPremium ? <span className="inline-flex items-center gap-1"><Crown size={11} /> Pro</span> : tag}
                        </span>
                      </div>
                      <p className="mb-3 min-h-[36px] text-xs text-[var(--color-text-muted)] line-clamp-2">
                        {t.description || 'A modern portfolio template with production-ready sections.'}
                      </p>
                      <div className="flex gap-3">
                        <Link href={previewHref} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview
                          </Button>
                        </Link>
                        <Link href={isLocked ? '#' : useHref} className="flex-1" onClick={(e) => {
                          if (isLocked) {
                            e.preventDefault();
                            setUpgradeOpen(true);
                          }
                        }}>
                          <Button variant="glow" size="sm" className="w-full text-xs" disabled={isLocked}>
                            Use this
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
                })}

                {/* "More coming" placeholder cards — only show on All */}
                {!loading && selected === 'All' && filtered.length > 0 && Array.from({ length: 1 }).map((_, i) => (
                  <motion.div
                    key={`placeholder-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: (filtered.length + i) * 0.08 }}
                    className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-center "
                  >
                    <div className="h-10 w-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center">
                      <span className="text-lg text-white/20">+</span>
                    </div>
                    <p className="text-xs text-white/25">More coming soon</p>
                  </motion.div>
                ))}

                {!loading && filtered.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
                    <p className="text-sm font-medium text-white">No templates found</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">Try changing category or search keywords.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Container>
        </section>
      </main>
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} redirectOnSuccess={false} />
      <Footer />
    </>
  );
}
