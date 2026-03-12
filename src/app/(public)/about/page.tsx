'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';
import { Heart, Target, Zap, Users } from 'lucide-react';

const VALUES = [
  { icon: Heart, title: 'Developer-First', desc: 'Built by developers who got tired of spending weekends rebuilding their own portfolios every few months.' },
  { icon: Target, title: 'Quality Over Quantity', desc: 'We obsess over every pixel, every animation timing, every performance metric. No shortcuts.' },
  { icon: Zap, title: 'Speed Matters', desc: 'Not just build speed — load speed, render speed, and the speed at which you can publish your work.' },
  { icon: Users, title: 'Community Driven', desc: 'Every feature request from the community gets serious consideration. You shape the roadmap.' },
];

const TEAM = [
  { name: 'Alex Rivera', role: 'Founder & CEO', color: '#7C3AED', initials: 'AR', bio: 'Former SWE @ Meta. Built his first portfolio in 2016, has been obsessed with developer tooling ever since.' },
  { name: 'Jamie Park', role: 'Head of Design', color: '#0EA5E9', initials: 'JP', bio: 'Design systems lead. Previously at Linear and Vercel. Believes every developer deserves a beautiful portfolio.' },
  { name: 'Morgan Chen', role: 'Lead Engineer', color: '#F59E0B', initials: 'MC', bio: 'Full-stack engineer with a love for Three.js and animations. Makes the 3D magic happen.' },
];

const MILESTONES = [
  { year: '2024 Q1', event: 'Project started with a simple idea: portfolios should be effortless.' },
  { year: '2024 Q3', event: 'First 100 users, first 5-star review. The community started forming.' },
  { year: '2025 Q1', event: 'Public beta launched. 3D templates and skill visualisations shipped.' },
  { year: '2025 Q4', event: '10,000+ portfolios created. 98% employment success rate confirmed.' },
  { year: '2026', event: 'Continuing to build the most impressive portfolio platform on the web.' },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28">

        {/* Hero */}
        <section className="relative overflow-hidden pb-14 pt-10 text-center sm:pb-16 sm:pt-14 md:pb-20">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[var(--color-primary)] opacity-[0.06] blur-[120px]" />
          <div className="pointer-events-none absolute top-16 right-1/4 h-[300px] w-[300px] rounded-full bg-[var(--color-secondary)] opacity-[0.04] blur-[80px]" />
          <Container maxWidth="md" className="relative z-10">
            <motion.span
              className="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Our Story
            </motion.span>
            <motion.h1
              className="font-space-grotesk mb-6 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Built by developers,{' '}
              <span className="gradient-text">for developers</span>
            </motion.h1>
            <motion.p
              className="mx-auto text-lg leading-relaxed text-[var(--color-text-muted)]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Portify was created because we were tired of spending entire weekends
              rebuilding portfolio sites from scratch every time we updated our skills.
              There had to be a better way.
            </motion.p>
          </Container>
        </section>

        {/* Mission */}
        <section className="py-12 sm:py-16 md:py-20">
          <Container maxWidth="lg">
            <motion.div
              className="glass rounded-2xl p-6 text-center sm:rounded-3xl sm:p-10 md:p-14 lg:p-16 relative overflow-hidden"
              initial={{ opacity: 0, y: 50, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[var(--color-primary)] opacity-[0.08] blur-[60px]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-[var(--color-secondary)] opacity-[0.06] blur-[50px]" />
              <div className="relative z-10">
                <h2 className="font-space-grotesk mb-4 text-2xl font-extrabold text-white sm:mb-5 sm:text-3xl">
                  Our mission
                </h2>
                <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg md:text-xl">
                  To make exceptional portfolio design accessible to every developer on the planet —
                  regardless of their design skills, budget, or available time.
                </p>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Values */}
        <section className="py-12 sm:py-16 md:py-20">
          <Container>
            <motion.h2
              className="font-space-grotesk mb-8 text-center text-2xl font-extrabold text-white sm:mb-10 sm:text-3xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              What we stand for
            </motion.h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-[var(--color-primary)]/10 sm:p-7"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
                    <v.icon className="h-6 w-6 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="mb-2 font-bold text-white">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Team */}
        <section className="py-12 sm:py-16 md:py-20">
          <Container maxWidth="lg">
            <motion.h2
              className="font-space-grotesk mb-8 text-center text-2xl font-extrabold text-white sm:mb-10 sm:text-3xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              The team
            </motion.h2>
            <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
              {TEAM.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 50, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1.5 group sm:p-8"
                >
                  <div
                    className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-extrabold text-white ring-2 ring-white/10 ring-offset-2 ring-offset-transparent transition-all duration-300 group-hover:ring-[var(--color-primary)]/40"
                    style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}88)` }}
                  >
                    {member.initials}
                  </div>
                  <h3 className="mb-1 font-bold text-white">{member.name}</h3>
                  <p className="mb-3 text-xs font-medium text-[var(--color-primary)]">{member.role}</p>
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Timeline */}
        <section className="py-12 sm:py-16 md:py-20">
          <Container maxWidth="md">
            <motion.h2
              className="font-space-grotesk mb-8 text-center text-2xl font-extrabold text-white sm:mb-12 sm:text-3xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              Our journey
            </motion.h2>
            <div className="relative space-y-7 sm:space-y-8">
              <div className="absolute left-2 top-0 h-full w-px bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-secondary)] to-transparent sm:left-[72px]" />
              {MILESTONES.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-start gap-3 sm:gap-6"
                >
                  <div className="w-16 flex-shrink-0 text-left sm:w-[72px] sm:text-right">
                    <span className="text-[11px] font-bold text-[var(--color-primary)] sm:text-xs">{m.year}</span>
                  </div>
                  <div className="relative flex-shrink-0">
                    <motion.div
                      className="relative z-10 mt-0.5 h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] ring-4 ring-[var(--color-bg)] sm:h-3 sm:w-3"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.1 + 0.2 }}
                    />
                  </div>
                  <p className="flex-1 pb-2 text-xs leading-relaxed text-[var(--color-text-muted)] sm:text-sm">{m.event}</p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="pb-20 pt-2 text-center sm:pb-24 md:pb-28">
          <Container maxWidth="md">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/15 via-transparent to-[var(--color-secondary)]/10 border border-white/[0.07] p-10 sm:p-14"
            >
              <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[var(--color-primary)] opacity-[0.1] blur-[50px]" />
              <div className="relative z-10">
                <h2 className="font-space-grotesk mb-4 text-2xl font-extrabold text-white sm:text-3xl">
                  Want to be part of the story?
                </h2>
                <p className="mb-7 text-sm text-[var(--color-text-muted)] sm:mb-8 sm:text-base">
                  Join thousands of developers who are already getting hired with Portify.
                </p>
                <Link href={ROUTES.REGISTER}>
                  <Button variant="glow" size="lg">Start building for free</Button>
                </Link>
              </div>
            </motion.div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
