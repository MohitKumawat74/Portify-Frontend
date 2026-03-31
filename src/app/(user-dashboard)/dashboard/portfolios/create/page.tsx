'use client';

import { useState, useEffect, useMemo, useCallback, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuthStore } from '@/store/authStore';
import {
  usePortfolioBuilderStore,
  builderSectionTypes,
  type BuilderSection,
  type BuilderSectionType,
  type BuilderStyle,
} from '@/store/portfolioBuilderStore';
import { templateService } from '@/services/templateService';
import { dashboardService } from '@/services/dashboardService';
import { portfolioService } from '@/services/portfolioService';
import { aiService, type GeneratePortfolioPayload } from '@/services/aiService';
import { Button } from '@/components/ui/Button';
import { UpgradeModal } from '@/components/dashboard/UpgradeModal';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { Skeleton } from '@/components/dashboard/Skeleton';
import { BuilderSectionList } from '@/components/builder/BuilderSectionList';
import { SectionSettingsPanel } from '@/components/builder/SectionSettingsPanel';
import { AIGeneratorForm } from '@/components/builder/AIGeneratorForm';
import { LivePreview } from '@/components/builder/LivePreview';
import { toast } from '@/store/toastStore';
import type { Template } from '@/types';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/cn';
import { canCreateByUsage, isTemplateLockedForPlan } from '@/utils/plan';
import {
  Check,
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowLeft,
  ArrowRight,
  Save,
  LoaderCircle,
  SlidersHorizontal,
  PanelsTopLeft,
  Eye,
} from 'lucide-react';

const FREE_MAX_SECTIONS = 3;
const FREE_AI_DAILY_LIMIT = 2;

const DEFAULT_STYLE: BuilderStyle = {
  layout: 'modern',
  spacing: 'comfortable',
  colors: {
    primary: '#7c3aed',
    secondary: '#06b6d4',
    background: '#0b1220',
    text: '#f8fafc',
    accent: '#f59e0b',
  },
};

const GRADIENTS = [
  'from-violet-600 to-indigo-600',
  'from-slate-700 to-gray-800',
  'from-blue-600 to-cyan-600',
  'from-emerald-600 to-teal-600',
  'from-rose-600 to-orange-500',
  'from-fuchsia-600 to-purple-600',
];

const EMOJI_BY_CATEGORY: Record<string, string> = {
  minimal: '🎨',
  creative: '🌙',
  professional: '💼',
  immersive: '🚀',
  developer: '🧠',
};

function visualIndex(id: string): number {
  return id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function getTemplateGradient(template: Template): string {
  return GRADIENTS[visualIndex(template.id) % GRADIENTS.length];
}

function getTemplateEmoji(template: Template): string {
  const categoryKey = (template.category || '').toLowerCase();
  return EMOJI_BY_CATEGORY[categoryKey] ?? '✨';
}

function resolveTemplatePreviewKey(template: Template): 'template1' | 'template2' | 'template3' | 'template4' {
  const id = template.id.toLowerCase();
  const name = template.name.toLowerCase();
  const category = (template.category || '').toLowerCase();

  if (id === 'template1' || id === 'template2' || id === 'template3' || id === 'template4') {
    return id;
  }
  if (/3d|immersive|interactive/.test(name) || /3d|immersive|interactive/.test(category)) {
    return 'template4';
  }
  if (/creative|agency|photographer|saas/.test(name) || /creative|agency|photographer|saas/.test(category)) {
    return 'template2';
  }
  if (/professional|classic|corporate/.test(name) || /professional|corporate/.test(category)) {
    return 'template3';
  }
  return 'template1';
}

export default function CreatePortfolioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createPortfolio } = usePortfolio();
  const { token, planId, usageStats, setPlanUsage } = useAuthStore();

  const {
    portfolioId,
    sections,
    activeSectionId,
    previewData,
    style,
    isDirty,
    setPortfolioId,
    setSections,
    setActiveSectionId,
    setPreviewData,
    updateSectionData,
    reorderSections,
    addSection,
    removeSection,
    updateStyle,
    resetBuilder,
    markSaved,
  } = usePortfolioBuilderStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(searchParams?.get('template') ?? '');

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [reorderSaving, setReorderSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRetryPayload, setAiRetryPayload] = useState<GeneratePortfolioPayload | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [showLeftPanelMobile, setShowLeftPanelMobile] = useState(true);
  const [showRightPanelMobile, setShowRightPanelMobile] = useState(false);

  const [titleInput, setTitleInput] = useState('');
  const [roleInput, setRoleInput] = useState('');

  const selectedTemplateObj = useMemo(
    () => templates.find((template) => template.id === selectedTemplate),
    [templates, selectedTemplate],
  );

  const isFreePlan = !planId || planId === 'plan_free';
  const canAddSection = !isFreePlan || sections.length < FREE_MAX_SECTIONS;

  const canCreatePortfolio = usageStats
    ? canCreateByUsage(usageStats.portfolioUsage.used, usageStats.portfolioUsage.limit)
    : true;

  const canCreateNewDraft = portfolioId ? true : canCreatePortfolio;

  const aiCountKey = useMemo(() => {
    const day = new Date().toISOString().slice(0, 10);
    return `ai-builder-count:${day}`;
  }, []);

  const [freeAiCount, setFreeAiCount] = useState(0);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(aiCountKey) : null;
    const count = raw ? Number(raw) : 0;
    setFreeAiCount(Number.isFinite(count) ? count : 0);
  }, [aiCountKey]);

  const canUseAI = !isFreePlan || freeAiCount < FREE_AI_DAILY_LIMIT;

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? null,
    [sections, activeSectionId],
  );

  useEffect(() => {
    resetBuilder();
  }, [resetBuilder]);

  useEffect(() => {
    templateService.getAll(1, 50)
      .then((response) => setTemplates(response.data.filter((template) => template.isActive)))
      .catch(() => {
        setTemplates([
          { id: 'template1', name: 'Modern Minimal', description: 'Clean white layout with indigo accents.', thumbnail: '', category: 'minimal', isPremium: false, isActive: true, createdAt: '' },
          { id: 'template2', name: 'Dark Creative', description: 'Bold dark theme with purple highlights.', thumbnail: '', category: 'creative', isPremium: false, isActive: true, createdAt: '' },
          { id: 'template3', name: 'Professional Classic', description: 'Structured layout ideal for corporate portfolios.', thumbnail: '', category: 'professional', isPremium: false, isActive: true, createdAt: '' },
          { id: 'template4', name: 'Immersive Studio', description: 'High-impact immersive layout for bold portfolios.', thumbnail: '', category: 'immersive', isPremium: true, isActive: true, createdAt: '' },
        ]);
      })
      .finally(() => setTemplatesLoading(false));
  }, []);

  useEffect(() => {
    if (!token) return;

    dashboardService
      .getStats(token)
      .then((stats) => setPlanUsage(stats))
      .catch(() => {});
  }, [token, setPlanUsage]);

  useEffect(() => {
    if (!templates.length) return;

    const selected = templates.find((template) => template.id === selectedTemplate);
    if (selected && !isTemplateLockedForPlan(selected.id, selected.isPremium, planId)) {
      return;
    }

    const firstUnlocked = templates.find((template) => !isTemplateLockedForPlan(template.id, template.isPremium, planId));
    setSelectedTemplate((firstUnlocked ?? templates[0]).id);
  }, [selectedTemplate, templates, planId]);

  useEffect(() => {
    if (!titleInput && previewData.title) {
      setTitleInput(previewData.title);
    }
    if (!roleInput && previewData.role) {
      setRoleInput(previewData.role);
    }
  }, [previewData.title, previewData.role, titleInput, roleInput]);

  const aiInitialValues = useMemo<GeneratePortfolioPayload>(() => {
    const heroData = sections.find((section) => section.type === 'hero')?.data as Record<string, unknown> | undefined;
    const skillsData = sections.find((section) => section.type === 'skills')?.data as Record<string, unknown> | undefined;
    const aboutData = sections.find((section) => section.type === 'about')?.data as Record<string, unknown> | undefined;

    const skillListFromItems = Array.isArray(skillsData?.items)
      ? skillsData.items.map((item) => String(item)).filter(Boolean)
      : [];

    const skillListFromObjects = Array.isArray(skillsData?.skills)
      ? (skillsData.skills as Array<Record<string, unknown>>)
        .map((item) => String(item.name ?? ''))
        .filter(Boolean)
      : [];

    const mergedSkills = [...new Set([...skillListFromItems, ...skillListFromObjects])];

    return {
      name: String(heroData?.name ?? titleInput ?? previewData.title ?? '').trim(),
      role: String(heroData?.title ?? roleInput ?? previewData.role ?? '').trim(),
      skills: mergedSkills.join(', '),
      experience: String(aboutData?.text ?? '').trim(),
    };
  }, [sections, previewData.title, previewData.role, titleInput, roleInput]);

  const handleGenerate = async (payload: GeneratePortfolioPayload) => {
    if (!canUseAI) {
      setUpgradeOpen(true);
      return;
    }

    setAiLoading(true);
    setAiRetryPayload(payload);
    try {
      const generated = await aiService.generatePortfolio(payload);
      if (!generated.success) {
        throw new Error('AI generation failed. Please try again.');
      }

      if (generated.sections.length === 0) {
        throw new Error('AI did not return sections. Please retry.');
      }

      setSections(generated.sections);
      setPreviewData({
        title: generated.title || `${payload.name}'s Portfolio`,
        role: generated.role || payload.role,
      });

      if (!titleInput.trim()) {
        setTitleInput(generated.title || `${payload.name}'s Portfolio`);
      }
      if (!roleInput.trim()) {
        setRoleInput(generated.role || payload.role);
      }

      if (isFreePlan) {
        const nextCount = freeAiCount + 1;
        setFreeAiCount(nextCount);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(aiCountKey, String(nextCount));
        }
      }

      toast.success('Portfolio generated with AI.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AI generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleRetryAI = async () => {
    if (!aiRetryPayload) return;
    await handleGenerate(aiRetryPayload);
  };

  const handleReorder = async (idsInOrder: string[]) => {
    reorderSections(idsInOrder);

    if (!portfolioId || !token) return;
    setReorderSaving(true);
    try {
      await portfolioService.reorderSections(portfolioId, { sectionIds: idsInOrder }, token);
    } catch {
      const byId = new Map(sections.map((section) => [section.id, section]));
      const nextSections = idsInOrder
        .map((id, index) => {
          const section = byId.get(id);
          return section ? { ...section, order: index } : null;
        })
        .filter((section): section is BuilderSection => Boolean(section));
      await portfolioService.updateSections(portfolioId, nextSections, token);
    } finally {
      setReorderSaving(false);
    }
  };

  const persistDraft = useCallback(async () => {
    if (!token) {
      throw new Error('Please sign in again to continue.');
    }

    if (!selectedTemplate) {
      throw new Error('Please choose a template first.');
    }

    const safeTitle = (titleInput || previewData.title || '').trim();
    if (!safeTitle) {
      throw new Error('Please enter a portfolio title.');
    }

    if (!canCreateNewDraft) {
      throw new Error('Upgrade to Pro to create more portfolios.');
    }

    const themePayload = {
      primaryColor: style.colors.primary,
      secondaryColor: style.colors.secondary,
      backgroundColor: style.colors.background,
      textColor: style.colors.text,
      fontFamily: 'Inter, sans-serif',
    };

    if (!portfolioId) {
      const created = await createPortfolio({
        title: safeTitle,
        templateId: selectedTemplate,
        theme: themePayload,
      });

      if (!created?.id) {
        throw new Error('Portfolio was created but id is missing.');
      }

      setPortfolioId(created.id);
      await portfolioService.updateSections(created.id, sections, token);

      await portfolioService.update(
        created.id,
        {
          title: safeTitle,
          sections,
          theme: themePayload,
        },
        token,
      );

      markSaved();
      return created.id;
    }

    await portfolioService.update(
      portfolioId,
      {
        title: safeTitle,
        sections,
        theme: themePayload,
      },
      token,
    );

    markSaved();
    return portfolioId;
  }, [
    token,
    selectedTemplate,
    titleInput,
    previewData.title,
    canCreateNewDraft,
    style.colors,
    portfolioId,
    createPortfolio,
    setPortfolioId,
    sections,
    markSaved,
  ]);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await persistDraft();
      toast.success('Draft saved successfully.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (event: FormEvent) => {
    event.preventDefault();
    setPublishing(true);
    try {
      const id = await persistDraft();

      if (!token) {
        throw new Error('Please sign in again to continue.');
      }

      await portfolioService.publish(id, token);
      toast.success('Portfolio published successfully.');
      router.push(ROUTES.PORTFOLIOS);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to publish portfolio.');
    } finally {
      setPublishing(false);
    }
  };

  const handleRemoveSection = (sectionId: string) => {
    if (isFreePlan && sections.length <= 1) {
      toast.error('At least one section is required.');
      return;
    }
    removeSection(sectionId);
  };

  const selectedPreviewHref = selectedTemplateObj
    ? `/preview/${resolveTemplatePreviewKey(selectedTemplateObj)}?source=${encodeURIComponent(selectedTemplateObj.id)}`
    : null;

  const progress = step === 1 ? 34 : step === 2 ? 67 : 100;

  const requiredChecks = [
    { label: 'Template selected', done: Boolean(selectedTemplateObj) },
    { label: 'Portfolio title', done: Boolean((titleInput || previewData.title || '').trim()) },
    { label: 'Primary role', done: Boolean((roleInput || previewData.role || '').trim()) },
    { label: 'At least one section', done: sections.length > 0 },
    { label: 'Draft saved', done: Boolean(portfolioId) },
  ];

  const usageLabel = usageStats
    ? `${usageStats.portfolioUsage.used}/${usageStats.portfolioUsage.limit ?? 'Unlimited'} portfolios used`
    : 'Plan usage loading...';

  return (
    <div className="mx-auto space-y-5 pb-8">
      <PageHeader
        title="Create Portfolio"
        subtitle="Choose a template and build in one unified visual flow."
        actions={
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => router.push(ROUTES.PORTFOLIOS)}>
            <ArrowLeft size={14} /> Back
          </Button>
        }
      />

      {!canCreateNewDraft && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-300">
          Limit reached. Upgrade to Pro
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>Step {step} of 3</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-4">
          {[
            { n: 1, label: 'Choose Template' },
            { n: 2, label: 'Visual Builder' },
            { n: 3, label: 'Review/Publish' },
          ].map(({ n, label }) => (
            <button
              key={n}
              type="button"
              onClick={() => step > n && setStep(n as 1 | 2 | 3)}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium transition-colors',
                step === n
                  ? 'text-[var(--color-primary)]'
                  : step > n
                    ? 'cursor-pointer text-emerald-400 hover:text-emerald-300'
                    : 'cursor-default text-[var(--color-text-muted)]',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                  step > n
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : step === n
                      ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                      : 'bg-white/5 text-[var(--color-text-muted)]',
                )}
              >
                {step > n ? '✓' : n}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handlePublish} className="space-y-5">
        {step === 1 && (
          <DashboardCard title="Choose a Template" subtitle="Pick your starting layout.">
            {templatesLoading ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-48" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {templates.map((template) => {
                  const isSelected = selectedTemplate === template.id;
                  const isLocked = isTemplateLockedForPlan(template.id, template.isPremium, planId);
                  const gradient = getTemplateGradient(template);
                  const emoji = getTemplateEmoji(template);

                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        if (isLocked) {
                          setUpgradeOpen(true);
                          return;
                        }
                        setSelectedTemplate(template.id);
                      }}
                      title={isLocked ? 'Available in Pro plan' : undefined}
                      className={cn(
                        'group relative overflow-hidden rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5',
                        isLocked && 'opacity-80',
                        isSelected
                          ? 'border-[var(--color-primary)] shadow-[0_0_0_2px_rgba(124,58,237,0.25)]'
                          : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary)]/40',
                      )}
                    >
                      {isLocked && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
                          <span className="rounded-full border border-amber-400/30 bg-amber-500/20 px-2 py-1 text-[10px] font-semibold text-amber-200">
                            Available in Pro plan
                          </span>
                        </div>
                      )}

                      {!template.isPremium && (
                        <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                          <Sparkles size={9} /> Free
                        </span>
                      )}

                      {template.isPremium && (
                        <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                          <Lock size={9} /> Premium
                        </span>
                      )}

                      {isSelected && (
                        <span className="absolute right-2 top-2 z-10">
                          <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
                        </span>
                      )}

                      <div className={cn('flex h-24 items-center justify-center bg-gradient-to-br text-4xl', gradient)}>
                        {emoji}
                      </div>

                      <div className="p-3">
                        <p className="mb-0.5 text-xs font-semibold text-[var(--color-text)]">{template.name}</p>
                        <p className="line-clamp-2 text-[11px] leading-relaxed text-[var(--color-text-muted)]">{template.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-5 flex items-center gap-2">
              {selectedPreviewHref ? (
                <Button type="button" variant="outline" onClick={() => router.push(selectedPreviewHref)}>
                  Preview Template
                </Button>
              ) : null}
              <Button
                type="button"
                disabled={!selectedTemplate}
                onClick={() => setStep(2)}
                className="gap-1.5"
              >
                Next: Visual Builder <ArrowRight size={14} />
              </Button>
            </div>
          </DashboardCard>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <label className="text-xs text-[var(--color-text-muted)]">
                  Portfolio title
                  <input
                    value={titleInput}
                    onChange={(event) => {
                      setTitleInput(event.target.value);
                      setPreviewData({ title: event.target.value });
                    }}
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
                    placeholder="Your Portfolio Title"
                  />
                </label>
                <label className="text-xs text-[var(--color-text-muted)]">
                  Primary role
                  <input
                    value={roleInput}
                    onChange={(event) => {
                      setRoleInput(event.target.value);
                      setPreviewData({ role: event.target.value });
                    }}
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
                    placeholder="Your Role"
                  />
                </label>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleSaveDraft} isLoading={saving} className="gap-1.5">
                  <Save size={13} /> Save Draft
                </Button>
                <Button type="button" size="sm" onClick={() => setStep(3)} className="gap-1.5">
                  Review <ArrowRight size={13} />
                </Button>
              </div>
            </div>

            {isFreePlan && (
              <DashboardCard title="Free Plan Limits" subtitle="Upgrade to unlock full builder capabilities.">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <span>Max sections: {FREE_MAX_SECTIONS}</span>
                  <span>•</span>
                  <span>AI generations/day: {freeAiCount}/{FREE_AI_DAILY_LIMIT}</span>
                  <span>•</span>
                  <span>{usageLabel}</span>
                </div>
              </DashboardCard>
            )}

            <div className="flex items-center gap-2 xl:hidden">
              <Button
                size="sm"
                variant={showLeftPanelMobile ? 'primary' : 'ghost'}
                className="gap-1.5"
                onClick={() => {
                  setShowLeftPanelMobile(true);
                  setShowRightPanelMobile(false);
                }}
              >
                <PanelsTopLeft size={13} /> Content
              </Button>
              <Button
                size="sm"
                variant={!showLeftPanelMobile && !showRightPanelMobile ? 'primary' : 'ghost'}
                className="gap-1.5"
                onClick={() => {
                  setShowLeftPanelMobile(false);
                  setShowRightPanelMobile(false);
                }}
              >
                <Eye size={13} /> Preview
              </Button>
              <Button
                size="sm"
                variant={showRightPanelMobile ? 'primary' : 'ghost'}
                className="gap-1.5"
                onClick={() => {
                  setShowLeftPanelMobile(false);
                  setShowRightPanelMobile(true);
                }}
              >
                <SlidersHorizontal size={13} /> Settings
              </Button>
            </div>

            <div className="grid gap-5 xl:grid-cols-[350px_minmax(0,1fr)_340px]">
              <div className={['space-y-4', showLeftPanelMobile ? 'block' : 'hidden xl:block'].join(' ')}>
                <AIGeneratorForm
                  loading={aiLoading}
                  canUseAI={canUseAI}
                  onGenerate={handleGenerate}
                  onUpgradeRequired={() => setUpgradeOpen(true)}
                  onRetry={aiRetryPayload ? handleRetryAI : undefined}
                  initialValues={aiInitialValues}
                />

                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
                  <BuilderSectionList
                    sections={sections}
                    activeSectionId={activeSectionId}
                    canAddSection={canAddSection}
                    onSelectSection={setActiveSectionId}
                    onRemoveSection={handleRemoveSection}
                    onReorder={handleReorder}
                    onAddSection={(type) => {
                      if (!canAddSection) {
                        setUpgradeOpen(true);
                        return;
                      }
                      addSection(type);
                    }}
                    onUpgradeRequired={() => setUpgradeOpen(true)}
                  />

                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
                    {reorderSaving || saving ? <LoaderCircle size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {reorderSaving
                      ? 'Saving section order...'
                      : saving
                        ? 'Saving draft...'
                        : isDirty
                          ? 'Unsaved local changes'
                          : 'All changes synced'}
                  </div>
                </div>
              </div>

              <div className={[!showLeftPanelMobile && !showRightPanelMobile ? 'block' : 'hidden xl:block'].join(' ')}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <LivePreview
                    templateId={selectedTemplate || 'template4'}
                    title={previewData.title || titleInput || 'Your Portfolio'}
                    role={previewData.role || roleInput || 'Your Role'}
                    sections={sections}
                    style={style}
                    activeSectionId={activeSectionId}
                    onActivateSection={setActiveSectionId}
                    onInlineUpdate={updateSectionData}
                  />
                </motion.div>
              </div>

              <div className={[showRightPanelMobile ? 'block' : 'hidden xl:block'].join(' ')}>
                <SectionSettingsPanel
                  activeSection={activeSection}
                  style={style}
                  onUpdateSection={(updates) => {
                    if (!activeSection) return;
                    updateSectionData(activeSection.id, updates);
                  }}
                  onUpdateStyle={updateStyle}
                  onResetStyle={() => updateStyle(DEFAULT_STYLE)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <DashboardCard title="Review And Publish" subtitle="Confirm the setup and publish your portfolio.">
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {requiredChecks.map((item) => (
                    <p key={item.label} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                      <span className={cn('inline-flex h-4 w-4 items-center justify-center rounded-sm text-white', item.done ? 'bg-emerald-500' : 'bg-rose-500/75')}>
                        <Check size={11} />
                      </span>
                      {item.label}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                <p className="text-xs text-[var(--color-text-muted)]">Final snapshot</p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">{titleInput || previewData.title || 'Untitled Portfolio'}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{roleInput || previewData.role || 'No role added'}</p>
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">Template: {selectedTemplateObj?.name ?? '-'}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Sections: {sections.length}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Status: {portfolioId ? 'Draft saved' : 'Unsaved draft'}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep(2)} className="gap-1">
                <ArrowLeft size={13} /> Previous
              </Button>
              <Button type="button" variant="outline" onClick={handleSaveDraft} isLoading={saving}>
                Save Draft
              </Button>
              <Button type="submit" isLoading={publishing} disabled={!selectedTemplateObj || !(titleInput || previewData.title || '').trim()}>
                Publish Portfolio
              </Button>
            </div>
          </DashboardCard>
        )}
      </form>

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onUpgraded={async () => {
          if (!token) return;
          const stats = await dashboardService.getStats(token);
          setPlanUsage(stats);
        }}
      />
    </div>
  );
}
