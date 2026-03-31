"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { TemplateRenderer } from '@/templates/TemplateRenderer';
import { getTemplatePreviewPortfolio } from '@/data/templatePreviewPortfolio';
import { PreviewActionBar } from './PreviewActionBar';
import { useTemplateStudioStore } from '@/store/templateStudioStore';
import { templateService } from '@/services/templateService';
import { portfolioService } from '@/services/portfolioService';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import type { Template } from '@/types';

interface Props {
  params: {
    templateId: string;
  };
}

export default function TemplatePreviewPage({ params }: Props) {
  const { token } = useAuthStore();
  const {
    previewDevice,
    customizations,
    setPreviewDevice,
    setSelectedTemplateId,
  } = useTemplateStudioStore();

  const templateId = params.templateId;
  const searchParams = useSearchParams();
  const sourceTemplateId = (searchParams?.get('source') ?? '').trim();
  const effectiveTemplateId = sourceTemplateId || templateId;
  const [saving, setSaving] = useState(false);
  const [resolvedTemplate, setResolvedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    setSelectedTemplateId(effectiveTemplateId);
    return () => setSelectedTemplateId(null);
  }, [effectiveTemplateId, setSelectedTemplateId]);

  useEffect(() => {
    templateService
      .getAll(1, 100)
      .then((res) => {
        const found = (res.data ?? []).find((t) => t.id === effectiveTemplateId || t.id === templateId);
        setResolvedTemplate(found ?? null);
      })
      .catch(() => {
        setResolvedTemplate(null);
      });
  }, [effectiveTemplateId, templateId]);

  useEffect(() => {
    const elements = document.querySelectorAll('.tpl-section');
    if (!elements.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const compact = prefersReduced || isMobile || previewDevice === 'mobile';

    gsap.fromTo(
      elements,
      { opacity: 0, y: compact ? 10 : 28 },
      {
        opacity: 1,
        y: 0,
        duration: compact ? 0.25 : 0.55,
        stagger: compact ? 0.03 : 0.08,
        ease: 'power3.out',
      },
    );
  }, [templateId, previewDevice, customizations]);

  const portfolio = useMemo(() => {
    return getTemplatePreviewPortfolio(templateId);
  }, [templateId]);

  const userData = useMemo(() => {
    const section = (type: string): Record<string, unknown> | undefined => {
      const found = portfolio.sections.find((s) => s.type === type);
      if (!found || typeof found.data !== 'object' || found.data === null) return undefined;
      return found.data as Record<string, unknown>;
    };
    const skillsSection = section('skills');
    const projectsSection = section('projects');
    const experienceSection = section('experience');
    const testimonialsSection = section('testimonials');
    const footerSection = section('footer');

    return {
      hero: section('hero'),
      about: section('about'),
      skills: Array.isArray(skillsSection?.skills) ? skillsSection.skills : [],
      projects: Array.isArray(projectsSection?.projects) ? projectsSection.projects : [],
      experience: Array.isArray(experienceSection?.experiences) ? experienceSection.experiences : [],
      testimonials: Array.isArray(testimonialsSection?.testimonials) ? testimonialsSection.testimonials : [],
      contact: section('contact'),
      footer: footerSection,
    };
  }, [portfolio]);

  async function handleSaveCustomization() {
    if (!token) {
      toast.error('Please log in to save customizations.');
      return;
    }

    setSaving(true);
    try {
      await portfolioService.saveCustomization(
        {
          templateId: effectiveTemplateId,
          customizations,
        },
        token,
      );
      toast.success('Template customization saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save customizations.');
    } finally {
      setSaving(false);
    }
  }

  const templateConfig = {
    id: effectiveTemplateId,
    name: resolvedTemplate?.name ?? portfolio.title,
    isPremium: resolvedTemplate?.isPremium,
    sections: portfolio.sections
      .sort((a, b) => a.order - b.order)
      .map((section) => section.type),
    layoutStyle: customizations.layoutStyle,
  };

  return (
    <div className="min-h-screen bg-background">
      <PreviewActionBar
        templateId={effectiveTemplateId}
        previewDevice={previewDevice}
        onChangeDevice={setPreviewDevice}
        onSave={handleSaveCustomization}
        saving={saving}
      />

      <div className="mx-auto max-w-450 px-4 pb-8 pt-16 sm:px-6">
        <motion.div
          className="grid gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-black/10">
            <TemplateRenderer
              templateId={portfolio.templateId}
              portfolio={portfolio}
              templateConfig={templateConfig}
              userData={userData}
              customizations={customizations}
              previewDevice={previewDevice}
              variant="showcase"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
