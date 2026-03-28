'use client';

import { motion } from 'framer-motion';
import { Mail, MessageSquare, LifeBuoy } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20 sm:pb-24 md:pb-28">
        <section className="relative overflow-hidden pb-12 pt-10 sm:pb-14 sm:pt-14 text-center">
          <div className="pointer-events-none absolute -top-36 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-[var(--color-primary)] opacity-[0.06] blur-[110px]" />
          <Container maxWidth="md" className="relative z-10">
            <motion.span
              className="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              Contact
            </motion.span>
            <motion.h1
              className="font-space-grotesk mb-5 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              We are here to <span className="gradient-text">help you ship</span>
            </motion.h1>
            <motion.p
              className="mx-auto text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14 }}
            >
              Questions about pricing, support, or onboarding? Send a message and our team will get back within one business day.
            </motion.p>
          </Container>
        </section>

        <section>
          <Container maxWidth="lg">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <motion.form
                className="glass rounded-2xl border border-white/[0.08] p-6 sm:p-8"
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55 }}
              >
                <h2 className="mb-5 text-2xl font-bold text-white">Send us a message</h2>
                <div className="space-y-4">
                  <Input label="Full Name" name="name" placeholder="Jane Doe" fullWidth />
                  <Input label="Email" type="email" name="email" placeholder="jane@company.com" fullWidth />
                  <Input label="Company" name="company" placeholder="Optional" fullWidth />
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="message" className="text-sm font-medium text-[var(--color-text-muted)]">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Tell us a little about what you need."
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <Button type="button" variant="glow" size="lg">Submit message</Button>
                </div>
              </motion.form>

              <motion.aside
                className="space-y-4"
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: 0.08 }}
              >
                <div className="glass rounded-2xl border border-white/[0.08] p-6">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
                    <Mail className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-white">General inquiries</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">hello@portify.dev</p>
                </div>

                <div className="glass rounded-2xl border border-white/[0.08] p-6">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-secondary)]/15">
                    <LifeBuoy className="h-5 w-5 text-[var(--color-secondary)]" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-white">Support</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">support@portify.dev</p>
                </div>

                <div className="glass rounded-2xl border border-white/[0.08] p-6">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]/15">
                    <MessageSquare className="h-5 w-5 text-[var(--color-accent)]" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-white">Sales</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">sales@portify.dev</p>
                </div>
              </motion.aside>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
