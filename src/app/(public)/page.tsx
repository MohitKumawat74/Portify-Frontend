'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Suspense, useEffect, useState } from 'react';
import {
  ArrowRight, Zap, Palette, Globe, Code2, Layers, Sparkles,
  Star, CheckCircle, Play, ExternalLink, ChevronDown,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { SkeletonBox } from '@/components/ui/Loader';
import { CountUp } from '@/components/ui/CountUp';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { AnimatedSection, StaggerContainer, staggerItem } from '@/components/motion/AnimatedSection';
import { SplitText, RevealText, GradientText } from '@/components/motion/TextReveal';
import { MagneticButton } from '@/components/motion/MagneticButton';
import StackingCards from '@/components/motion/StackingCards';
import { PageLoader } from '@/components/ui/PageLoader';
import { ROUTES } from '@/utils/constants';

// Lazy-loaded heavy components
const HeroScene = dynamic(
  () => import('@/components/3d/HeroScene').then((m) => ({ default: m.HeroScene })),
  { ssr: false, loading: () => <SkeletonBox className="h-full w-full rounded-3xl" /> },
);
const SkillsScene = dynamic(
  () => import('@/components/3d/SkillsScene').then((m) => ({ default: m.SkillsScene })),
  { ssr: false, loading: () => <SkeletonBox className="h-full w-full rounded-2xl" /> },
);
const ParticlesBackground = dynamic(
  () => import('@/components/effects/ParticlesBackground').then((m) => ({ default: m.ParticlesBackground })),
  { ssr: false },
);

// DATA
const FEATURES = [
  { title: 'Beautiful Templates', desc: 'Professionally designed templates that make your work stand out from the very first look.', icon: Palette, gradient: 'from-violet-500 to-purple-600' },
  { title: 'Deep Customisation', desc: 'Tweak every colour, font, and layout element to perfectly match your personal brand.', icon: Sparkles, gradient: 'from-cyan-500 to-blue-600' },
  { title: 'Instant Publishing', desc: 'Ship your portfolio in one click with your own custom slug URL — no config needed.', icon: Globe, gradient: 'from-emerald-500 to-teal-600' },
  { title: 'Project Showcase', desc: 'Highlight your work with rich project cards featuring live previews and repo links.', icon: Code2, gradient: 'from-orange-500 to-red-600' },
  { title: '3D Skill Graphs', desc: 'Interactive 3D visualisations show your tech stack in a way recruiters never forget.', icon: Layers, gradient: 'from-pink-500 to-rose-600' },
  { title: 'Blazing Fast', desc: 'Static Next.js pages load in under 200ms on every device, every time.', icon: Zap, gradient: 'from-yellow-500 to-amber-600' },
];

const STATS = [
  { num: 10000, prefix: '', suffix: '+', label: 'Portfolios Created' },
  { num: 98, prefix: '', suffix: '%', label: 'Employment Rate' },
  { num: 50, prefix: '', suffix: '+', label: 'Premium Templates' },
  { num: 2, prefix: '<', suffix: 'min', label: 'Average Setup' },
];

const STEPS = [
  { num: '01', icon: Palette, title: 'Choose a Template', desc: 'Browse 50+ professionally designed templates and pick the one that fits your style.' },
  { num: '02', icon: Code2, title: 'Add Your Content', desc: 'Drop in your projects, skills, experience and bio — we handle all the formatting.' },
  { num: '03', icon: Globe, title: 'Publish & Share', desc: 'Hit publish and your live portfolio URL is broadcast-ready in seconds.' },
];

const TESTIMONIALS = [
  {
    initials: 'SC', color: '#7C3AED', name: 'Sarah Chen',
    role: 'Frontend Engineer @ Vercel', stars: 5,
    text: 'Portify helped me land my dream role. Recruiters always comment on how impressive the portfolio looks — the 3D templates are unlike anything else out there.',
  },
  {
    initials: 'MW', color: '#0EA5E9', name: 'Marcus Williams',
    role: 'Full-Stack Dev @ Stripe', stars: 5,
    text: 'I set up my entire portfolio in under 90 seconds. Clean templates, deep customisation options, and it looks stunning on every device. Could not ask for more.',
  },
  {
    initials: 'PP', color: '#F59E0B', name: 'Priya Patel',
    role: 'Software Engineer @ Google', stars: 5,
    text: 'The animations, the design, the performance — all top tier. My portfolio gets compliments from senior engineers and hiring managers alike every week.',
  },
];

const TECH_LABELS = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'GraphQL', 'Docker', 'AWS', 'MongoDB', 'Tailwind CSS', 'Figma', 'PostgreSQL', 'Redis', 'Kubernetes'];

// Template preview mockups
function MockMinimal() {
  return (
    <div className="h-full bg-slate-950 p-3 sm:p-4">
      <div className="flex gap-2.5 sm:gap-3 h-full">
        <div className="w-12 sm:w-14 bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 py-4">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700" />
          {[40, 32, 36, 28].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-white/15" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-2.5">
          <div className="h-20 sm:h-24 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-white/[0.08] flex items-center px-3 sm:px-4">
            <div className="space-y-1.5">
              <div className="h-2 sm:h-3 w-20 sm:w-28 rounded-full bg-white/75" />
              <div className="h-1.5 sm:h-2 w-16 sm:w-20 rounded-full bg-white/35" />
              <div className="flex gap-1.5 mt-1 sm:mt-2">
                <div className="h-3 sm:h-4 w-10 sm:w-12 rounded-full bg-violet-600/70" />
                <div className="h-3 sm:h-4 w-10 sm:w-12 rounded-full border border-white/20" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl bg-slate-800/50 border border-white/[0.05]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MockCreative() {
  return (
    <div className="h-full bg-gradient-to-br from-violet-950 to-slate-900 p-3 sm:p-4">
      <div className="h-24 sm:h-28 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 mb-2.5 flex items-end p-3">
        <div>
          <div className="h-2 sm:h-3 w-24 sm:w-32 rounded-full bg-white/90 mb-1.5" />
          <div className="h-1.5 sm:h-2 w-16 sm:w-20 rounded-full bg-white/55" />
          <div className="flex gap-1.5 mt-1 sm:mt-2">
            <div className="h-3 sm:h-4 w-12 sm:w-14 rounded-full bg-white/30 backdrop-blur-sm" />
            <div className="h-3 sm:h-4 w-8 sm:w-10 rounded-full bg-white/15" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 sm:h-14 rounded-xl bg-white/[0.07] border border-white/[0.1]" />
        ))}
      </div>
      <div className="flex gap-2">
        <div className="h-6 sm:h-7 flex-1 rounded-lg bg-violet-600/25 border border-violet-500/25" />
        <div className="h-6 sm:h-7 w-16 sm:w-20 rounded-lg bg-white/[0.08]" />
      </div>
    </div>
  );
}

function MockDeveloper() {
  return (
    <div className="h-full bg-gray-950 p-3 sm:p-4 font-mono">
      <div className="bg-gray-900 rounded-xl mb-2.5 p-2 sm:p-3">
        <div className="flex gap-1.5 mb-2">
          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-400/80" />
          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-yellow-400/80" />
          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-green-400/80" />
          <div className="ml-2 h-1.5 w-16 sm:w-24 rounded-full bg-white/15" />
        </div>
        {['bg-emerald-400/50 w-full', 'bg-cyan-400/40 w-3/4', 'bg-violet-400/50 w-1/2', 'bg-yellow-400/40 w-2/3', 'bg-pink-400/40 w-5/6'].map((c, i) => (
          <div key={i} className={`h-1 sm:h-1.5 rounded-full mb-1 ${c}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {[{ l: 'Projects', c: 'text-violet-400', v: '12' }, { l: 'Stars', c: 'text-yellow-400', v: '847' }, { l: 'Repos', c: 'text-cyan-400', v: '34' }].map(s => (
          <div key={s.l} className="bg-gray-900/70 rounded-xl p-1.5 sm:p-2 text-center border border-white/[0.06]">
            <div className={`text-xs sm:text-sm font-extrabold ${s.c}`}>{s.v}</div>
            <div className="text-[6px] sm:text-[8px] text-white/35 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TEMPLATES = [
  { name: 'Minimal Pro', category: 'Minimal', tag: 'Popular', Mock: MockMinimal },
  { name: 'Creative Portfolio', category: 'Creative', tag: 'New', Mock: MockCreative },
  { name: 'Developer Hub', category: 'Developer', tag: 'Featured', Mock: MockDeveloper },
];

// Reusable section header
function SectionHeader({
  label, title, subtitle, centered = false, className = '',
}: { label: string; title: string; subtitle?: string; centered?: boolean; className?: string }) {
  return (
    <AnimatedSection animation="fadeUp" className={`mb-10 sm:mb-12 md:mb-16 ${centered ? 'text-center' : ''} ${className}`}>
      <span className="mb-2 sm:mb-3 inline-block font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
        {label}
      </span>
      <h2 className="font-space-grotesk text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 sm:mb-4">
        <RevealText delay={0.1} duration={0.65}>
          {title}
        </RevealText>
      </h2>
      {subtitle && (
        <p className={`text-sm sm:text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed ${centered ? 'mx-auto max-w-2xl' : 'max-w-xl'}`}>
          {subtitle}
        </p>
      )}
    </AnimatedSection>
  );
}

// Scroll to top button
function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[var(--color-primary)] text-white shadow-lg hover:bg-[var(--color-primary)]/90 transition-colors"
      aria-label="Scroll to top"
    >
      <ChevronDown className="h-5 w-5 rotate-180" />
    </motion.button>
  );
}

// PAGE
export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <>
      <PageLoader />
      <ParticlesBackground />
      <ScrollProgress />
      <Navbar />
      <ScrollToTop />

      <main className="relative z-10">
        {/* 1. HERO — sticky so subsequent sections slide over it */}
        <section className="sticky top-0 z-[1] relative min-h-screen flex items-center overflow-hidden pt-16 sm:pt-20">
          {/* Ambient BG */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -left-32 h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] md:h-[700px] md:w-[700px] rounded-full bg-[var(--color-primary)] opacity-[0.07] blur-[80px] sm:blur-[100px] md:blur-[130px]" />
            <div className="absolute -bottom-20 -right-32 h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] md:h-[600px] md:w-[600px] rounded-full bg-[var(--color-secondary)] opacity-[0.06] blur-[80px] sm:blur-[100px] md:blur-[130px]" />
            {/* Subtle grid */}
            <div
              className="absolute inset-0 opacity-[0.015] sm:opacity-[0.02]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
          </div>

          <Container className="relative z-10 py-16 sm:py-20 md:py-24 lg:py-32 ">
            <motion.div 
              style={{ opacity: heroOpacity, scale: heroScale }}
              className="grid grid-cols-1 items-center gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2"
            >
              {/* Copy */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-[var(--color-primary)]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-primary)]" />
                    Now in public beta — free forever
                  </span>
                </motion.div>

                {/* Staggered headline */}
                <h1 className="font-space-grotesk mb-4 sm:mb-6 tracking-tight">
                  {[
                    { text: 'Build a portfolio', gradient: false },
                    { text: 'that gets', gradient: false },
                  ].map(({ text }, i) => (
                    <div key={i} className="overflow-hidden">
                      <motion.span
                        className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-white"
                        initial={{ y: '110%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 + i * 0.11, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {text}
                      </motion.span>
                    </div>
                  ))}
                  <div className="overflow-hidden">
                    <motion.div
                      initial={{ y: '110%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.7, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <GradientText
                        className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight"
                        duration={5}
                      >
                        you hired.
                      </GradientText>
                    </motion.div>
                  </div>
                </h1>

                <motion.p
                  className="mb-6 sm:mb-8 max-w-[480px] text-base sm:text-lg leading-relaxed text-[var(--color-text-muted)]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.65 }}
                >
                  Create a stunning developer portfolio with 3D animations, custom themes,
                  and real-time previews. No design skills needed — up in under 2 minutes.
                </motion.p>

                <motion.div
                  className="flex flex-wrap gap-3 sm:gap-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <Link href={ROUTES.REGISTER}>
                    <MagneticButton
                      className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-(--color-primary) to-violet-500 px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-(--color-primary)/30 hover:shadow-(--color-primary)/50 transition-shadow duration-300"
                      glowColor="rgba(124,58,237,0.45)"
                    >
                      Start building free
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </MagneticButton>
                  </Link>
                  <Link href={ROUTES.TEMPLATES_PAGE}>
                    <Button variant="ghost" size="lg" className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 border border-white/10">
                      <Play className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-[var(--color-secondary)]" />
                      View templates
                    </Button>
                  </Link>
                </motion.div>

                {/* Social proof row */}
                <motion.div
                  className="mt-8 sm:mt-10 md:mt-12 flex flex-wrap items-center gap-4 sm:gap-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.05 }}
                >
                  <div className="flex -space-x-2 sm:-space-x-2.5">
                    {['#7C3AED', '#0EA5E9', '#F59E0B', '#10B981', '#EC4899'].map((c, i) => (
                      <div
                        key={i}
                        className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full border-2 border-[var(--color-bg)] flex items-center justify-center text-[10px] sm:text-xs font-bold text-white"
                        style={{ background: c }}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="mb-0.5 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-[var(--color-accent)] text-[var(--color-accent)]" />
                      ))}
                    </div>
                    <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)]">
                      Loved by <strong className="text-white">10,000+</strong> developers worldwide
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* 3D visual */}
              <motion.div
                className="relative h-[280px] sm:h-[340px] md:h-[420px] lg:h-[560px]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.3 }}
              >
                <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-white/[0.02]">
                  <Suspense fallback={<SkeletonBox className="h-full w-full" />}>
                    <HeroScene />
                  </Suspense>
                </div>
                {/* Floating chips */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="absolute -left-2 sm:-left-4 top-8 sm:top-10 hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-[var(--color-bg-glass)] px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-white backdrop-blur-md"
                >
                  <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400" /> &lt;200ms load
                </motion.div>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -right-2 sm:-right-4 bottom-12 sm:bottom-16 hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-[var(--color-bg-glass)] px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-white backdrop-blur-md"
                >
                  <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" /> 98% hired
                </motion.div>
              </motion.div>
            </motion.div>
          </Container>

          {/* Scroll caret */}
          <motion.div
            className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 sm:gap-1.5"
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/25">scroll</span>
            <div className="flex h-6 w-4 sm:h-7 sm:w-4 md:h-8 md:w-5 items-start justify-center rounded-full border border-white/20 pt-1 sm:pt-1.5">
              <div className="h-1 sm:h-1.5 w-0.5 sm:w-1 rounded-full bg-white/40" />
            </div>
          </motion.div>
        </section>

        {/* ↓ All sections below have z-[10] + solid bg so they slide over the sticky hero */}
        <div className="relative z-[10]" style={{ background: 'var(--color-bg)' }}>

        {/* 2. TECH MARQUEE */}
        <div className="relative z-10 overflow-hidden border-y border-white/[0.06] bg-white/[0.015] py-4 sm:py-5 md:py-6">
          <p className="mb-2 sm:mb-3 md:mb-4 text-center text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/25">
            Built for developers working with
          </p>
          <div className="flex animate-marquee gap-8 sm:gap-10 md:gap-12 whitespace-nowrap">
            {[...TECH_LABELS, ...TECH_LABELS].map((t, i) => (
              <span key={i} className="inline-block text-xs sm:text-sm font-semibold text-white/35 transition-colors hover:text-white/80">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 3. STATS */}
        <AnimatedSection animation="fadeIn">
          <section className="py-16 sm:py-18 md:py-20">
            <Container>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 md:grid-cols-4">
                {STATS.map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="font-space-grotesk mb-1 text-2xl sm:text-3xl md:text-4xl font-extrabold leading-none gradient-text">
                      {s.prefix}
                      <CountUp end={s.num} />
                      {s.suffix}
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">{s.label}</p>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        </AnimatedSection>

        {/* 4. FEATURES */}
        <section id="features" className="relative z-10 py-20 sm:py-24 md:py-28">
          <Container>
            <SectionHeader
              centered
              label="Platform Features"
              title="Everything you need to stand out"
              subtitle="A complete toolkit to build, customise, and publish a portfolio that represents the very best of your work."
            />
            <StackingCards items={FEATURES} />
          </Container>
        </section>

        {/* 5. TEMPLATES SHOWCASE */}
        <section id="templates" className="relative z-10 overflow-hidden py-20 sm:py-24 md:py-28">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] md:h-[500px] md:w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-secondary)] opacity-[0.04] blur-[60px] sm:blur-[80px] md:blur-[100px]" />
          <Container className="relative z-10">
            <SectionHeader
              centered
              label="Templates"
              title="50+ premium templates"
              subtitle="Pick a template, make it yours. Fully customisable, mobile-friendly, and blazing fast — every single one."
            />
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="group overflow-hidden rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:border-[var(--color-primary)]/40 hover:shadow-2xl hover:shadow-[var(--color-primary)]/15"
                >
                  <div className="h-36 sm:h-40 md:h-44 lg:h-48 overflow-hidden border-b border-white/[0.06]">
                    <t.Mock />
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="mb-3 sm:mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-white">{t.name}</h3>
                        <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)]">{t.category}</p>
                      </div>
                      <span className="rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/15 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-xs font-medium text-[var(--color-primary)]">
                        {t.tag}
                      </span>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <Link href={ROUTES.TEMPLATES_PAGE} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-[10px] sm:text-xs">
                          <ExternalLink className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" /> Preview
                        </Button>
                      </Link>
                      <Link href={ROUTES.REGISTER} className="flex-1">
                        <Button variant="glow" size="sm" className="w-full text-[10px] sm:text-xs">
                          Use this
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 sm:mt-10 md:mt-12 text-center">
              <Link href={ROUTES.TEMPLATES_PAGE}>
                <Button variant="outline" size="md" className="text-xs sm:text-sm">
                  Browse all 50+ templates <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        {/* 6. HOW IT WORKS */}
        <section className="relative z-10 py-20 sm:py-24 md:py-28">
          <Container>
            <SectionHeader
              centered
              label="How It Works"
              title="From zero to live in 3 steps"
              subtitle="No coding. No design skills. No hosting headaches. Just a stunning live portfolio."
            />
            <div className="relative">
              {/* Connecting line (desktop) */}
              <div className="absolute left-1/2 top-8 sm:top-10 md:top-12 hidden h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 md:grid-cols-3">
                {STEPS.map((s, i) => (
                  <motion.div
                    key={s.num}
                    initial={{ opacity: 0, y: 60, rotateX: 15 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.65, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformPerspective: 600 }}
                    className="glass rounded-xl sm:rounded-2xl p-6 sm:p-7 md:p-8 text-center transition-transform duration-300 hover:-translate-y-1 sm:hover:-translate-y-1.5"
                  >
                    <span className="font-space-grotesk mb-3 sm:mb-4 md:mb-5 block text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text leading-none">
                      {s.num}
                    </span>
                    <div className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-[var(--color-primary)]/10">
                      <s.icon className="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-[var(--color-primary)]" />
                    </div>
                    <h3 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-bold text-white">{s.title}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-[var(--color-text-muted)]">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* 7. 3D SKILLS */}
        <section className="relative z-10 overflow-hidden py-20 sm:py-24 md:py-28">
          <div className="pointer-events-none absolute left-0 top-1/2 h-[400px] w-[400px] sm:h-[500px] sm:w-[500px] md:h-[700px] md:w-[700px] -translate-y-1/2 rounded-full bg-[var(--color-primary)] opacity-[0.04] blur-[80px] sm:blur-[100px] md:blur-[120px]" />
          <Container className="relative z-10">
            <div className="grid grid-cols-1 items-center gap-10 sm:gap-12 md:gap-14 lg:grid-cols-2 lg:gap-16">
              <AnimatedSection animation="slideRight">
                <span className="mb-2 sm:mb-3 md:mb-4 inline-block font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
                  Skills Visualisation
                </span>
                <h2 className="font-space-grotesk mb-4 sm:mb-5 md:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white">
                  Showcase your{' '}
                  <GradientText duration={4}>tech stack</GradientText>{' '}in 3D
                </h2>
                <p className="mb-6 sm:mb-7 md:mb-8 max-w-md text-sm sm:text-base md:text-lg leading-relaxed text-[var(--color-text-muted)]">
                  Interactive 3D skill visualisations transform your tech stack into an
                  unforgettable experience. Recruiters remember portfolios that move.
                </p>
                <ul className="space-y-2 sm:space-y-2.5 md:space-y-3">
                  {['React, TypeScript, Next.js', 'Node.js, Python, GraphQL', 'AWS, Docker, MongoDB', 'Three.js, Framer Motion, GSAP'].map((line) => (
                    <li key={line} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--color-text-muted)]">
                      <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0 text-emerald-400" />
                      {line}
                    </li>
                  ))}
                </ul>
              </AnimatedSection>

              <AnimatedSection animation="slideLeft">
                <div className="h-[220px] sm:h-[280px] md:h-[380px] lg:h-[480px] overflow-hidden rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                  <Suspense fallback={<SkeletonBox className="h-full w-full" />}>
                    <SkillsScene />
                  </Suspense>
                </div>
              </AnimatedSection>
            </div>
          </Container>
        </section>

        {/* 8. TESTIMONIALS — infinite 2-row marquee */}
        <section className="relative z-10 py-24 sm:py-28 md:py-32 overflow-hidden">
          <Container>
            <SectionHeader
              centered
              label="Developer Stories"
              title="What developers say"
              subtitle="Real stories from real developers who landed their dream jobs using Portify."
            />
          </Container>

          {/* Row 1 — scrolls left */}
          <div className="relative mt-10 sm:mt-12">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-40 bg-gradient-to-r from-[var(--color-bg)] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-40 bg-gradient-to-l from-[var(--color-bg)] to-transparent" />
            <div className="flex animate-marquee-slow gap-5 pb-5">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <div
                  key={`t1-${i}`}
                  className="flex-shrink-0 w-[290px] sm:w-[360px] glass flex flex-col rounded-xl border border-white/[0.08] p-5 sm:p-6 hover:border-white/20 transition-colors duration-300"
                >
                  <div className="mb-3 sm:mb-4 flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Star key={si} className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-[var(--color-accent)] text-[var(--color-accent)]" />
                    ))}
                  </div>
                  <p className="mb-4 flex-1 text-xs leading-relaxed text-[var(--color-text-muted)] sm:text-sm">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 border-t border-white/[0.07] pt-3 sm:pt-4">
                    <div
                      className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold text-white"
                      style={{ background: t.color }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-[9px] sm:text-[10px] text-[var(--color-text-muted)]">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 — scrolls right */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-40 bg-gradient-to-r from-[var(--color-bg)] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-40 bg-gradient-to-l from-[var(--color-bg)] to-transparent" />
            <div className="flex animate-marquee-reverse-slow gap-5">
              {[...[...TESTIMONIALS].reverse(), ...[...TESTIMONIALS].reverse()].map((t, i) => (
                <div
                  key={`t2-${i}`}
                  className="flex-shrink-0 w-[290px] sm:w-[360px] glass flex flex-col rounded-xl border border-white/[0.08] p-5 sm:p-6 hover:border-white/20 transition-colors duration-300"
                >
                  <div className="mb-3 sm:mb-4 flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Star key={si} className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-[var(--color-accent)] text-[var(--color-accent)]" />
                    ))}
                  </div>
                  <p className="mb-4 flex-1 text-xs leading-relaxed text-[var(--color-text-muted)] sm:text-sm">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 border-t border-white/[0.07] pt-3 sm:pt-4">
                    <div
                      className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold text-white"
                      style={{ background: t.color }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-[9px] sm:text-[10px] text-[var(--color-text-muted)]">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. CTA BANNER */}
        <AnimatedSection animation="fadeUp">
          <section className="relative z-10 pb-20 pt-8 sm:pb-24 sm:pt-12 md:pb-28 md:pt-16">
            <Container>
              <div className="mx-auto max-w-6xl">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary)] via-violet-800 to-[var(--color-secondary)] px-4 py-12 text-center sm:rounded-3xl sm:px-6 sm:py-14 md:px-8 md:py-16 lg:px-12 lg:py-20">
                {/* Grid overlay */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.04] sm:opacity-[0.055]"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
                {/* Brand-colored glow orbs */}
                <div className="pointer-events-none absolute -top-20 -left-10 h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80 rounded-full bg-[var(--color-secondary)] opacity-[0.18] blur-[60px] sm:blur-[80px]" />
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-[var(--color-primary)] opacity-[0.12] blur-[80px]" />
                <div className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 sm:h-56 sm:w-56 md:h-72 md:w-72 rounded-full bg-[var(--color-accent)] opacity-[0.15] blur-[50px] sm:blur-[70px]" />

                <div className="relative z-10">
                  <span className="mb-4 sm:mb-5 md:mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white">
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Join 10,000+ developers worldwide
                  </span>
                  <h2 className="font-space-grotesk mx-auto mb-4 sm:mb-5 md:mb-6 max-w-3xl text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white">
                    Build your dream portfolio today
                  </h2>
                  <p className="mx-auto mb-6 sm:mb-7 md:mb-8 lg:mb-10 max-w-xl text-sm sm:text-base md:text-lg text-white/70">
                    Free to start. No credit card required. Your custom portfolio URL is live in under 2 minutes.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                    <Link href={ROUTES.REGISTER}>
                      <MagneticButton
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-5 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold text-[var(--color-primary)] shadow-lg hover:bg-white/90 transition-colors duration-200"
                        glowColor="rgba(255,255,255,0.25)"
                      >
                        Start building — it&apos;s free
                      </MagneticButton>
                    </Link>
                    <Link href={ROUTES.TEMPLATES_PAGE}>
                      <Button variant="ghost" size="md" className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 border border-white/25 bg-white/10 text-white hover:bg-white/20">
                        View templates
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              </div>
            </Container>
          </section>
        </AnimatedSection>

        {/* Footer lives inside the z-[10] wrapper so it covers the pinned hero */}
        <div className="mt-8 sm:mt-12 md:mt-16">
          <Footer />
        </div>
        </div>{/* /z-[10] content-over-hero wrapper */}
      </main>
    </>
  );
}