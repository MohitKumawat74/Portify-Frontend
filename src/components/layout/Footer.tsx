import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { Container } from './Container';
import { APP_NAME, ROUTES } from '@/utils/constants';

const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: ROUTES.FEATURES_PAGE },
      { label: 'Templates', href: ROUTES.TEMPLATES_PAGE },
      { label: 'Pricing', href: ROUTES.PRICING_PAGE },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: ROUTES.ABOUT_PAGE },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  // {
  //   heading: 'Account',
  //   links: [
  //     { label: 'Sign Up', href: ROUTES.REGISTER },
  //     { label: 'Log In', href: ROUTES.LOGIN },
  //     { label: 'Dashboard', href: ROUTES.DASHBOARD },
  //     { label: 'Settings', href: ROUTES.SETTINGS },
  //   ],
  // },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: ROUTES.PRIVACY_POLICY },
      { label: 'Terms of Service', href: ROUTES.TERMS_OF_SERVICE },
      { label: 'Cookie Policy', href: ROUTES.COOKIE_POLICY },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/6 bg-[var(--color-bg)]">
      <Container maxWidth="2xl">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 sm:gap-8 sm:py-14 lg:grid-cols-4 lg:gap-10 lg:py-16">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={ROUTES.HOME} className="font-space-grotesk text-xl font-bold flex items-center gap-2">
              <img src="/Portfolio.png" alt={APP_NAME} className="h-6 w-6 rounded-sm" />
              <span className="gradient-text">{APP_NAME}</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)] sm:max-w-[220px]">
              Build beautiful developer portfolios that get you hired.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { icon: Github, href: 'https://github.com', label: 'GitHub' },
                { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[var(--color-text-muted)] transition-all hover:border-white/20 hover:text-white hover:-translate-y-0.5"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading} className="min-w-0">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] py-6 text-center text-xs text-[var(--color-text-muted)] sm:flex-row sm:text-left">
          <span>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with{' '}
            <span className="text-red-400">♥</span>
            {' '}for developers worldwide
          </span>
        </div>
      </Container>
    </footer>
  );
}

