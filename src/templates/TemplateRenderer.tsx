'use client';

import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import type { Portfolio, PortfolioDiagnostics } from '@/types';
import { Template1 } from './template1/Template1';
import { Template2 } from './template2/Template2';
import { Template3 } from './template3/Template3';
import { Template4 } from './template4/Template4';

type TemplateComponent = ComponentType<{ portfolio: Portfolio }>;

/**
 * Registry maps templateId → component.
 * To add a new template, import it and add an entry here.
 */
const templateRegistry: Record<string, TemplateComponent> = {
  template1: Template1,
  template2: Template2,
  template3: Template3,
  template4: Template4,
};

type DynamicSectionType = 'hero' | 'about' | 'skills' | 'projects' | 'experience' | 'testimonials' | 'contact' | 'footer';

const SECTION_LABELS: Record<DynamicSectionType, string> = {
  hero: 'Home',
  about: 'About',
  skills: 'Skills',
  projects: 'Projects',
  experience: 'Experience',
  testimonials: 'Testimonials',
  contact: 'Contact',
  footer: 'Footer',
};

interface TemplateConfig {
  id: string;
  name?: string;
  isPremium?: boolean;
  sections?: DynamicSectionType[];
  layoutStyle?: 'minimal' | 'split' | 'modern' | 'immersive';
}

interface TemplateUserData {
  hero?: {
    name?: string;
    title?: string;
    bio?: string;
    tagline?: string;
    avatarUrl?: string;
    ctaPrimaryText?: string;
    ctaPrimaryHref?: string;
    ctaSecondaryText?: string;
    ctaSecondaryHref?: string;
  };
  about?: {
    heading?: string;
    text?: string;
    profileImage?: string;
    highlights?: string[];
    tags?: string[];
  };
  skills?: Array<{ id: string; name: string; level: number; category?: string; icon?: string }>;
  projects?: Array<{ id: string; title: string; description: string; techStack: string[]; image?: string; liveUrl?: string; repoUrl?: string }>;
  experience?: Array<{ id: string; company: string; role: string; startDate: string; endDate?: string; description?: string; isCurrent?: boolean }>;
  testimonials?: Array<{ id: string; name: string; role?: string; quote: string; avatarUrl?: string }>;
  contact?: {
    heading?: string;
    description?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    socialLinks?: Array<{ id: string; label: string; href: string }>;
  };
  footer?: {
    copyright?: string;
    links?: Array<{ id: string; label: string; href: string }>;
  };
}

interface TemplateCustomizations {
  colors?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
  typography?: {
    fontFamily?: string;
    headingFont?: string;
    baseFontSize?: string;
  };
  sectionVisibility?: Partial<Record<DynamicSectionType, boolean>>;
  layoutStyle?: 'minimal' | 'split' | 'modern' | 'immersive';
}

interface TemplateRendererProps {
  templateId?: string;
  portfolio?: Portfolio;
  templateConfig?: TemplateConfig;
  userData?: TemplateUserData;
  customizations?: TemplateCustomizations;
  diagnostics?: PortfolioDiagnostics;
  previewDevice?: 'desktop' | 'mobile';
  variant?: 'editor' | 'showcase';
}

/**
 * Dynamically renders the correct template based on templateId.
 * Falls back to a friendly error UI for unknown templates.
 */
export function TemplateRenderer({
  templateId,
  portfolio,
  templateConfig,
  userData,
  customizations,
  diagnostics,
  previewDevice = 'desktop',
  variant = 'editor',
}: TemplateRendererProps) {
  const resolvedTemplateId = templateId ?? templateConfig?.id ?? portfolio?.templateId ?? 'template1';
  const shouldUseDynamicRenderer = Boolean(templateConfig || userData || customizations);
  const resolvedUserData = useMemo(
    () => mergeUserDataFromPortfolio(portfolio, userData),
    [portfolio, userData],
  );

  if (shouldUseDynamicRenderer) {
    if (variant === 'showcase') {
      return (
        <DynamicTemplateShowcase
          templateId={resolvedTemplateId}
          templateConfig={templateConfig}
          userData={resolvedUserData}
          customizations={customizations}
          diagnostics={diagnostics ?? portfolio?.diagnostics}
          previewDevice={previewDevice}
        />
      );
    }

    return (
      <DynamicTemplateCanvas
        templateId={resolvedTemplateId}
        templateConfig={templateConfig}
        userData={resolvedUserData}
        customizations={customizations}
        diagnostics={diagnostics ?? portfolio?.diagnostics}
        previewDevice={previewDevice}
      />
    );
  }

  if (!portfolio) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-gray-500">
        <p className="text-lg font-medium">Template cannot render</p>
        <p className="text-sm">Missing portfolio data.</p>
      </div>
    );
  }

  const TemplateComponent = templateRegistry[resolvedTemplateId];

  if (!TemplateComponent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-gray-500">
        <p className="text-lg font-medium">Template not found</p>
        <p className="text-sm">No template registered for id: &quot;{resolvedTemplateId}&quot;</p>
      </div>
    );
  }

  return <TemplateComponent portfolio={portfolio} />;
}

const DEFAULT_SECTIONS: DynamicSectionType[] = ['hero', 'about', 'skills', 'projects', 'experience', 'contact', 'footer'];

const SHOWCASE_SECTION_ORDER: DynamicSectionType[] = ['hero', 'about', 'skills', 'projects', 'experience', 'testimonials', 'contact', 'footer'];

function useIsSmallViewport(maxWidth = 767) {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const sync = () => setIsSmall(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [maxWidth]);

  return isSmall;
}

function mergeUserDataFromPortfolio(portfolio?: Portfolio, userData?: TemplateUserData): TemplateUserData {
  if (!portfolio) return userData ?? {};

  const getSection = (type: string) => {
    const found = portfolio.sections.find((section) => String(section.type).toLowerCase() === type.toLowerCase());
    if (!found || typeof found.data !== 'object' || found.data === null) return undefined;
    return found.data as Record<string, unknown>;
  };

  const hero = getSection('hero');
  const about = getSection('about');
  const skills = getSection('skills');
  const projects = getSection('projects');
  const experience = getSection('experience');
  const contact = getSection('contact');
  const testimonials = getSection('testimonials');
  const footer = getSection('footer');

  return {
    hero: {
      name: String(hero?.name ?? userData?.hero?.name ?? ''),
      title: String(hero?.title ?? userData?.hero?.title ?? ''),
      bio: String(hero?.bio ?? userData?.hero?.bio ?? ''),
      tagline: String(hero?.tagline ?? userData?.hero?.tagline ?? ''),
      avatarUrl: String(hero?.avatarUrl ?? userData?.hero?.avatarUrl ?? ''),
      ctaPrimaryText: String(hero?.ctaPrimaryText ?? hero?.ctaText ?? userData?.hero?.ctaPrimaryText ?? 'Hire Me'),
      ctaPrimaryHref: String(hero?.ctaPrimaryHref ?? hero?.ctaHref ?? userData?.hero?.ctaPrimaryHref ?? '#contact'),
      ctaSecondaryText: String(hero?.ctaSecondaryText ?? userData?.hero?.ctaSecondaryText ?? 'Download CV'),
      ctaSecondaryHref: String(hero?.ctaSecondaryHref ?? userData?.hero?.ctaSecondaryHref ?? '#projects'),
    },
    about: {
      heading: String(about?.heading ?? userData?.about?.heading ?? ''),
      text: String(about?.text ?? userData?.about?.text ?? ''),
      profileImage: String(about?.profileImage ?? userData?.about?.profileImage ?? userData?.hero?.avatarUrl ?? ''),
      tags: Array.isArray(about?.tags) ? (about?.tags as string[]) : (userData?.about?.tags ?? []),
      highlights: Array.isArray(about?.highlights)
        ? (about?.highlights as string[])
        : (Array.isArray((about?.stats as unknown[] | undefined)) ? (about?.stats as string[]) : (userData?.about?.highlights ?? [])),
    },
    skills: Array.isArray(skills?.skills)
      ? (skills.skills as TemplateUserData['skills'])
      : (Array.isArray(skills?.items)
        ? (skills.items as unknown[]).map((item, index) => ({
            id: `skill-${index}`,
            name: String(item),
            level: 70,
            category: 'general',
          }))
        : (userData?.skills ?? [])),
    projects: Array.isArray(projects?.projects)
      ? (projects.projects as TemplateUserData['projects'])
      : (Array.isArray(projects?.items)
        ? (projects.items as Array<Record<string, unknown>>).map((item, index) => ({
            id: String(item.id ?? `project-${index}`),
            title: String(item.title ?? 'Untitled Project'),
            description: String(item.description ?? ''),
            techStack: Array.isArray(item.techStack) ? (item.techStack as string[]) : [],
            image: String(item.image ?? ''),
            liveUrl: typeof item.liveUrl === 'string' ? item.liveUrl : undefined,
            repoUrl: typeof item.repoUrl === 'string' ? item.repoUrl : undefined,
          }))
        : (userData?.projects ?? [])),
    experience: Array.isArray(experience?.experiences)
      ? (experience.experiences as TemplateUserData['experience'])
      : (userData?.experience ?? []),
    testimonials: Array.isArray(testimonials?.testimonials)
      ? (testimonials.testimonials as TemplateUserData['testimonials'])
      : (Array.isArray(testimonials?.items)
        ? (testimonials.items as Array<Record<string, unknown>>).map((item, index) => ({
            id: String(item.id ?? `testimonial-${index}`),
            name: String(item.name ?? 'Client'),
            role: String(item.role ?? ''),
            quote: String(item.quote ?? item.feedback ?? ''),
            avatarUrl: String(item.avatarUrl ?? ''),
          }))
        : (userData?.testimonials ?? [])),
    contact: {
      heading: String(contact?.heading ?? userData?.contact?.heading ?? ''),
      description: String(contact?.description ?? userData?.contact?.description ?? ''),
      email: String(contact?.email ?? userData?.contact?.email ?? ''),
      phone: String(contact?.phone ?? userData?.contact?.phone ?? ''),
      location: String(contact?.location ?? userData?.contact?.location ?? ''),
      linkedin: String(contact?.linkedin ?? userData?.contact?.linkedin ?? ''),
      github: String(contact?.github ?? userData?.contact?.github ?? ''),
      website: String(contact?.website ?? userData?.contact?.website ?? ''),
      socialLinks: Array.isArray(contact?.socialLinks)
        ? (contact.socialLinks as Array<{ id: string; label: string; href: string }>)
        : (userData?.contact?.socialLinks ?? []),
    },
    footer: {
      copyright: String(footer?.copyright ?? userData?.footer?.copyright ?? ''),
      links: Array.isArray(footer?.links)
        ? (footer.links as Array<{ id: string; label: string; href: string }>)
        : (userData?.footer?.links ?? []),
    },
  };
}

function isSafeColor(value: string): boolean {
  const hex = /^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;
  const rgb = /^rgba?\(\s*\d{1,3}\s*(,\s*\d{1,3}\s*){2}(,\s*(0|1|0?\.\d+)\s*)?\)$/;
  const hsl = /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/;
  return hex.test(value) || rgb.test(value) || hsl.test(value);
}

function safeColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return isSafeColor(value.trim()) ? value.trim() : fallback;
}

function safeFontFamily(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const next = value.trim();
  if (!next || next.length > 120) return fallback;
  return /^[a-zA-Z0-9\s,\-"']+$/.test(next) ? next : fallback;
}

function safeBaseFontSize(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const next = value.trim();
  return /^\d{1,2}(px|rem|em|%)$/.test(next) ? next : fallback;
}

function safeLayoutStyle(value: TemplateCustomizations['layoutStyle'] | undefined, fallback: NonNullable<TemplateCustomizations['layoutStyle']>): NonNullable<TemplateCustomizations['layoutStyle']> {
  if (value === 'minimal' || value === 'split' || value === 'modern' || value === 'immersive') return value;
  return fallback;
}

function DynamicTemplateShowcase({
  templateId,
  templateConfig,
  userData,
  customizations,
  diagnostics,
  previewDevice,
}: {
  templateId: string;
  templateConfig?: TemplateConfig;
  userData?: TemplateUserData;
  customizations?: TemplateCustomizations;
  diagnostics?: PortfolioDiagnostics;
  previewDevice: 'desktop' | 'mobile';
}) {
  const prefersReducedMotion = useReducedMotion();
  const isSmallViewport = useIsSmallViewport();
  const colors = {
    primaryColor: safeColor(customizations?.colors?.primaryColor, '#4f46e5'),
    secondaryColor: safeColor(customizations?.colors?.secondaryColor, '#0891b2'),
    backgroundColor: safeColor(customizations?.colors?.backgroundColor, '#09090b'),
    textColor: safeColor(customizations?.colors?.textColor, '#f8fafc'),
    accentColor: safeColor(customizations?.colors?.accentColor, '#f97316'),
  };

  const typography = {
    fontFamily: safeFontFamily(customizations?.typography?.fontFamily, 'Sora, sans-serif'),
    headingFont: safeFontFamily(customizations?.typography?.headingFont, 'Space Grotesk, sans-serif'),
    baseFontSize: safeBaseFontSize(customizations?.typography?.baseFontSize, '16px'),
  };

  const layoutStyle = safeLayoutStyle(customizations?.layoutStyle ?? templateConfig?.layoutStyle, inferLayoutStyle(templateId));

  const sectionVisibility = customizations?.sectionVisibility ?? {};
  const missingSections = useMemo(() => {
    const raw = diagnostics?.missingSections ?? [];
    return new Set(raw.filter((section): section is DynamicSectionType => section in SECTION_LABELS));
  }, [diagnostics?.missingSections]);

  const sections = useMemo(() => {
    const baseSections = templateConfig?.sections?.length ? templateConfig.sections : DEFAULT_SECTIONS;
    const merged = [...baseSections];
    for (const section of missingSections) {
      if (!merged.includes(section)) merged.push(section);
    }
    return merged;
  }, [templateConfig?.sections, missingSections]);

  const isDev = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    if (!isDev) return;
    const warnings = diagnostics?.warnings;
    if (Array.isArray(warnings) && warnings.length > 0) {
      console.warn('[TemplateRenderer diagnostics]', warnings);
    }
  }, [diagnostics?.warnings, isDev]);

  const visibleSections = useMemo(() => {
    const next = SHOWCASE_SECTION_ORDER.filter((section) => {
      if (!sections.includes(section)) return false;
      if (sectionVisibility[section] === false) return false;
      if (section === 'testimonials') return (userData?.testimonials?.length ?? 0) > 0 || missingSections.has('testimonials');
      return true;
    });

    return next.length ? next : ['hero'];
  }, [sections, sectionVisibility, userData?.testimonials?.length, missingSections]);

  const navSections = useMemo(
    () => visibleSections.filter((section) => section !== 'footer'),
    [visibleSections],
  );

  const [activeSection, setActiveSection] = useState<DynamicSectionType>(navSections[0] ?? 'hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setActiveSection((prev) => (navSections.includes(prev) ? prev : (navSections[0] ?? 'hero')));
  }, [navSections]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeSection]);

  const useCompactMotion = Boolean(prefersReducedMotion || isSmallViewport || previewDevice === 'mobile');
  const isCompactLayout = useCompactMotion;

  const shellClass = previewDevice === 'mobile'
    ? 'mx-auto w-full max-w-[390px] overflow-hidden rounded-[2rem] border border-white/20 bg-black/60 shadow-[0_20px_45px_rgba(0,0,0,0.45)]'
    : 'w-full';

  useEffect(() => {
    if (typeof window === 'undefined' || navSections.length === 0) return;

    const onScroll = () => {
      let closest = navSections[0];
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const section of navSections) {
        const el = document.getElementById(`showcase-${section}`);
        if (!el) continue;
        const distance = Math.abs(el.getBoundingClientRect().top - 130);
        if (distance < bestDistance) {
          bestDistance = distance;
          closest = section;
        }
      }

      setActiveSection(closest);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [navSections]);

  const scrollToSection = (section: DynamicSectionType) => {
    const el = document.getElementById(`showcase-${section}`);
    if (!el) return;

    el.scrollIntoView({
      behavior: useCompactMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    setActiveSection(section);
  };

  const sectionShellClass =
    layoutStyle === 'minimal'
      ? 'relative overflow-hidden rounded-3xl border border-black/10 bg-white/95 p-6 backdrop-blur-xl sm:p-8'
      : 'relative overflow-hidden rounded-3xl border border-white/15 bg-black/35 p-6 backdrop-blur-xl sm:p-8';

  const cardClass =
    layoutStyle === 'minimal'
      ? 'rounded-2xl border border-black/10 bg-white p-4'
      : 'rounded-2xl border border-white/15 bg-white/5 p-4';

  const defaultDescription = userData?.contact?.description?.trim() || 'I am open to freelance and full-time opportunities. Send a message and I will reply as soon as possible.';

  const showcaseTextColor = layoutStyle === 'minimal' ? '#111827' : colors.textColor;

  return (
    <div
      className="min-h-screen"
      style={{
        background: layoutStyle === 'minimal'
          ? `linear-gradient(180deg, #f8fafc 0%, #eef2ff 45%, #f1f5f9 100%)`
          : `radial-gradient(1200px 500px at 8% -8%, ${colors.primaryColor}2f, transparent 65%), radial-gradient(900px 500px at 95% 10%, ${colors.secondaryColor}28, transparent 62%), radial-gradient(1000px 450px at 50% 120%, ${colors.accentColor}1f, transparent 58%), ${colors.backgroundColor}`,
        color: showcaseTextColor,
        fontFamily: typography.fontFamily,
        fontSize: typography.baseFontSize,
      }}
    >
      <div className={shellClass}>
        <div className="mx-auto max-w-6xl overflow-x-hidden px-3 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8 lg:px-8">
          <header className={layoutStyle === 'minimal' ? 'mb-4 rounded-2xl border border-black/10 bg-white/85 px-3 py-3 backdrop-blur-md sm:mb-6 sm:px-6' : 'mb-4 rounded-2xl border border-white/15 bg-black/30 px-3 py-3 backdrop-blur-md sm:mb-6 sm:px-6'}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={layoutStyle === 'minimal' ? 'text-[10px] uppercase tracking-[0.26em] text-slate-500' : 'text-[10px] uppercase tracking-[0.26em] text-white/50'}>Template Showcase</p>
                <h1 className="text-base font-bold sm:text-xl" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>
                  {templateConfig?.name ?? (userData?.hero?.name ? `${userData.hero.name} Portfolio` : 'Portfolio Showcase')}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className={layoutStyle === 'minimal' ? 'inline-flex items-center justify-center rounded-xl border border-slate-300 p-2 text-slate-700 sm:hidden' : 'inline-flex items-center justify-center rounded-xl border border-white/20 p-2 text-white/80 sm:hidden'}
                aria-label="Toggle preview navigation"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
              <div className="hidden flex-wrap gap-1.5 sm:flex">
                {navSections.map((section) => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => scrollToSection(section)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                      activeSection === section
                        ? layoutStyle === 'minimal' ? 'border-slate-400 text-slate-900 shadow-[0_0_30px_rgba(148,163,184,0.15)]' : 'border-white/50 text-white shadow-[0_0_30px_rgba(255,255,255,0.12)]'
                        : layoutStyle === 'minimal' ? 'border-slate-300 text-slate-600 hover:border-slate-500 hover:text-slate-900' : 'border-white/20 text-white/65 hover:border-white/35 hover:text-white'
                    }`}
                    style={activeSection === section ? { background: `linear-gradient(90deg, ${colors.primaryColor}55, ${colors.secondaryColor}55)` } : undefined}
                  >
                    {SECTION_LABELS[section]}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <AnimatePresence>
            {mobileMenuOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/55 p-4 sm:hidden"
              >
                <motion.aside
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 16, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className={layoutStyle === 'minimal' ? 'h-full rounded-2xl border border-slate-300 bg-white p-4' : 'h-full rounded-2xl border border-white/20 bg-black/90 p-4'}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className={layoutStyle === 'minimal' ? 'text-xs font-semibold uppercase tracking-[0.2em] text-slate-500' : 'text-xs font-semibold uppercase tracking-[0.2em] text-white/65'}>Navigate</p>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className={layoutStyle === 'minimal' ? 'rounded-lg border border-slate-300 p-1.5 text-slate-700' : 'rounded-lg border border-white/20 p-1.5 text-white/80'}
                      aria-label="Close navigation"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {navSections.map((section) => (
                      <button
                        key={`mobile-${section}`}
                        type="button"
                        onClick={() => scrollToSection(section)}
                        className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] transition ${
                          activeSection === section
                            ? layoutStyle === 'minimal' ? 'border-slate-400 text-slate-900' : 'border-white/50 text-white'
                            : layoutStyle === 'minimal' ? 'border-slate-300 text-slate-600' : 'border-white/20 text-white/70'
                        }`}
                        style={activeSection === section ? { background: `linear-gradient(90deg, ${colors.primaryColor}44, ${colors.secondaryColor}44)` } : undefined}
                      >
                        {SECTION_LABELS[section]}
                      </button>
                    ))}
                  </div>
                </motion.aside>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className={layoutStyle === 'minimal' ? 'mb-4 flex items-center justify-between text-xs text-slate-500' : 'mb-4 flex items-center justify-between text-xs text-white/60'}>
            <span className="uppercase tracking-[0.22em]">Portfolio Overview</span>
            <span>Template: {templateId}</span>
          </div>

          {isDev && diagnostics?.fallbackApplied ? (
            <div className={layoutStyle === 'minimal' ? 'mb-4 rounded-xl border border-slate-300 bg-slate-100/80 px-3 py-2 text-xs text-slate-600' : 'mb-4 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/70'}>
              Rendering fallback content for missing or invalid section data.
            </div>
          ) : null}

          <motion.section
            key={templateId}
            initial={useCompactMotion ? { opacity: 0, y: 8 } : { opacity: 0, y: 20, scale: 0.985 }}
            animate={useCompactMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: useCompactMotion ? 0.22 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={`${sectionShellClass} space-y-5 sm:space-y-6`}
          >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl"
                style={{ background: `${colors.secondaryColor}4a` }}
              />
              <div
                className="pointer-events-none absolute -bottom-14 left-0 h-48 w-48 rounded-full blur-3xl"
                style={{ background: `${colors.primaryColor}36` }}
              />

              {visibleSections.includes('hero') ? (
                <div id="showcase-hero" className="relative z-10 grid gap-5 border-b border-white/10 pb-5 last:border-b-0 sm:gap-8 sm:pb-8 lg:border-transparent lg:pb-0">
                  <div>
                    <p className={layoutStyle === 'minimal' ? 'text-[11px] uppercase tracking-[0.28em] text-slate-500' : 'text-[11px] uppercase tracking-[0.28em] text-white/55'}>Digital Portfolio</p>
                    <h2 className="mt-3 text-3xl font-black uppercase leading-[1.04] sm:text-5xl" style={{ fontFamily: typography.headingFont }}>
                      {userData?.hero?.name || 'Unnamed Profile'}
                    </h2>
                    <p className={layoutStyle === 'minimal' ? 'mt-3 text-base text-slate-700 sm:text-xl' : 'mt-3 text-base text-white/80 sm:text-xl'}>{userData?.hero?.title || 'Professional Portfolio'}</p>
                    <p className={layoutStyle === 'minimal' ? 'mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base' : 'mt-4 max-w-xl text-sm leading-relaxed text-white/72 sm:text-base'}>
                      {userData?.hero?.bio || userData?.hero?.tagline || 'No hero description available.'}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <a
                        href={userData?.hero?.ctaPrimaryHref || '#showcase-contact'}
                        className={layoutStyle === 'minimal' ? 'rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:border-slate-900' : 'rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 hover:border-white/40'}
                      >
                        {userData?.hero?.ctaPrimaryText || 'Hire Me'}
                      </a>
                      <a
                        href={userData?.hero?.ctaSecondaryHref || '#showcase-projects'}
                        className={layoutStyle === 'minimal' ? 'rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:border-slate-900' : 'rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 hover:border-white/40'}
                      >
                        {userData?.hero?.ctaSecondaryText || 'Download CV'}
                      </a>
                    </div>
                  </div>
                  <div className={layoutStyle === 'minimal' ? 'rounded-2xl border border-black/10 bg-white p-5' : 'rounded-2xl border border-white/15 bg-black/45 p-5'}>
                    <p className={layoutStyle === 'minimal' ? 'text-[11px] uppercase tracking-[0.2em] text-slate-500' : 'text-[11px] uppercase tracking-[0.2em] text-white/55'}>Quick Highlights</p>
                    <div className={isCompactLayout ? 'mt-3 grid gap-3' : 'mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-1'}>
                      {[
                        ['Role', userData?.hero?.title || 'Professional'],
                        ['Projects', String(userData?.projects?.length ?? 0)],
                        ['Experience', String(userData?.experience?.length ?? 0)],
                      ].map(([label, value]) => (
                        <div key={label} className={layoutStyle === 'minimal' ? 'rounded-xl border border-black/10 bg-slate-50 px-3 py-2' : 'rounded-xl border border-white/15 bg-white/5 px-3 py-2'}>
                          <p className={layoutStyle === 'minimal' ? 'text-[10px] uppercase tracking-[0.14em] text-slate-500' : 'text-[10px] uppercase tracking-[0.14em] text-white/55'}>{label}</p>
                          <p className="mt-1 text-2xl font-bold" style={{ color: colors.accentColor }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {visibleSections.includes('about') ? (
                <div id="showcase-about" className="relative z-10 space-y-5 border-b border-white/10 pb-5 last:border-b-0 sm:pb-8 lg:border-transparent lg:pb-0">
                  <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>
                    {userData?.about?.heading || 'About'}
                  </h2>
                  <div className={isCompactLayout ? 'grid gap-5' : 'grid gap-5 lg:grid-cols-[0.9fr_1.1fr]'}>
                    {userData?.about?.profileImage ? (
                      <div className={cardClass}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={userData.about.profileImage} loading="lazy" alt="Profile" className="h-72 w-full rounded-xl object-cover" />
                      </div>
                    ) : null}
                    <div className={cardClass}>
                      <p className={layoutStyle === 'minimal' ? 'max-w-4xl text-sm leading-relaxed text-slate-700 sm:text-base' : 'max-w-4xl text-sm leading-relaxed text-white/75 sm:text-base'}>
                        {userData?.about?.text || 'No about section content available.'}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(userData?.about?.highlights?.length ? userData.about.highlights : userData?.about?.tags ?? []).map((item) => (
                      <article key={item} className={cardClass}>
                        <p className="text-sm font-semibold">{item}</p>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {visibleSections.includes('skills') ? (
                <div id="showcase-skills" className="relative z-10 space-y-5 border-b border-white/10 pb-5 last:border-b-0 sm:pb-8 lg:border-transparent lg:pb-0">
                  <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>Skills</h2>
                  <div className={isCompactLayout ? 'grid gap-3' : 'grid gap-4 md:grid-cols-2'}>
                    {(userData?.skills ?? []).map((skill) => (
                      <article key={skill.id} className={cardClass}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-semibold">{skill.name}{skill.category ? ` · ${skill.category}` : ''}</span>
                          <span className="text-white/60">{skill.level}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{ duration: 0.65, ease: 'easeOut' }}
                            className="h-2 rounded-full"
                            style={{ background: `linear-gradient(90deg, ${colors.primaryColor}, ${colors.secondaryColor})` }}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                  {(userData?.skills?.length ?? 0) === 0 ? <p className="text-sm opacity-75">No skills available.</p> : null}
                </div>
              ) : null}

              {visibleSections.includes('projects') ? (
                <div id="showcase-projects" className="relative z-10 space-y-5 border-b border-white/10 pb-5 last:border-b-0 sm:pb-8 lg:border-transparent lg:pb-0">
                  <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>Featured Projects</h2>
                  <div className={isCompactLayout ? 'grid gap-3' : 'grid gap-4 lg:grid-cols-2'}>
                    {(userData?.projects ?? []).map((project) => (
                      <article key={project.id} className={layoutStyle === 'minimal' ? 'group rounded-2xl border border-black/10 bg-white p-5 transition hover:-translate-y-1 hover:border-black/30' : 'group rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-white/35'}>
                        {project.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={project.image} loading="lazy" alt={`${project.title} preview`} className="mb-3 h-40 w-full rounded-xl object-cover" />
                        ) : null}
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <p className={layoutStyle === 'minimal' ? 'mt-2 text-sm text-slate-600' : 'mt-2 text-sm text-white/70'}>{project.description}</p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {project.techStack.map((tech) => (
                            <span key={tech} className={layoutStyle === 'minimal' ? 'rounded-full border border-slate-300 bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-700' : 'rounded-full border border-white/20 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/70'}>
                              {tech}
                            </span>
                          ))}
                        </div>
                        {(project.liveUrl || project.repoUrl) ? (
                          <div className="mt-4 flex gap-2 text-xs">
                            {project.liveUrl ? (
                              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1 hover:opacity-85" style={{ borderColor: `${colors.primaryColor}66` }}>
                                Live Demo
                              </a>
                            ) : null}
                            {project.repoUrl ? (
                              <a href={project.repoUrl} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1 hover:opacity-85" style={{ borderColor: `${colors.secondaryColor}66` }}>
                                Source
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                  {(userData?.projects?.length ?? 0) === 0 ? <p className="text-sm opacity-75">No projects available.</p> : null}
                </div>
              ) : null}

              {visibleSections.includes('experience') ? (
                <div id="showcase-experience" className="relative z-10 space-y-5 border-b border-white/10 pb-5 last:border-b-0 sm:pb-8 lg:border-transparent lg:pb-0">
                  <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>Experience</h2>
                  <div className="space-y-4">
                    {(userData?.experience ?? []).map((item, index) => (
                      <article key={item.id} className={layoutStyle === 'minimal' ? 'relative rounded-2xl border border-black/10 bg-white p-5' : 'relative rounded-2xl border border-white/15 bg-white/5 p-5'}>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-lg font-semibold">{item.role}</h3>
                          <span className={layoutStyle === 'minimal' ? 'text-xs text-slate-500' : 'text-xs text-white/60'}>
                            {item.startDate} - {item.isCurrent ? 'Present' : item.endDate || ''}
                          </span>
                        </div>
                        <p className="text-sm font-medium" style={{ color: colors.accentColor }}>{item.company}</p>
                        {item.description ? <p className={layoutStyle === 'minimal' ? 'mt-2 text-sm text-slate-600' : 'mt-2 text-sm text-white/70'}>{item.description}</p> : null}
                        <span className="absolute -left-2 top-6 h-2.5 w-2.5 rounded-full" style={{ background: index % 2 === 0 ? colors.primaryColor : colors.secondaryColor }} />
                      </article>
                    ))}
                  </div>
                  {(userData?.experience?.length ?? 0) === 0 ? <p className="text-sm opacity-75">No experience timeline available.</p> : null}
                </div>
              ) : null}

              {visibleSections.includes('testimonials') ? (
                <div id="showcase-testimonials" className="relative z-10 space-y-5 border-b border-white/10 pb-5 last:border-b-0 sm:pb-8 lg:border-transparent lg:pb-0">
                  <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>Testimonials</h2>
                  <div className={isCompactLayout ? 'grid gap-3' : 'grid gap-4 md:grid-cols-2'}>
                    {(userData?.testimonials ?? []).map((item) => (
                      <article key={item.id} className={cardClass}>
                        <p className={layoutStyle === 'minimal' ? 'text-sm italic text-slate-700' : 'text-sm italic text-white/80'}>
                          &quot;{item.quote}&quot;
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          {item.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.avatarUrl} loading="lazy" alt={item.name} className="h-8 w-8 rounded-full object-cover" />
                          ) : null}
                          <div>
                            <p className="text-sm font-semibold">{item.name}</p>
                            {item.role ? <p className={layoutStyle === 'minimal' ? 'text-xs text-slate-500' : 'text-xs text-white/60'}>{item.role}</p> : null}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {visibleSections.includes('contact') ? (
                <div id="showcase-contact" className={isCompactLayout ? 'relative z-10 grid gap-4' : 'relative z-10 grid gap-5 lg:grid-cols-[1fr_0.9fr]'}>
                  <div>
                    <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>
                      {userData?.contact?.heading || 'Contact'}
                    </h2>
                    <p className={layoutStyle === 'minimal' ? 'mt-3 max-w-xl text-sm text-slate-600 sm:text-base' : 'mt-3 max-w-xl text-sm text-white/72 sm:text-base'}>
                      {defaultDescription}
                    </p>
                    <div className="mt-4 flex flex-col gap-2 text-sm">
                      {userData?.contact?.email ? <a href={`mailto:${userData.contact.email}`} className={layoutStyle === 'minimal' ? 'text-slate-700 underline decoration-slate-400 underline-offset-4 hover:text-slate-950' : 'text-white/80 underline decoration-white/35 underline-offset-4 hover:text-white'}>{userData.contact.email}</a> : null}
                      {userData?.contact?.phone ? <a href={`tel:${userData.contact.phone}`} className={layoutStyle === 'minimal' ? 'text-slate-700 underline decoration-slate-400 underline-offset-4 hover:text-slate-950' : 'text-white/80 underline decoration-white/35 underline-offset-4 hover:text-white'}>{userData.contact.phone}</a> : null}
                      {userData?.contact?.location ? <p className={layoutStyle === 'minimal' ? 'text-slate-600' : 'text-white/70'}>{userData.contact.location}</p> : null}
                      {userData?.contact?.linkedin ? <a href={userData.contact.linkedin} target="_blank" rel="noreferrer" className={layoutStyle === 'minimal' ? 'text-slate-700 underline decoration-slate-400 underline-offset-4 hover:text-slate-950' : 'text-white/80 underline decoration-white/35 underline-offset-4 hover:text-white'}>LinkedIn</a> : null}
                      {userData?.contact?.github ? <a href={userData.contact.github} target="_blank" rel="noreferrer" className={layoutStyle === 'minimal' ? 'text-slate-700 underline decoration-slate-400 underline-offset-4 hover:text-slate-950' : 'text-white/80 underline decoration-white/35 underline-offset-4 hover:text-white'}>GitHub</a> : null}
                      {userData?.contact?.website ? <a href={userData.contact.website} target="_blank" rel="noreferrer" className={layoutStyle === 'minimal' ? 'text-slate-700 underline decoration-slate-400 underline-offset-4 hover:text-slate-950' : 'text-white/80 underline decoration-white/35 underline-offset-4 hover:text-white'}>{userData.contact.website}</a> : null}
                    </div>
                  </div>
                  <div className={cardClass}>
                    <p className={layoutStyle === 'minimal' ? 'text-[11px] uppercase tracking-[0.2em] text-slate-500' : 'text-[11px] uppercase tracking-[0.2em] text-white/55'}>Contact Form</p>
                    <form className="mt-3 space-y-2">
                      <input type="text" placeholder="Your name" className={layoutStyle === 'minimal' ? 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none' : 'w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none'} />
                      <input type="email" placeholder="Email" className={layoutStyle === 'minimal' ? 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none' : 'w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none'} />
                      <textarea placeholder="Message" rows={4} className={layoutStyle === 'minimal' ? 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none' : 'w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none'} />
                      <button type="submit" className="rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: `linear-gradient(90deg, ${colors.primaryColor}, ${colors.secondaryColor})` }}>
                        Send Message
                      </button>
                    </form>
                  </div>
                </div>
              ) : null}
          </motion.section>

          {(visibleSections.includes('footer')) ? (
            <footer className={layoutStyle === 'minimal' ? 'mt-4 rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm text-slate-600 sm:px-6' : 'mt-4 rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white/70 sm:px-6'}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p>{userData?.footer?.copyright || `© ${new Date().getFullYear()} ${userData?.hero?.name || 'Portfolio'}. All rights reserved.`}</p>
                <div className="flex flex-wrap gap-3">
                  {(userData?.footer?.links ?? []).map((link) => (
                    <a key={link.id} href={link.href} className="hover:opacity-90">{link.label}</a>
                  ))}
                </div>
              </div>
            </footer>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DynamicTemplateCanvas({
  templateId,
  templateConfig,
  userData,
  customizations,
  diagnostics,
  previewDevice,
}: {
  templateId: string;
  templateConfig?: TemplateConfig;
  userData?: TemplateUserData;
  customizations?: TemplateCustomizations;
  diagnostics?: PortfolioDiagnostics;
  previewDevice: 'desktop' | 'mobile';
}) {
  const colors = {
    primaryColor: safeColor(customizations?.colors?.primaryColor, '#6366f1'),
    secondaryColor: safeColor(customizations?.colors?.secondaryColor, '#8b5cf6'),
    backgroundColor: safeColor(customizations?.colors?.backgroundColor, '#0b1220'),
    textColor: safeColor(customizations?.colors?.textColor, '#f8fafc'),
    accentColor: safeColor(customizations?.colors?.accentColor, '#f59e0b'),
  };

  const typography = {
    fontFamily: safeFontFamily(customizations?.typography?.fontFamily, 'Inter, sans-serif'),
    headingFont: safeFontFamily(customizations?.typography?.headingFont, 'Space Grotesk, sans-serif'),
    baseFontSize: safeBaseFontSize(customizations?.typography?.baseFontSize, '16px'),
  };

  const layoutStyle = safeLayoutStyle(customizations?.layoutStyle ?? templateConfig?.layoutStyle, inferLayoutStyle(templateId));
  const missingSections = useMemo(() => {
    const raw = diagnostics?.missingSections ?? [];
    return raw.filter((section): section is DynamicSectionType => section in SECTION_LABELS);
  }, [diagnostics?.missingSections]);
  const sections = useMemo(() => {
    const baseSections = templateConfig?.sections?.length ? templateConfig.sections : DEFAULT_SECTIONS;
    const merged = [...baseSections];
    for (const section of missingSections) {
      if (!merged.includes(section)) merged.push(section);
    }
    return merged;
  }, [templateConfig?.sections, missingSections]);
  const sectionVisibility = customizations?.sectionVisibility ?? {};
  const groupedSkills = useMemo(() => {
    const group: Record<string, Array<{ id: string; name: string; level: number; category?: string; icon?: string }>> = {};
    for (const skill of userData?.skills ?? []) {
      const key = skill.category || 'General';
      if (!group[key]) group[key] = [];
      group[key].push(skill);
    }
    return group;
  }, [userData?.skills]);

  const cardClass = layoutStyle === 'minimal'
    ? 'rounded-2xl border border-white/10 bg-white/4 p-5'
    : layoutStyle === 'split'
      ? 'rounded-2xl border border-white/10 bg-black/25 p-5'
      : layoutStyle === 'immersive'
        ? 'rounded-2xl border border-white/15 bg-linear-to-br from-white/8 to-white/3 p-5 shadow-[0_12px_50px_rgba(0,0,0,0.35)]'
        : 'rounded-2xl border border-white/12 bg-white/6 p-5';

  const shellClass = previewDevice === 'mobile'
    ? 'mx-auto w-full max-w-[390px] overflow-hidden rounded-[2rem] border border-white/12 bg-black shadow-[0_18px_40px_rgba(0,0,0,0.4)]'
    : 'w-full';

  return (
    <div
      className="min-h-screen"
      style={{
        background: layoutStyle === 'immersive'
          ? `radial-gradient(circle at 20% 20%, ${colors.secondaryColor}22, transparent 30%), radial-gradient(circle at 80% 10%, ${colors.accentColor}20, transparent 35%), ${colors.backgroundColor}`
          : colors.backgroundColor,
        color: colors.textColor,
        fontFamily: typography.fontFamily,
        fontSize: typography.baseFontSize,
      }}
    >
      <div className={shellClass}>
        <div className="mx-auto max-w-6xl overflow-x-hidden px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className={layoutStyle === 'split' ? 'grid gap-6 lg:grid-cols-[240px_1fr]' : 'space-y-6'}>
            {layoutStyle === 'split' ? (
              <aside className="rounded-2xl border border-white/10 bg-black/30 p-4 lg:sticky lg:top-6 lg:h-fit">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Sections</p>
                <nav className="mt-3 space-y-2 text-sm">
                  {sections.map((section) => (
                    <a key={section} href={`#${section}`} className="block rounded-lg px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white">
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </a>
                  ))}
                </nav>
              </aside>
            ) : null}

            <div className="space-y-6">
              {sections.includes('hero') && sectionVisibility.hero !== false ? (
                <section id="hero" className={`${cardClass} tpl-section`}> 
                  <p className="mb-2 text-[11px] uppercase tracking-[0.22em]" style={{ color: colors.secondaryColor }}>Hero</p>
                  <h1 className="text-3xl font-black leading-tight sm:text-5xl" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>
                    {userData?.hero?.name || 'Unnamed Profile'}
                  </h1>
                  <p className="mt-2 text-base text-white/80 sm:text-xl">{userData?.hero?.title || 'Professional Portfolio'}</p>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/70 sm:text-base">
                    {userData?.hero?.bio || userData?.hero?.tagline || 'No hero data available.'}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a href={userData?.hero?.ctaPrimaryHref || '#contact'} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:border-white/45">
                      {userData?.hero?.ctaPrimaryText || 'Hire Me'}
                    </a>
                    <a href={userData?.hero?.ctaSecondaryHref || '#projects'} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:border-white/45">
                      {userData?.hero?.ctaSecondaryText || 'Download CV'}
                    </a>
                  </div>
                </section>
              ) : null}

              {sections.includes('about') && sectionVisibility.about !== false ? (
                <section id="about" className={`${cardClass} tpl-section`}>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>
                    {userData?.about?.heading ?? 'About'}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
                    {userData?.about?.text || 'No about section content available.'}
                  </p>
                  {userData?.about?.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {userData.about.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white/80">{tag}</span>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}

              {sections.includes('skills') && sectionVisibility.skills !== false ? (
                <section id="skills" className={`${cardClass} tpl-section`}>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>Skills</h2>
                  <div className="mt-4 space-y-4">
                    {Object.entries(groupedSkills).map(([category, skills]) => (
                      <div key={category}>
                        <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/60">{category}</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {skills.map((skill) => (
                            <div key={skill.id} className="rounded-lg bg-black/25 p-3">
                              <div className="mb-1 flex items-center justify-between text-sm">
                                <span>{skill.name}</span>
                                <span className="text-white/60">{skill.level}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-white/12">
                                <div className="h-2 rounded-full bg-linear-to-r" style={{ width: `${skill.level}%`, backgroundImage: `linear-gradient(to right, ${colors.primaryColor}, ${colors.secondaryColor})` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {(userData?.skills?.length ?? 0) === 0 ? <p className="mt-3 text-sm text-white/70">No skills configured.</p> : null}
                </section>
              ) : null}

              {sections.includes('projects') && sectionVisibility.projects !== false ? (
                <section id="projects" className={`${cardClass} tpl-section`}>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>Projects</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {(userData?.projects ?? []).map((project) => (
                      <article key={project.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                        {project.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={project.image} loading="lazy" alt={`${project.title} preview`} className="mb-3 h-32 w-full rounded-lg object-cover" />
                        ) : null}
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="mt-2 text-sm text-white/70">{project.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {project.techStack.map((tech) => (
                            <span key={tech} className="rounded bg-white/12 px-2 py-0.5 text-[11px] text-white/80">{tech}</span>
                          ))}
                        </div>
                        {(project.liveUrl || project.repoUrl) ? (
                          <div className="mt-3 flex gap-2 text-xs">
                            {project.liveUrl ? <a href={project.liveUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-2.5 py-1 hover:border-white/40">Live</a> : null}
                            {project.repoUrl ? <a href={project.repoUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-2.5 py-1 hover:border-white/40">Code</a> : null}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                  {(userData?.projects?.length ?? 0) === 0 ? <p className="mt-3 text-sm text-white/70">No projects configured.</p> : null}
                </section>
              ) : null}

              {sections.includes('experience') && sectionVisibility.experience !== false ? (
                <section id="experience" className={`${cardClass} tpl-section`}>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>Experience</h2>
                  <div className="mt-4 space-y-3 border-l border-white/20 pl-4">
                    {(userData?.experience ?? []).map((item) => (
                      <article key={item.id} className="relative rounded-xl border border-white/10 bg-black/20 p-4">
                        <span className="absolute -left-5.25 top-5 h-2.5 w-2.5 rounded-full" style={{ background: colors.accentColor }} />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-semibold">{item.role}</h3>
                          <span className="text-xs text-white/60">{item.startDate} - {item.isCurrent ? 'Present' : item.endDate || ''}</span>
                        </div>
                        <p className="mt-1 text-sm" style={{ color: colors.secondaryColor }}>{item.company}</p>
                        {item.description ? <p className="mt-2 text-sm text-white/70">{item.description}</p> : null}
                      </article>
                    ))}
                  </div>
                  {(userData?.experience?.length ?? 0) === 0 ? <p className="mt-3 text-sm text-white/70">No experience configured.</p> : null}
                </section>
              ) : null}

              {sections.includes('testimonials') && sectionVisibility.testimonials !== false ? (
                <section id="testimonials" className={`${cardClass} tpl-section`}>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>Testimonials</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {(userData?.testimonials ?? []).map((item) => (
                      <article key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm italic text-white/80">&quot;{item.quote}&quot;</p>
                        <p className="mt-3 text-sm font-semibold">{item.name}</p>
                        {item.role ? <p className="text-xs text-white/60">{item.role}</p> : null}
                      </article>
                    ))}
                  </div>
                  {(userData?.testimonials?.length ?? 0) === 0 ? <p className="mt-3 text-sm text-white/70">No testimonials configured.</p> : null}
                </section>
              ) : null}

              {sections.includes('contact') && sectionVisibility.contact !== false ? (
                <section id="contact" className={`${cardClass} tpl-section`}>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: typography.headingFont, color: colors.primaryColor }}>
                    {userData?.contact?.heading || 'Contact'}
                  </h2>
                  {userData?.contact?.description ? <p className="mt-2 text-sm text-white/70">{userData.contact.description}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/80">
                    {userData?.contact?.email ? <a href={`mailto:${userData.contact.email}`} className="underline decoration-white/40 underline-offset-4 hover:text-white">{userData.contact.email}</a> : null}
                    {userData?.contact?.phone ? <a href={`tel:${userData.contact.phone}`} className="underline decoration-white/40 underline-offset-4 hover:text-white">{userData.contact.phone}</a> : null}
                    {userData?.contact?.location ? <span>{userData.contact.location}</span> : null}
                    {userData?.contact?.linkedin ? (
                      <a href={userData.contact.linkedin} target="_blank" rel="noreferrer" className="underline decoration-white/40 underline-offset-4 hover:text-white">LinkedIn</a>
                    ) : null}
                    {userData?.contact?.github ? (
                      <a href={userData.contact.github} target="_blank" rel="noreferrer" className="underline decoration-white/40 underline-offset-4 hover:text-white">GitHub</a>
                    ) : null}
                    {userData?.contact?.website ? (
                      <a href={userData.contact.website} target="_blank" rel="noreferrer" className="underline decoration-white/40 underline-offset-4 hover:text-white">Website</a>
                    ) : null}
                    {(userData?.contact?.socialLinks ?? []).map((link) => (
                      <a key={link.id} href={link.href} target="_blank" rel="noreferrer" className="underline decoration-white/40 underline-offset-4 hover:text-white">{link.label}</a>
                    ))}
                  </div>
                  <form className="mt-4 grid gap-2 sm:max-w-lg">
                    <input type="text" placeholder="Your name" className="rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-sm text-white outline-none" />
                    <input type="email" placeholder="Your email" className="rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-sm text-white outline-none" />
                    <textarea rows={4} placeholder="How can we work together?" className="rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-sm text-white outline-none" />
                    <button type="submit" className="w-fit rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: `linear-gradient(90deg, ${colors.primaryColor}, ${colors.secondaryColor})` }}>
                      Send
                    </button>
                  </form>
                </section>
              ) : null}

              {sections.includes('footer') && sectionVisibility.footer !== false ? (
                <section id="footer" className={`${cardClass} tpl-section`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/75">
                    <p>{userData?.footer?.copyright || `© ${new Date().getFullYear()} ${userData?.hero?.name || 'Portfolio'}.`}</p>
                    <div className="flex flex-wrap gap-3">
                      {(userData?.footer?.links ?? []).map((link) => (
                        <a key={link.id} href={link.href} className="hover:text-white">{link.label}</a>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function inferLayoutStyle(templateId: string): 'minimal' | 'split' | 'modern' | 'immersive' {
  if (templateId === 'template1') return 'minimal';
  if (templateId === 'template2') return 'split';
  if (templateId === 'template4') return 'immersive';
  return 'modern';
}
