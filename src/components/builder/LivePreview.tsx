'use client';

import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { BuilderSection, BuilderStyle } from '@/store/portfolioBuilderStore';
import { TemplateRenderer } from '@/templates/TemplateRenderer';

interface LivePreviewProps {
  templateId?: string;
  title: string;
  role: string;
  sections: BuilderSection[];
  style: BuilderStyle;
  activeSectionId: string | null;
  onActivateSection: (id: string) => void;
  onInlineUpdate: (sectionId: string, updates: Record<string, unknown>) => void;
}

let isScrollTriggerRegistered = false;

export function LivePreview({
  templateId = 'template4',
  title,
  role,
  sections,
  style,
  activeSectionId,
  onActivateSection,
  onInlineUpdate,
}: LivePreviewProps) {
  const previewRootRef = useRef<HTMLDivElement | null>(null);

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections],
  );

  const dynamicSections = sortedSections.map((section) => section.type);

  const userData = useMemo(() => {
    const hero = sortedSections.find((section) => section.type === 'hero')?.data as Record<string, unknown> | undefined;
    const about = sortedSections.find((section) => section.type === 'about')?.data as Record<string, unknown> | undefined;
    const skills = sortedSections.find((section) => section.type === 'skills')?.data as Record<string, unknown> | undefined;
    const projects = sortedSections.find((section) => section.type === 'projects')?.data as Record<string, unknown> | undefined;
    const contact = sortedSections.find((section) => section.type === 'contact')?.data as Record<string, unknown> | undefined;

    const skillsFromObjects = Array.isArray(skills?.skills)
      ? (skills.skills as Array<Record<string, unknown>>).map((item, index) => ({
          id: String(item.id ?? `skill-${index}`),
          name: String(item.name ?? `Skill ${index + 1}`),
          level: Number(item.level ?? 80),
        }))
      : [];

    const skillsFromItems = Array.isArray(skills?.items)
      ? skills.items.map((item, index) => ({
          id: `skill-${index}`,
          name: String(item),
          level: 80,
        }))
      : [];

    const projectFromObjects = Array.isArray(projects?.projects)
      ? (projects.projects as Array<Record<string, unknown>>).map((item, index) => ({
          id: String(item.id ?? `project-${index}`),
          title: String(item.title ?? 'Untitled project'),
          description: String(item.description ?? ''),
          techStack: Array.isArray(item.techStack) ? item.techStack.map(String) : [],
        }))
      : [];

    const projectsFromItems = Array.isArray(projects?.items)
      ? projects.items.map((item, index) => {
          const project = item as { title?: string; description?: string };
          return {
            id: `project-${index}`,
            title: String(project.title ?? 'Untitled project'),
            description: String(project.description ?? ''),
            techStack: [],
          };
        })
      : [];

    return {
      hero: {
        name: String(hero?.name ?? title),
        title: String(hero?.title ?? role),
        bio: String(hero?.bio ?? ''),
      },
      about: {
        heading: String(about?.heading ?? 'About'),
        text: String(about?.text ?? ''),
      },
      skills: skillsFromObjects.length > 0 ? skillsFromObjects : skillsFromItems,
      projects: projectFromObjects.length > 0 ? projectFromObjects : projectsFromItems,
      contact: {
        heading: 'Contact',
        email: String(contact?.email ?? ''),
        linkedin: String(contact?.linkedin ?? ''),
        github: String(contact?.github ?? ''),
      },
    };
  }, [sortedSections, title, role]);

  const spacingClass =
    style.spacing === 'compact'
      ? '[&_.tpl-section]:p-4 [&_.tpl-section]:space-y-2'
      : style.spacing === 'spacious'
        ? '[&_.tpl-section]:p-8 [&_.tpl-section]:space-y-6'
        : '[&_.tpl-section]:p-6 [&_.tpl-section]:space-y-4';

  useEffect(() => {
    if (typeof window === 'undefined' || !previewRootRef.current) return;

    if (!isScrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      isScrollTriggerRegistered = true;
    }

    const ctx = gsap.context(() => {
      const sectionsInPreview = gsap.utils.toArray<HTMLElement>('.tpl-section');

      sectionsInPreview.forEach((section, index) => {
        gsap.fromTo(
          section,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            delay: index * 0.03,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });
    }, previewRootRef);

    return () => {
      ctx.revert();
    };
  }, [sortedSections, style.layout, style.spacing]);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3 lg:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Live Preview</h3>
        <p className="text-xs text-[var(--color-text-muted)]">Click any section to focus and edit</p>
      </div>

      <motion.div
        ref={previewRootRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={["relative overflow-hidden rounded-xl border border-white/10", spacingClass].join(' ')}
      >
        <TemplateRenderer
          templateConfig={{ id: templateId, sections: dynamicSections, layoutStyle: style.layout }}
          userData={userData}
          customizations={{
            layoutStyle: style.layout,
            colors: {
              primaryColor: style.colors.primary,
              secondaryColor: style.colors.secondary,
              backgroundColor: style.colors.background,
              textColor: style.colors.text,
              accentColor: style.colors.accent,
            },
          }}
        />

        <div className="pointer-events-none absolute inset-0 grid content-start gap-2 p-3">
          {sortedSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => onActivateSection(section.id)}
              onDoubleClick={() => {
                if (section.type === 'hero') {
                  onInlineUpdate(section.id, { title: prompt('Edit title', String((section.data as Record<string, unknown>).title ?? '')) ?? '' });
                }
              }}
              className={[
                'pointer-events-auto h-10 rounded-lg border text-left text-xs capitalize backdrop-blur-sm transition-all',
                activeSectionId === section.id
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/20 text-white'
                  : 'border-white/15 bg-black/25 text-white/70 hover:bg-black/40',
              ].join(' ')}
            >
              <span className="px-3">{section.type}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
