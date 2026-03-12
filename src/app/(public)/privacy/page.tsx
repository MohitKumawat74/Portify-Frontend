'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';

const LAST_UPDATED = 'March 9, 2026';

const SECTIONS = [
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    content: [
      {
        subtitle: '1.1 Account Information',
        body: 'When you register for Portify, we collect your name, email address, and password (stored as a hashed value). If you sign up via OAuth, we collect the information your provider shares (name, email, profile picture).',
      },
      {
        subtitle: '1.2 Portfolio Content',
        body: 'We store all content you add to your portfolio: bio, projects, skills, work experience, contact links, and any uploaded images. This data is required to render your portfolio.',
      },
      {
        subtitle: '1.3 Usage & Analytics Data',
        body: 'We automatically collect information about how you use Portify: pages visited, features used, session duration, browser/device type, IP address, and referring URLs. This helps us improve the product.',
      },
      {
        subtitle: '1.4 Payment Information',
        body: 'Payments are processed by Stripe. We never store your full card number on our servers. We only receive a tokenised reference from Stripe to identify your subscription.',
      },
      {
        subtitle: '1.5 Cookies & Similar Technologies',
        body: 'We use cookies and local storage to keep you logged in, remember your preferences, and measure product usage. See our Cookie Policy for full details.',
      },
    ],
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Your Information',
    content: [
      {
        subtitle: '',
        body: `We use the information we collect to:\n\n• Provide, operate, and improve the Portify platform\n• Authenticate you and keep your account secure\n• Personalise your experience and remember your settings\n• Process subscription payments and send billing receipts\n• Send transactional emails (e.g., password resets, account alerts)\n• Respond to your support requests\n• Send product updates and marketing communications (you can opt out at any time)\n• Comply with legal obligations`,
      },
    ],
  },
  {
    id: 'sharing',
    title: '3. How We Share Your Information',
    content: [
      {
        subtitle: 'We do not sell your personal data.',
        body: 'We may share data with:\n\n• **Service Providers** — Stripe (payments), AWS/Cloudflare (hosting & CDN), Resend (email), PostHog (analytics). These providers act as data processors under our instruction.\n• **Legal Requirements** — If required by law, subpoena, or to protect the rights and safety of Portify users.\n• **Business Transfers** — In the event of a merger, acquisition, or sale of assets, your data may be transferred to the successor organisation.',
      },
    ],
  },
  {
    id: 'data-retention',
    title: '4. Data Retention',
    content: [
      {
        subtitle: '',
        body: 'We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required by law to retain it longer (e.g., billing records for 7 years for tax purposes).\n\nAnonymised, aggregated analytics data may be retained indefinitely.',
      },
    ],
  },
  {
    id: 'your-rights',
    title: '5. Your Rights',
    content: [
      {
        subtitle: '',
        body: `Depending on your location, you may have the following rights:\n\n• **Access** — Request a copy of the personal data we hold about you.\n• **Rectification** — Request correction of inaccurate data.\n• **Erasure** — Request deletion of your data ("right to be forgotten").\n• **Portability** — Request your data in a machine-readable format.\n• **Objection** — Object to processing based on legitimate interests or direct marketing.\n• **Restriction** — Request that we restrict processing of your data.\n\nTo exercise any of these rights, contact us at privacy@portify.dev. We will respond within 30 days.`,
      },
    ],
  },
  {
    id: 'security',
    title: '6. Security',
    content: [
      {
        subtitle: '',
        body: 'We implement industry-standard security measures: HTTPS/TLS for all data in transit, bcrypt for password hashing, JWT tokens with short expiry, and regular security audits. No method of transmission over the internet is 100% secure; we cannot guarantee absolute security.',
      },
    ],
  },
  {
    id: 'children',
    title: '7. Children\'s Privacy',
    content: [
      {
        subtitle: '',
        body: 'Portify is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.',
      },
    ],
  },
  {
    id: 'international',
    title: '8. International Transfers',
    content: [
      {
        subtitle: '',
        body: 'Portify is operated from the United States. If you access Portify from outside the US, your data may be transferred to and processed in the US or other countries. We ensure that such transfers comply with applicable data protection laws (e.g., Standard Contractual Clauses for EU residents).',
      },
    ],
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    content: [
      {
        subtitle: '',
        body: 'We may update this Privacy Policy from time to time. We will notify you of material changes by email or via an in-app banner at least 14 days before the changes take effect. Continued use of Portify after the effective date constitutes acceptance of the updated policy.',
      },
    ],
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    content: [
      {
        subtitle: '',
        body: 'If you have questions or concerns about this Privacy Policy, please email us at privacy@portify.dev or write to:\n\nPortify, Inc.\n340 Pine Street, Suite 800\nSan Francisco, CA 94104\nUnited States',
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20">
        {/* Background glow */}
        <div className="pointer-events-none fixed -top-40 left-1/2 h-125 w-150 -translate-x-1/2 rounded-full bg-(--color-primary) opacity-[0.04] blur-[140px]" />

        <Container maxWidth="2xl" className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 border-b border-white/6 pb-10"
          >
            <span className="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.22em] text-(--color-primary)">
              Legal
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-(--color-text-muted)">
              Last updated:{' '}
              <span className="text-white/70">{LAST_UPDATED}</span>
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-(--color-text-muted)">
              At Portify, we take your privacy seriously. This policy explains what data we
              collect, how we use it, and what rights you have over it. Please read it carefully.
            </p>
          </motion.div>

          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 rounded-xl border border-white/6 bg-white/2 p-6"
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-(--color-text-muted)">
              Contents
            </h2>
            <ol className="space-y-1.5">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-(--color-text-muted) transition-colors hover:text-white"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* Sections */}
          <div className="space-y-12">
            {SECTIONS.map((section, i) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="scroll-mt-28"
              >
                <h2 className="mb-5 text-xl font-semibold text-white">{section.title}</h2>
                <div className="space-y-5">
                  {section.content.map((block, j) => (
                    <div key={j}>
                      {block.subtitle && (
                        <h3 className="mb-2 text-sm font-semibold text-white/80">
                          {block.subtitle}
                        </h3>
                      )}
                      <div className="whitespace-pre-line text-sm leading-relaxed text-(--color-text-muted)">
                        {block.body}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
