'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';
import { CheckCircle, Zap, Sparkles } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Everything you need to get started and get noticed.',
    color: 'border-white/[0.08]',
    cta: { label: 'Start for free', href: ROUTES.REGISTER, variant: 'outline' as const },
    features: [
      '3 portfolio templates',
      'Custom slug URL',
      '5 projects showcase',
      'Skills section',
      'Mobile responsive',
      'Basic analytics',
    ],
  },
  {
    name: 'Pro',
    price: 9,
    period: '/ month',
    description: 'For serious developers who want every edge over the competition.',
    color: 'border-[var(--color-primary)]/50',
    highlight: true,
    badge: 'Most Popular',
    cta: { label: 'Get Pro — $9/mo', href: ROUTES.REGISTER, variant: 'glow' as const },
    features: [
      'All 50+ premium templates',
      'Custom domain (coming soon)',
      'Unlimited projects',
      '3D skill visualisations',
      'Advanced analytics',
      'Priority support',
      'SEO optimisation',
      'PDF export',
      'Remove branding',
    ],
  },
  {
    name: 'Team',
    price: 29,
    period: '/ month',
    description: 'For recruitment agencies and teams managing multiple portfolios.',
    color: 'border-white/[0.08]',
    cta: { label: 'Contact sales', href: ROUTES.ABOUT_PAGE, variant: 'outline' as const },
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Centralised billing',
      'SSO (coming soon)',
      'Dedicated support',
      'Custom templates',
    ],
  },
];

const FAQ = [
  { q: 'Is the free plan really free forever?', a: 'Yes. No credit card, no time limit — the free plan is free forever. Upgrade when you need more power.' },
  { q: 'Can I switch plans at any time?', a: 'Absolutely. Upgrade, downgrade, or cancel at any time. No lock-in contracts.' },
  { q: 'What happens if I cancel Pro?', a: 'Your portfolio stays live on the Free plan. You keep your custom slug and all your content.' },
  { q: 'Do you offer student discounts?', a: 'Yes! Students get 50% off Pro with a valid .edu email address. Contact us to redeem.' },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const getPrice = (base: number) => (base === 0 ? 0 : annual ? Math.round(base * 0.8) : base);

  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28">
        {/* Hero */}
        <section className="relative overflow-hidden pb-14 pt-10 text-center sm:pb-16 sm:pt-14 md:pb-20">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[var(--color-accent)] opacity-[0.05] blur-[120px]" />
          <div className="pointer-events-none absolute top-20 right-1/3 h-[250px] w-[250px] rounded-full bg-[var(--color-primary)] opacity-[0.04] blur-[80px]" />
          <Container maxWidth="md" className="relative z-10">
            <motion.span
              className="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Pricing
            </motion.span>
            <motion.h1
              className="font-space-grotesk mb-6 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Simple,{' '}
              <span className="gradient-text">transparent</span> pricing
            </motion.h1>
            <motion.p
              className="mx-auto mb-8 text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Start free. Upgrade when you need more. No surprises, ever.
            </motion.p>

            {/* Billing toggle */}
            <motion.div
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] p-1 pr-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <button
                onClick={() => setAnnual(false)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${!annual ? 'bg-white/10 text-white' : 'text-[var(--color-text-muted)] hover:text-white'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${annual ? 'bg-white/10 text-white' : 'text-[var(--color-text-muted)] hover:text-white'}`}
              >
                Annual
              </button>
              {annual && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400"
                >
                  <Sparkles className="h-2.5 w-2.5" /> Save 20%
                </motion.span>
              )}
            </motion.div>
          </Container>
        </section>

        {/* Plans */}
        <section className="pb-12 sm:pb-16 md:pb-24">
          <Container maxWidth="lg">
            <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 50, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex flex-col rounded-2xl border ${plan.color} bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1.5 sm:p-8 ${plan.highlight ? 'shadow-2xl shadow-[var(--color-primary)]/20' : ''}`}
                >
                  {plan.highlight && (
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-[var(--color-primary)]/50" />
                  )}
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-4 py-1 text-xs font-bold text-white">
                      {plan.badge}
                    </span>
                  )}
                  <div className="mb-6">
                    <h3 className="mb-1 text-lg font-bold text-white sm:text-xl">{plan.name}</h3>
                    <p className="mb-4 text-sm text-[var(--color-text-muted)]">{plan.description}</p>
                    <div className="flex items-end gap-1">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${plan.name}-${annual}`}
                          className="font-space-grotesk text-4xl font-extrabold text-white sm:text-5xl"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {plan.price === 0 ? 'Free' : `$${getPrice(plan.price)}`}
                        </motion.span>
                      </AnimatePresence>
                      {plan.price > 0 && (
                        <span className="mb-2 text-sm text-[var(--color-text-muted)]">{plan.period}</span>
                      )}
                    </div>
                    {annual && plan.price > 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1 text-xs text-emerald-400"
                      >
                        was ${plan.price}/mo
                      </motion.p>
                    )}
                  </div>
                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)]">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.cta.href}>
                    <Button variant={plan.cta.variant} size="lg" className="w-full">
                      {plan.cta.label}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Annual discount note */}
            <motion.div
              className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-[var(--color-text-muted)]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="h-4 w-4 text-[var(--color-accent)]" />
              <span>Annual billing saves 20% &mdash; toggle above or available at checkout</span>
            </motion.div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="pb-20 pt-10 sm:pb-24 sm:pt-14 md:pb-28 md:pt-16">
          <Container maxWidth="md">
            <motion.h2
              className="font-space-grotesk mb-8 text-center text-2xl font-extrabold text-white sm:mb-10 sm:text-3xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              Frequently asked questions
            </motion.h2>
            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <motion.div
                  key={item.q}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className="glass rounded-2xl border border-white/[0.08] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-5 text-left sm:p-6"
                  >
                    <h3 className="pr-4 font-semibold text-white">{item.q}</h3>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 text-xl text-[var(--color-primary)]"
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-white/[0.06] px-5 pb-5 pt-3 text-xs leading-relaxed text-[var(--color-text-muted)] sm:px-6 sm:pb-6 sm:text-sm">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
