'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';

const LAST_UPDATED = 'March 9, 2026';

interface CookieRow {
  name: string;
  purpose: string;
  duration: string;
  type: string;
}

const ESSENTIAL_COOKIES: CookieRow[] = [
  { name: 'portify_auth_token', purpose: 'Stores your authentication JWT to keep you logged in', duration: '15 minutes', type: 'Essential' },
  { name: 'portify_refresh_token', purpose: 'Stores the refresh token to renew your session without re-login', duration: '30 days', type: 'Essential' },
  { name: 'portify_csrf', purpose: 'CSRF protection token to prevent cross-site request forgery', duration: 'Session', type: 'Essential' },
];

const PREFERENCE_COOKIES: CookieRow[] = [
  { name: 'portify_theme', purpose: 'Remembers your selected colour theme preference', duration: '1 year', type: 'Preference' },
  { name: 'portify_sidebar_state', purpose: 'Remembers whether your dashboard sidebar is collapsed or expanded', duration: '1 year', type: 'Preference' },
  { name: 'portify_locale', purpose: 'Remembers your language/locale preference', duration: '1 year', type: 'Preference' },
];

const ANALYTICS_COOKIES: CookieRow[] = [
  { name: 'ph_*', purpose: 'PostHog analytics — tracks page views, feature usage, and session recordings (anonymised)', duration: '1 year', type: 'Analytics' },
  { name: '_ga', purpose: 'Google Analytics — distinguishes unique users (anonymised, IP anonymisation enabled)', duration: '2 years', type: 'Analytics' },
  { name: '_ga_*', purpose: 'Google Analytics — stores and counts page views', duration: '2 years', type: 'Analytics' },
];

const MARKETING_COOKIES: CookieRow[] = [
  { name: '_fbp', purpose: 'Facebook Pixel — tracks conversions from Facebook Ads', duration: '90 days', type: 'Marketing' },
  { name: 'hubspotutk', purpose: 'HubSpot — tracks visitor identity for marketing automation', duration: '13 months', type: 'Marketing' },
];

const SECTIONS = [
  {
    id: 'what-are-cookies',
    title: '1. What Are Cookies?',
    content: `Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, remember your preferences, and provide aggregated analytics information to site owners.\n\nLocal storage and session storage are similar browser-based mechanisms we also use to persist data on your device. This policy covers all of these technologies collectively as "cookies".`,
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Cookies',
    content: `Portify uses cookies for the following purposes:\n\n• **Essential / Strictly Necessary** — To authenticate you, protect against security threats, and ensure the Service functions correctly. These cannot be disabled.\n• **Preference** — To remember your settings (theme, sidebar state, language) so you don't have to reconfigure them on each visit.\n• **Analytics** — To understand how visitors interact with Portify, measure feature adoption, and improve the product. Data is anonymised where possible.\n• **Marketing** — To measure the effectiveness of our advertising campaigns so we can optimise spend. These are only active if you opt in.`,
  },
  {
    id: 'cookie-table',
    title: '3. Cookies We Use',
    content: null,
  },
  {
    id: 'third-party',
    title: '4. Third-Party Cookies',
    content: `Some cookies are placed by third-party services that appear on our pages:\n\n• **Stripe** — For payment processing; may set cookies during checkout flows.\n• **PostHog** — Product analytics (self-hosted; data does not leave our infrastructure).\n• **Google Analytics** — Website traffic analytics; data is sent to Google servers. IP anonymisation is enabled. See Google's privacy policy for details.\n• **Facebook Pixel** — Conversion tracking for Meta Ads campaigns (only when marketing cookies are accepted).\n\nWe recommend reviewing the privacy policies of these third parties for more information on how they use cookie data.`,
  },
  {
    id: 'managing',
    title: '5. Managing Your Cookie Preferences',
    content: `You can manage your cookie preferences in the following ways:\n\n**In-app Cookie Banner** — When you first visit Portify, you can accept or reject non-essential cookies via our cookie consent banner. You can update your preferences at any time from your browser settings or by clearing site data.\n\n**Browser Settings** — All modern browsers allow you to view, block, and delete cookies:\n• Chrome: Settings → Privacy & Security → Cookies\n• Firefox: Settings → Privacy & Security → Cookies and Site Data\n• Safari: Preferences → Privacy → Manage Website Data\n• Edge: Settings → Cookies and site permissions\n\n**Opt-out Links:**\n• Google Analytics: https://tools.google.com/dlpage/gaoptout\n• Facebook: https://www.facebook.com/settings/?tab=ads\n\n⚠️ Disabling essential cookies will prevent core features (e.g., login, session management) from working correctly.`,
  },
  {
    id: 'do-not-track',
    title: '6. Do Not Track',
    content: `Some browsers have a "Do Not Track" (DNT) feature. Portify honours DNT signals where technically feasible. When DNT is detected, we disable analytics and marketing cookies for your session.`,
  },
  {
    id: 'changes',
    title: '7. Changes to This Policy',
    content: `We may update this Cookie Policy when we add new features or third-party integrations. We will update the "Last updated" date at the top of this page. For material changes, we will notify you via the in-app cookie banner.`,
  },
  {
    id: 'contact',
    title: '8. Contact Us',
    content: `Questions about our use of cookies? Contact us at privacy@portify.dev\n\nPortify, Inc.\n340 Pine Street, Suite 800\nSan Francisco, CA 94104\nUnited States`,
  },
];

const TYPE_COLORS: Record<string, string> = {
  Essential: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Preference: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  Analytics: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Marketing: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
};

function CookieTable({ rows, title }: { rows: CookieRow[]; title: string }) {
  return (
    <div className="mb-8">
      <h3 className="mb-3 text-sm font-semibold text-white/80">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-white/6">
        <table className="w-full min-w-140 text-sm">
          <thead>
            <tr className="border-b border-white/6 bg-white/2">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">Cookie</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">Purpose</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">Type</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.name}
                className={`border-b border-white/4 ${i % 2 === 0 ? '' : 'bg-white/1'}`}
              >
                <td className="px-4 py-3 font-mono text-xs text-white/70">{row.name}</td>
                <td className="px-4 py-3 text-(--color-text-muted)">{row.purpose}</td>
                <td className="px-4 py-3 text-(--color-text-muted) whitespace-nowrap">{row.duration}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[row.type]}`}>
                    {row.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CookiePolicyPage() {
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
              Cookie Policy
            </h1>
            <p className="mt-3 text-sm text-(--color-text-muted)">
              Last updated:{' '}
              <span className="text-white/70">{LAST_UPDATED}</span>
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-(--color-text-muted)">
              This Cookie Policy explains how Portify uses cookies and similar technologies when
              you visit our website and platform.
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

                {section.id === 'cookie-table' ? (
                  <>
                    <CookieTable rows={ESSENTIAL_COOKIES} title="Essential Cookies" />
                    <CookieTable rows={PREFERENCE_COOKIES} title="Preference Cookies" />
                    <CookieTable rows={ANALYTICS_COOKIES} title="Analytics Cookies" />
                    <CookieTable rows={MARKETING_COOKIES} title="Marketing Cookies" />
                  </>
                ) : (
                  <div className="whitespace-pre-line text-sm leading-relaxed text-(--color-text-muted)">
                    {section.content}
                  </div>
                )}
              </motion.section>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
