'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Container } from './Container';
import { APP_NAME, ROUTES } from '@/utils/constants';
import { cn } from '@/utils/cn';

const NAV_LINKS = [
  { label: 'Features', href: ROUTES.FEATURES_PAGE },
  { label: 'Templates', href: ROUTES.TEMPLATES_PAGE },
  { label: 'Pricing', href: ROUTES.PRICING_PAGE },
  { label: 'About', href: ROUTES.ABOUT_PAGE },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/10 bg-[var(--color-bg)]/85 shadow-lg backdrop-blur-xl'
          : 'bg-transparent',
      )}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Container maxWidth="2xl">
        <nav className="flex h-16 items-center justify-between sm:h-[70px]">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="font-space-grotesk text-lg font-bold tracking-tight text-white sm:text-xl flex items-center gap-2"
          >
            <img src="/Portfolio.png" alt={APP_NAME} className="h-6 w-6 rounded-sm" />
            <span className="gradient-text">{APP_NAME}</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    active
                      ? 'text-white bg-white/10'
                      : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5',
                  )}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-white/10 -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth buttons — desktop */}
          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                <Link
                  href={user?.role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD}
                  className="text-sm font-medium text-[var(--color-text-muted)] hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button variant="glow" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="-mr-1 rounded-lg p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-main-menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </Container>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/10 bg-[var(--color-bg)]/95 backdrop-blur-xl lg:hidden"
            id="mobile-main-menu"
          >
            <Container maxWidth="2xl">
              <div className="max-h-[calc(100vh-4rem)] overflow-y-auto py-5 sm:max-h-[calc(100vh-70px)] sm:py-6">
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        pathname === link.href
                          ? 'bg-white/10 text-white'
                          : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white',
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href={user?.role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white"
                      >
                        Dashboard
                      </Link>
                      <Button variant="outline" size="sm" onClick={logout}>
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href={ROUTES.LOGIN} onClick={() => setMobileOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-center">
                          Login
                        </Button>
                      </Link>
                      <Link href={ROUTES.REGISTER} onClick={() => setMobileOpen(false)}>
                        <Button variant="glow" size="sm" className="w-full justify-center">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
