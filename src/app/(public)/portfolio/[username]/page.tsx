import { notFound } from 'next/navigation';
import { portfolioService } from '@/services/portfolioService';
import { TemplateRenderer } from '@/templates/TemplateRenderer';
import type { Portfolio, PortfolioDiagnostics, PortfolioSection } from '@/types';
import { getTemplatePreviewPortfolio } from '@/data/templatePreviewPortfolio';

type DynamicSectionType = 'hero' | 'about' | 'skills' | 'projects' | 'experience' | 'testimonials' | 'contact' | 'footer';

type TemplateCustomizations = {
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
};

type BackendPortfolioPayload = Portfolio & {
  templateSlug?: string | null;
  customizations?: TemplateCustomizations;
  bio?: string;
  username?: string;
  templateName?: string;
};

const KNOWN_TEMPLATE_IDS = new Set(['template1', 'template2', 'template3', 'template4']);

function normalizeTemplateId(payload: BackendPortfolioPayload): string {
  const fromSlug = typeof payload.templateSlug === 'string' ? payload.templateSlug.trim() : '';
  const fromId = typeof payload.templateId === 'string' ? payload.templateId.trim() : '';

  if (KNOWN_TEMPLATE_IDS.has(fromSlug)) return fromSlug;
  if (KNOWN_TEMPLATE_IDS.has(fromId)) return fromId;
  return fromSlug || fromId || 'template1';
}

function normalizeSections(sections: PortfolioSection[]): DynamicSectionType[] {
  const allowed = new Set<DynamicSectionType>(['hero', 'about', 'skills', 'projects', 'experience', 'testimonials', 'contact', 'footer']);
  const ordered = [...sections].sort((a, b) => a.order - b.order);
  const unique: DynamicSectionType[] = [];

  for (const section of ordered) {
    const normalized = String(section.type).toLowerCase() as DynamicSectionType;
    if (!allowed.has(normalized)) continue;
    if (!unique.includes(normalized)) unique.push(normalized);
  }

  return unique.length > 0 ? unique : ['hero', 'about', 'skills', 'projects', 'experience', 'contact', 'footer'];
}

function normalizeCustomizations(payload: BackendPortfolioPayload): TemplateCustomizations {
  const fromBackend = payload.customizations ?? {};
  const layoutValue =
    typeof (fromBackend as { layoutStyle?: string }).layoutStyle === 'string'
      ? (fromBackend as { layoutStyle?: string }).layoutStyle
      : typeof (fromBackend as { layout?: string }).layout === 'string'
        ? (fromBackend as { layout?: string }).layout
        : undefined;

  return {
    layoutStyle: layoutValue as TemplateCustomizations['layoutStyle'],
    colors: {
      primaryColor: fromBackend.colors?.primaryColor ?? payload.theme?.primaryColor,
      secondaryColor: fromBackend.colors?.secondaryColor ?? payload.theme?.secondaryColor,
      backgroundColor: fromBackend.colors?.backgroundColor ?? payload.theme?.backgroundColor,
      textColor: fromBackend.colors?.textColor ?? payload.theme?.textColor,
      accentColor: fromBackend.colors?.accentColor,
    },
    typography: {
      fontFamily: fromBackend.typography?.fontFamily ?? payload.theme?.fontFamily,
      headingFont: fromBackend.typography?.headingFont,
      baseFontSize: fromBackend.typography?.baseFontSize,
    },
    sectionVisibility: fromBackend.sectionVisibility,
  };
}

function sectionData(portfolio: BackendPortfolioPayload, type: string): Record<string, unknown> | undefined {
  const found = portfolio.sections.find((section) => String(section.type).toLowerCase() === type.toLowerCase());
  if (!found || typeof found.data !== 'object' || found.data === null) return undefined;
  return found.data as Record<string, unknown>;
}

function hasMeaningfulSectionData(portfolio: BackendPortfolioPayload): boolean {
  return portfolio.sections.some((section) => {
    if (!section || typeof section.data !== 'object' || section.data === null) return false;
    return Object.keys(section.data).length > 0;
  });
}

function buildUserData(portfolio: BackendPortfolioPayload, fallback: Portfolio) {
  const hero = sectionData(portfolio, 'hero');
  const about = sectionData(portfolio, 'about');
  const skills = sectionData(portfolio, 'skills');
  const projects = sectionData(portfolio, 'projects');
  const experience = sectionData(portfolio, 'experience');
  const testimonials = sectionData(portfolio, 'testimonials');
  const contact = sectionData(portfolio, 'contact');
  const footer = sectionData(portfolio, 'footer');

  const fallbackHero = sectionData(fallback as BackendPortfolioPayload, 'hero');
  const fallbackAbout = sectionData(fallback as BackendPortfolioPayload, 'about');
  const fallbackSkills = sectionData(fallback as BackendPortfolioPayload, 'skills');
  const fallbackProjects = sectionData(fallback as BackendPortfolioPayload, 'projects');
  const fallbackExperience = sectionData(fallback as BackendPortfolioPayload, 'experience');
  const fallbackTestimonials = sectionData(fallback as BackendPortfolioPayload, 'testimonials');
  const fallbackContact = sectionData(fallback as BackendPortfolioPayload, 'contact');
  const fallbackFooter = sectionData(fallback as BackendPortfolioPayload, 'footer');

  const displayName = portfolio.title || portfolio.username || String(fallbackHero?.name ?? 'Portfolio Owner');

  return {
    hero: {
      ...(fallbackHero ?? {}),
      ...(hero ?? {}),
      name: String((hero?.name as string | undefined) ?? displayName),
      bio: String((hero?.bio as string | undefined) ?? portfolio.bio ?? (fallbackHero?.bio as string | undefined) ?? ''),
    },
    about: {
      ...(fallbackAbout ?? {}),
      ...(about ?? {}),
      text: String((about?.text as string | undefined) ?? portfolio.bio ?? (fallbackAbout?.text as string | undefined) ?? ''),
    },
    skills: Array.isArray(skills?.skills)
      ? skills.skills
      : Array.isArray(fallbackSkills?.skills)
        ? fallbackSkills.skills
        : [],
    projects: Array.isArray(projects?.projects)
      ? projects.projects
      : Array.isArray(fallbackProjects?.projects)
        ? fallbackProjects.projects
        : [],
    experience: Array.isArray(experience?.experiences)
      ? experience.experiences
      : Array.isArray(fallbackExperience?.experiences)
        ? fallbackExperience.experiences
        : [],
    testimonials: Array.isArray(testimonials?.testimonials)
      ? testimonials.testimonials
      : Array.isArray(fallbackTestimonials?.testimonials)
        ? fallbackTestimonials.testimonials
        : [],
    contact: {
      ...(fallbackContact ?? {}),
      ...(contact ?? {}),
    },
    footer: {
      ...(fallbackFooter ?? {}),
      ...(footer ?? {}),
      copyright: String(
        (footer?.copyright as string | undefined) ??
        (fallbackFooter?.copyright as string | undefined) ??
        `(c) ${new Date().getFullYear()} ${displayName}. All rights reserved.`,
      ),
    },
  };
}

function ApiErrorState() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-3xl border border-white/15 bg-black/25 p-6 text-center backdrop-blur sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Temporary issue</p>
        <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Unable to load this portfolio</h1>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          We could not fetch the portfolio data right now. Please refresh this page in a moment.
        </p>
        <a
          href="/templates"
          className="mt-6 inline-flex rounded-full border border-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/85 transition hover:border-white/45"
        >
          Browse templates
        </a>
      </div>
    </div>
  );
}

function DiagnosticsPanel({ diagnostics }: { diagnostics?: PortfolioDiagnostics }) {
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev || !diagnostics) return null;

  return (
    <details className="mx-auto mb-4 w-full max-w-6xl rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
      <summary className="cursor-pointer select-none font-semibold">Renderer diagnostics</summary>
      <div className="mt-2 grid gap-1 text-amber-100/90">
        <p>fallbackApplied: {String(Boolean(diagnostics.fallbackApplied))}</p>
        <p>missingSections: {(diagnostics.missingSections ?? []).join(', ') || 'none'}</p>
        <p>warnings: {(diagnostics.warnings ?? []).join(' | ') || 'none'}</p>
      </div>
    </details>
  );
}

interface Props {
  params: Promise<{
    username: string;
  }>;
}

export default async function PublicPortfolioPage({ params }: Props) {
  const { username } = await params;

  try {
    const response = await portfolioService.getPublicByUsername(username);

    if (!response.success || !response.data) {
      return notFound();
    }

    const portfolio = response.data as BackendPortfolioPayload;
    const diagnostics = portfolio.diagnostics;

    const resolvedTemplateId = normalizeTemplateId(portfolio);
    const customizations = normalizeCustomizations(portfolio);
    const fallbackPortfolio = getTemplatePreviewPortfolio(resolvedTemplateId);

    const mergedPortfolio: BackendPortfolioPayload = {
      ...fallbackPortfolio,
      ...portfolio,
      title: portfolio.title || fallbackPortfolio.title,
      slug: portfolio.slug || portfolio.username || fallbackPortfolio.slug,
      templateId: resolvedTemplateId,
      theme: {
        ...fallbackPortfolio.theme,
        ...portfolio.theme,
      },
      sections:
        Array.isArray(portfolio.sections) && portfolio.sections.length > 0
          ? portfolio.sections
          : fallbackPortfolio.sections,
      isPublished: portfolio.isPublished,
      createdAt: portfolio.createdAt || fallbackPortfolio.createdAt,
      updatedAt: portfolio.updatedAt || fallbackPortfolio.updatedAt,
    };

    const shouldUseFallbackData = !hasMeaningfulSectionData(portfolio);
    const renderUserData = shouldUseFallbackData
      ? buildUserData(mergedPortfolio, fallbackPortfolio)
      : buildUserData(portfolio, fallbackPortfolio);

    return (
      <>
        {!portfolio.isPublished ? (
          <div className="sticky top-0 z-40 border-b border-amber-400/25 bg-amber-500/10 px-4 py-2 text-center text-xs font-medium text-amber-200 backdrop-blur">
            Draft preview mode: this portfolio is not published yet.
          </div>
        ) : null}
        <DiagnosticsPanel diagnostics={diagnostics} />
        <TemplateRenderer
          templateId={resolvedTemplateId}
          portfolio={mergedPortfolio}
          templateConfig={{
            id: resolvedTemplateId,
            name: mergedPortfolio.title,
            sections: normalizeSections(mergedPortfolio.sections),
            layoutStyle: customizations.layoutStyle,
          }}
          userData={renderUserData}
          customizations={customizations}
          diagnostics={diagnostics}
          variant="showcase"
        />
      </>
    );
  } catch {
    return <ApiErrorState />;
  }
}
