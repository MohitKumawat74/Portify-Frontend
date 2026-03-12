'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import Link from 'next/link';
import {
  Palette, Sparkles, Globe, Code2, Layers, Zap,
  BarChart2, Lock, Smartphone, RefreshCw, Search, Users,
  CheckCircle, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

const FEATURE_GROUPS = [
  {
    group: 'Design & Templates',
    gradient: 'from-violet-500 to-purple-600',
    items: [
      { icon: Palette, title: '50+ Premium Templates', desc: 'Every template is designed by professionals and ships with multiple colour variants. Mobile-first, every time.', color: 'text-violet-400', bg: 'bg-violet-500/15' },
      { icon: Sparkles, title: 'Full Theme Customisation', desc: 'Control every colour, font, border radius, and spacing token. Your portfolio, your rules.', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
      { icon: Smartphone, title: 'Pixel-Perfect Responsive', desc: 'Looks incredible on a 4K monitor and a 320px phone screen. No compromises.', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    ],
  },
  {
    group: 'Content & Publishing',
    gradient: 'from-cyan-500 to-blue-600',
    items: [
      { icon: Globe, title: 'Custom Slug URL', desc: 'Claim your domain handle — yourname.portify.dev — and share it everywhere.', color: 'text-blue-400', bg: 'bg-blue-500/15' },
      { icon: RefreshCw, title: 'Real-Time Preview', desc: 'Every change you make is reflected instantly in the live preview panel. What you see is what you get.', color: 'text-indigo-400', bg: 'bg-indigo-500/15' },
      { icon: Code2, title: 'Project Showcase', desc: 'Rich project cards with screenshots, live links, repo links, tech stack badges, and full markdown descriptions.', color: 'text-pink-400', bg: 'bg-pink-500/15' },
    ],
  },
  {
    group: 'Analytics & Growth',
    gradient: 'from-emerald-500 to-teal-600',
    items: [
      { icon: BarChart2, title: 'Portfolio Analytics', desc: 'See who viewed your portfolio, where they came from, and how long they stayed. Actionable insights.', color: 'text-teal-400', bg: 'bg-teal-500/15' },
      { icon: Search, title: 'SEO Optimised', desc: 'Every portfolio ships with a perfect SEO score — correct meta tags, Open Graph images, and sitemap.', color: 'text-green-400', bg: 'bg-green-500/15' },
      { icon: Users, title: 'Recruiter-Ready Export', desc: 'One-click PDF export of your portfolio for recruiters who prefer traditional formats.', color: 'text-amber-400', bg: 'bg-amber-500/15' },
    ],
  },
  {
    group: 'Performance & Security',
    gradient: 'from-orange-500 to-red-600',
    items: [
      { icon: Zap, title: 'Edge-Deployed, <200ms', desc: 'Deployed globally on edge CDN. Pages load before the recruiter blinks.', color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
      { icon: Lock, title: 'Secure by Default', desc: 'HTTPS everywhere, input sanitisation, rate limiting, and CSRF protection on every endpoint.', color: 'text-red-400', bg: 'bg-red-500/15' },
      { icon: Layers, title: '3D Interactive Visuals', desc: 'Optional React Three Fiber skill spheres and hero animations that make your portfolio unforgettable.', color: 'text-purple-400', bg: 'bg-purple-500/15' },
    ],
  },
];

const COMPARISON = [
  { feature: 'Custom domain slug', us: true, them: false },
  { feature: '3D animations', us: true, them: false },
  { feature: 'Real-time preview', us: true, them: false },
  { feature: 'Analytics dashboard', us: true, them: false },
  { feature: 'SEO optimised', us: true, them: true },
  { feature: 'Mobile responsive', us: true, them: true },
  { feature: 'Free tier', us: true, them: false },
];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28">

        {/* Hero */}
        <section className="relative overflow-hidden pb-14 pt-10 text-center sm:pb-16 sm:pt-14 md:pb-20">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[var(--color-primary)] opacity-[0.07] blur-[120px]" />
          <div className="pointer-events-none absolute top-20 right-1/4 h-[300px] w-[300px] rounded-full bg-[var(--color-secondary)] opacity-[0.05] blur-[80px]" />
          <Container maxWidth="md" className="relative z-10">
            <motion.span
              className="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Platform Features
            </motion.span>
            <motion.h1
              className="font-space-grotesk mb-6 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Every tool you need to{' '}
              <span className="gradient-text">get noticed</span>
            </motion.h1>
            <motion.p
              className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)] sm:mb-10 sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Portify ships with a professional-grade feature set — no plugins, no
              add-ons, no hidden costs.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href={ROUTES.REGISTER}>
                <Button variant="glow" size="lg">
                  Start for free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </Container>
        </section>

        {/* Feature groups */}
        {FEATURE_GROUPS.map((group, gi) => (
          <section key={group.group} className="py-12 sm:py-16 md:py-20">
            <Container>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5 }}
                className="mb-8 sm:mb-10 flex items-center gap-3"
              >
                <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${group.gradient}`} />
                <h2 className="font-space-grotesk text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                  {group.group}
                </h2>
              </motion.div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item, ii) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 50, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.6, delay: (gi * 0.05) + ii * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="glass gradient-border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[var(--color-primary)]/10 sm:p-7"
                  >
                    <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.bg}`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <h3 className="mb-2 text-sm font-semibold text-white sm:text-base">{item.title}</h3>
                    <p className="text-xs leading-relaxed text-[var(--color-text-muted)] sm:text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </Container>
          </section>
        ))}

        {/* Comparison table */}
        <section className="py-12 sm:py-16 md:py-24">
          <Container maxWidth="md">
            <motion.h2
              className="font-space-grotesk mb-8 text-center text-2xl font-extrabold text-white sm:mb-12 sm:text-3xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              How we compare
            </motion.h2>
            <motion.div
              className="overflow-x-auto rounded-2xl border border-white/[0.08]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Feature</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">Portify</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <motion.tr
                      key={row.feature}
                      className={`border-b border-white/[0.05] ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                    >
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        <CheckCircle className={`mx-auto h-5 w-5 ${row.us ? 'text-emerald-400' : 'text-white/20'}`} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <CheckCircle className={`mx-auto h-5 w-5 ${row.them ? 'text-emerald-400' : 'text-white/20'}`} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </Container>
        </section>

        {/* CTA */}
        <section className="pb-20 text-center sm:pb-24 md:pb-28">
          <Container maxWidth="md">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 via-transparent to-[var(--color-secondary)]/10 border border-[var(--color-primary)]/20 p-10 sm:p-14"
            >
              <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[var(--color-primary)] opacity-[0.12] blur-[60px]" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[var(--color-secondary)] opacity-[0.1] blur-[50px]" />
              <div className="relative z-10">
                <h2 className="font-space-grotesk mb-4 text-2xl font-extrabold text-white sm:text-3xl">
                  Ready to build?
                </h2>
                <p className="mb-7 text-sm text-[var(--color-text-muted)] sm:mb-8 sm:text-base">
                  All features are included in every plan. Start free today.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={ROUTES.REGISTER}><Button variant="glow" size="lg">Get started free</Button></Link>
                  <Link href={ROUTES.TEMPLATES_PAGE}><Button variant="outline" size="lg">Browse templates</Button></Link>
                </div>
              </div>
            </motion.div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

