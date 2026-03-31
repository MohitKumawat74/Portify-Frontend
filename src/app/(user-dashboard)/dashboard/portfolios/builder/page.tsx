'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, LoaderCircle, Sparkles, SlidersHorizontal, PanelsTopLeft, Eye } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  usePortfolioBuilderStore,
  builderSectionTypes,
  type BuilderSection,
  type BuilderSectionType,
  type BuilderStyle,
} from '@/store/portfolioBuilderStore';
import { dashboardService } from '@/services/dashboardService';
import { portfolioService } from '@/services/portfolioService';
import { aiService, type GeneratePortfolioPayload } from '@/services/aiService';
import { UpgradeModal } from '@/components/dashboard/UpgradeModal';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/Button';
import { BuilderSectionList } from '@/components/builder/BuilderSectionList';
import { SectionSettingsPanel } from '@/components/builder/SectionSettingsPanel';
import { AIGeneratorForm } from '@/components/builder/AIGeneratorForm';
import { LivePreview } from '@/components/builder/LivePreview';
import { toast } from '@/store/toastStore';
import { useScrollAnimationGroup } from '@/hooks/useScrollAnimation';
import { ROUTES } from '@/utils/constants';

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

export default function PortfolioBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reorderSaving, setReorderSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRetryPayload, setAiRetryPayload] = useState<GeneratePortfolioPayload | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [showLeftPanelMobile, setShowLeftPanelMobile] = useState(true);
  const [showRightPanelMobile, setShowRightPanelMobile] = useState(false);
  const autosaveTimeoutRef = useRef<number | null>(null);
  const hydratedRef = useRef(false);

  const revealRef = useScrollAnimationGroup('.builder-reveal', {
    staggerMs: 80,
    once: false,
    threshold: 0.08,
    refreshKey: `${sections.length}:${activeSectionId}:${saving}`,
  });

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? null,
    [sections, activeSectionId],
  );

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
      name: String(heroData?.name ?? previewData.title ?? '').trim(),
      role: String(heroData?.title ?? previewData.role ?? '').trim(),
      skills: mergedSkills.join(', '),
      experience: String(aboutData?.text ?? '').trim(),
    };
  }, [sections, previewData.title, previewData.role]);

  const isFreePlan = !planId || planId === 'plan_free';
  const canAddSection = !isFreePlan || sections.length < FREE_MAX_SECTIONS;

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

  const loadPortfolio = useCallback(async (id: string) => {
    if (!token) return;
    setLoadingPortfolio(true);
    try {
      const response = await portfolioService.getById(id, token);
      const portfolio = response.data;
      const normalizedSections = (portfolio.sections ?? [])
        .filter((section) => builderSectionTypes.includes(section.type as BuilderSectionType))
        .map((section, index) => ({
          id: section.id,
          order: typeof section.order === 'number' ? section.order : index,
          type: section.type as BuilderSectionType,
          data: section.data ?? {},
        } satisfies BuilderSection));

      setPortfolioId(portfolio.id);
      setPreviewData({ title: portfolio.title });
      setSections(normalizedSections.length > 0 ? normalizedSections : []);
      updateStyle({
        colors: {
          primary: portfolio.theme?.primaryColor ?? DEFAULT_STYLE.colors.primary,
          secondary: portfolio.theme?.secondaryColor ?? DEFAULT_STYLE.colors.secondary,
          background: portfolio.theme?.backgroundColor ?? DEFAULT_STYLE.colors.background,
          text: portfolio.theme?.textColor ?? DEFAULT_STYLE.colors.text,
          accent: DEFAULT_STYLE.colors.accent,
        },
      });
      markSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load portfolio into builder.');
    } finally {
      setLoadingPortfolio(false);
      hydratedRef.current = true;
    }
  }, [token, setPortfolioId, setPreviewData, setSections, updateStyle, markSaved]);

  useEffect(() => {
    if (!token) return;

    dashboardService
      .getStats(token)
      .then((stats) => setPlanUsage(stats))
      .catch(() => {});
  }, [token, setPlanUsage]);

  useEffect(() => {
    const queryPortfolioId = searchParams.get('portfolioId');
    if (!queryPortfolioId || !token) {
      hydratedRef.current = true;
      return;
    }
    loadPortfolio(queryPortfolioId);
  }, [searchParams, token, loadPortfolio]);

  useEffect(() => {
    if (!portfolioId || !token || !hydratedRef.current) return;
    if (!isDirty) return;

    if (autosaveTimeoutRef.current) {
      window.clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }

    autosaveTimeoutRef.current = window.setTimeout(async () => {
      setSaving(true);
      try {
        await portfolioService.update(
          portfolioId,
          {
            title: previewData.title,
            sections,
            theme: {
              primaryColor: style.colors.primary,
              secondaryColor: style.colors.secondary,
              backgroundColor: style.colors.background,
              textColor: style.colors.text,
              fontFamily: 'Inter, sans-serif',
            },
          },
          token,
        );
        markSaved();
      } catch {
        toast.error('Auto-save failed. Your edits are still local.');
      } finally {
        setSaving(false);
      }
    }, 700);

    return () => {
      if (autosaveTimeoutRef.current) {
        window.clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [portfolioId, token, sections, style, previewData.title, isDirty, markSaved]);

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

  const handleReorder = async (idsInOrder: string[]) => {
    reorderSections(idsInOrder);

    if (!portfolioId || !token) return;
    setReorderSaving(true);
    try {
      await portfolioService.reorderSections(portfolioId, { sectionIds: idsInOrder }, token);
    } catch {
      // Fallback to patching sections list if a dedicated reorder endpoint is unavailable.
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

  const handleSaveNow = async () => {
    if (!token) return;
    setSaving(true);
    try {
      if (portfolioId) {
        await portfolioService.update(
          portfolioId,
          {
            title: previewData.title,
            sections,
            theme: {
              primaryColor: style.colors.primary,
              secondaryColor: style.colors.secondary,
              backgroundColor: style.colors.background,
              textColor: style.colors.text,
              fontFamily: 'Inter, sans-serif',
            },
          },
          token,
        );
      } else {
        const created = await portfolioService.create(
          {
            title: previewData.title,
            templateId: 'template4',
            theme: {
              primaryColor: style.colors.primary,
              secondaryColor: style.colors.secondary,
              backgroundColor: style.colors.background,
              textColor: style.colors.text,
              fontFamily: 'Inter, sans-serif',
            },
          },
          token,
        );

        const newPortfolioId = created.data.id;
        setPortfolioId(newPortfolioId);
        await portfolioService.updateSections(newPortfolioId, sections, token);
      }

      markSaved();
      toast.success('Builder changes saved.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSection = (sectionId: string) => {
    if (isFreePlan && sections.length <= 1) {
      toast.error('At least one section is required.');
      return;
    }
    removeSection(sectionId);
  };

  const handleRetryAI = async () => {
    if (!aiRetryPayload) return;
    await handleGenerate(aiRetryPayload);
  };

  const usageLabel = usageStats
    ? `${usageStats.portfolioUsage.used}/${usageStats.portfolioUsage.limit ?? 'Unlimited'} portfolios used`
    : 'Plan usage loading...';

  return (
    <div className="space-y-6 pb-8" ref={revealRef}>
      <PageHeader
        title="Visual Portfolio Builder"
        subtitle="Webflow-style editing with AI generation, drag-and-drop sections, and live preview."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => resetBuilder()}>Reset</Button>
            <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.PORTFOLIOS)}>Back</Button>
            <Button size="sm" className="gap-1.5" isLoading={saving} onClick={handleSaveNow}>
              <Save size={13} /> Save
            </Button>
          </div>
        }
      />

      {isFreePlan && (
        <DashboardCard className="builder-reveal" title="Free Plan Limits" subtitle="Upgrade to unlock full builder capabilities.">
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
          variant={(!showLeftPanelMobile && !showRightPanelMobile) ? 'primary' : 'ghost'}
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
        <div className={["space-y-4 builder-reveal", showLeftPanelMobile ? 'block' : 'hidden xl:block'].join(' ')}>
          <AIGeneratorForm
            loading={aiLoading}
            canUseAI={canUseAI}
            onGenerate={handleGenerate}
            onUpgradeRequired={() => setUpgradeOpen(true)}
            onRetry={aiRetryPayload ? handleRetryAI : undefined}
            initialValues={aiInitialValues}
          />

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <div className="mb-3 grid gap-2">
              <label className="text-xs text-[var(--color-text-muted)]">
                Portfolio title
                <input
                  value={previewData.title}
                  onChange={(e) => setPreviewData({ title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
                />
              </label>
              <label className="text-xs text-[var(--color-text-muted)]">
                Primary role
                <input
                  value={previewData.role}
                  onChange={(e) => setPreviewData({ role: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
                />
              </label>
            </div>

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
              {loadingPortfolio
                ? 'Loading portfolio...'
                : reorderSaving
                  ? 'Saving new section order...'
                  : saving
                    ? 'Auto-saving changes...'
                    : isDirty
                      ? 'Unsaved local changes'
                      : 'All changes synced'}
            </div>
          </div>
        </div>

        <div className={["builder-reveal", (!showLeftPanelMobile && !showRightPanelMobile) ? 'block' : 'hidden xl:block'].join(' ')}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <LivePreview
              title={previewData.title}
              role={previewData.role}
              sections={sections}
              style={style}
              activeSectionId={activeSectionId}
              onActivateSection={setActiveSectionId}
              onInlineUpdate={updateSectionData}
            />
          </motion.div>
        </div>

        <div className={["builder-reveal", showRightPanelMobile ? 'block' : 'hidden xl:block'].join(' ')}>
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
