"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock3, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';
import { POSTS } from '../../../data/blogPosts';

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20 sm:pb-24 md:pb-28">
        <section className="relative overflow-hidden pb-12 pt-10 sm:pb-14 sm:pt-14 md:pb-16">
          <div className="pointer-events-none absolute -top-36 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-[var(--color-primary)] opacity-[0.06] blur-[110px]" />
          <Container maxWidth="lg" className="relative z-10 text-center">
            <motion.span
              className="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              Blog
            </motion.span>
            <motion.h1
              className="font-space-grotesk mb-5 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              Insights for developers who want to <span className="gradient-text">stand out</span>
            </motion.h1>
            <motion.p
              className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14 }}
            >
              Writing on portfolio strategy, storytelling, and practical career growth. Built for engineers,
              designers, and students preparing their next opportunity.
            </motion.p>
          </Container>
        </section>

        <section>
          <Container maxWidth="lg">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {POSTS.map((post, i) => (
                <motion.article
                  key={post.slug}
                  className="glass rounded-2xl border border-white/[0.08] p-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  <span className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] w-fit">
                    {post.category}
                  </span>
                  <h2 className="mb-3 text-lg font-bold text-white">{post.title}</h2>
                  <div className="flex-1">
                    <p className="mb-5 text-sm leading-relaxed text-[var(--color-text-muted)]">{post.excerpt}</p>
                    <div className="mb-6 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                      <span>{post.date}</span>
                      <span className="text-white/30">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" /> {post.readTime}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--color-primary) transition-colors hover:text-white">
                      Read article <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </Container>
        </section>

        <section className="pt-14 sm:pt-16 md:pt-20">
          <Container maxWidth="md">
            <motion.div
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[var(--color-primary)]/15 via-transparent to-[var(--color-secondary)]/10 p-7 text-center sm:p-10"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55 }}
            >
              <h2 className="font-space-grotesk mb-3 text-2xl font-extrabold text-white sm:text-3xl">Want product updates too?</h2>
              <p className="mb-7 text-sm text-[var(--color-text-muted)] sm:text-base">
                Follow our release notes and roadmap updates in the changelog.
              </p>
              <Link href={ROUTES.CHANGELOG_PAGE}>
                <Button variant="glow" size="lg">View changelog</Button>
              </Link>
            </motion.div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
