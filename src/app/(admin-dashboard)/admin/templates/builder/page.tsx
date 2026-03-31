'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  GripVertical,
  LoaderCircle,
  PlusCircle,
  Save,
  Trash2,
  Wand2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAdminTemplateBuilderStore, type AdminBuilderSection } from '@/store/adminTemplateBuilderStore';
import { templateService } from '@/services/templateService';
import { toast } from '@/store/toastStore';
import { PageHeader, DashboardCard } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TemplateRenderer } from '@/templates/TemplateRenderer';
import type { SectionType, Template } from '@/types';
import { ROUTES } from '@/utils/constants';

const ALL_SECTION_TYPES: SectionType[] = [
  'hero',
  'about',
  'skills',
  'projects',
  'experience',
  'testimonials',
  'contact',
  'footer',
];

const LAYOUT_STYLES = ['minimal', 'split', 'modern', 'immersive'] as const;

const SAFE_BASE_TEMPLATE_IDS = ['template1', 'template2', 'template3', 'template4'] as const;

export default function AdminTemplateBuilderPage() {
  const searchParams = useSearchParams();
  const templateIdQuery = searchParams.get('templateId')?.trim() ?? '';

  const { token } = useAuthStore();
  const {
    meta,
    sections,
    selectedSectionId,
    style,
    isDirty,
    setMeta,
    setStyle,
    addSection,
    removeSection,
    reorderSections,
    selectSection,
    updateSectionData,
    updateSectionAnimation,
    hydrateFromTemplate,
    reset,
    markSaved,
  } = useAdminTemplateBuilderStore();

  const [loading, setLoading] = useState(Boolean(templateIdQuery));
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections],
  );

  const selectedSection = useMemo(
    () => sortedSections.find((section) => section.id === selectedSectionId) ?? null,
    [sortedSections, selectedSectionId],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!token) return;

    if (!templateIdQuery) {
      reset();
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadTemplate = async () => {
      setLoading(true);
      try {
        const response = await templateService.getById(templateIdQuery);
        if (!mounted) return;

        const template = response.data;
        hydrateFromTemplate(template);

        if (template.id && !SAFE_BASE_TEMPLATE_IDS.includes(template.id as (typeof SAFE_BASE_TEMPLATE_IDS)[number])) {
          const inferredBase = inferBaseTemplateId(template);
          setMeta({ baseTemplateId: inferredBase });
        }
      } catch (error) {
        if (!mounted) return;
        toast.error(error instanceof Error ? error.message : 'Failed to load template into builder.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTemplate();

    return () => {
      mounted = false;
    };
  }, [token, templateIdQuery, hydrateFromTemplate, reset, setMeta]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedSections.findIndex((section) => section.id === active.id);
    const newIndex = sortedSections.findIndex((section) => section.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(sortedSections, oldIndex, newIndex);
    reorderSections(reordered.map((section) => section.id));
  };

  const handleSave = async () => {
    if (!token) {
      toast.error('Please sign in again to save template changes.');
      return;
    }

    if (!meta.name.trim() || !meta.description.trim()) {
      toast.error('Template name and description are required.');
      return;
    }

    setSaving(true);

    const payload: Partial<Template> = {
      name: meta.name.trim(),
      description: meta.description.trim(),
      category: meta.category,
      isPremium: meta.isPremium,
      isActive: meta.isActive,
      sections: sortedSections.map((section) => section.type),
      defaultTheme: {
        primaryColor: style.colors.primaryColor,
        secondaryColor: style.colors.secondaryColor,
        backgroundColor: style.colors.backgroundColor,
        textColor: style.colors.textColor,
        fontFamily: style.typography.fontFamily,
      },
      builderConfig: {
        sections: sortedSections,
        style,
      },
    };

    try {
      const response = meta.templateId
        ? await templateService.update(meta.templateId, payload, token)
        : await templateService.create(payload, token);

      setMeta({ templateId: response.data.id });
      markSaved();
      toast.success(meta.templateId ? 'Template builder changes saved.' : 'Template created from builder.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save template.');
    } finally {
      setSaving(false);
    }
  };

  const previewUserData = useMemo(() => {
    const heroData = getSectionData(sortedSections, 'hero');
    const aboutData = getSectionData(sortedSections, 'about');
    const skillsData = getSectionData(sortedSections, 'skills');
    const projectsData = getSectionData(sortedSections, 'projects');
    const experienceData = getSectionData(sortedSections, 'experience');
    const testimonialsData = getSectionData(sortedSections, 'testimonials');
    const contactData = getSectionData(sortedSections, 'contact');
    const footerData = getSectionData(sortedSections, 'footer');

    return {
      hero: {
        name: stringOr(heroData?.name, 'Alex Morgan'),
        title: stringOr(heroData?.title, 'Product Engineer'),
        bio: stringOr(heroData?.bio, 'Building high-performance digital products with delightful UX.'),
        ctaPrimaryText: stringOr(heroData?.ctaPrimaryText, 'View Work'),
        ctaPrimaryHref: stringOr(heroData?.ctaPrimaryHref, '#projects'),
      },
      about: {
        heading: stringOr(aboutData?.heading, 'About'),
        text: stringOr(aboutData?.text, 'Use the right panel to configure section content and messaging.'),
        highlights: arrayOfString(aboutData?.highlights),
      },
      skills: toSkillItems(skillsData),
      projects: toProjectItems(projectsData),
      experience: toExperienceItems(experienceData),
      testimonials: toTestimonialItems(testimonialsData),
      contact: {
        heading: stringOr(contactData?.heading, 'Contact'),
        description: stringOr(contactData?.description, 'Let us build your next product milestone together.'),
        email: stringOr(contactData?.email, 'hello@example.com'),
        location: stringOr(contactData?.location, 'Remote'),
        socialLinks: Array.isArray(contactData?.socialLinks)
          ? (contactData?.socialLinks as Array<{ id: string; label: string; href: string }>)
          : [],
      },
      footer: {
        copyright: stringOr(footerData?.copyright, `(c) ${new Date().getFullYear()} Portfolio`),
        links: Array.isArray(footerData?.links)
          ? (footerData.links as Array<{ id: string; label: string; href: string }>)
          : [],
      },
    };
  }, [sortedSections]);

  const templateConfig = useMemo(
    () => ({
      id: meta.baseTemplateId,
      name: meta.name || 'Untitled Template',
      isPremium: meta.isPremium,
      sections: sortedSections.map((section) => section.type),
      layoutStyle: style.layoutStyle,
    }),
    [meta.baseTemplateId, meta.name, meta.isPremium, sortedSections, style.layoutStyle],
  );

  const customizations = useMemo(
    () => ({
      colors: { ...style.colors },
      typography: { ...style.typography },
      layoutStyle: style.layoutStyle,
      sectionVisibility: sortedSections.reduce<Record<SectionType, boolean>>((acc, section) => {
        acc[section.type] = true;
        return acc;
      }, {
        hero: false,
        about: false,
        skills: false,
        projects: false,
        experience: false,
        testimonials: false,
        contact: false,
        footer: false,
      }),
    }),
    [style, sortedSections],
  );

  if (!token) {
    return (
      <DashboardCard>
        <p className="text-sm text-[var(--color-text-muted)]">
          Admin authentication is required to access the template builder.
        </p>
      </DashboardCard>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Template Builder Studio"
        subtitle="Visual template design with live rendering, section ordering, and animation controls."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href={ROUTES.ADMIN_TEMPLATES}>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft size={14} /> Back
              </Button>
            </Link>
            <Button
              size="sm"
              variant={previewDevice === 'desktop' ? 'primary' : 'ghost'}
              onClick={() => setPreviewDevice('desktop')}
              className="gap-1.5"
            >
              <Eye size={13} /> Desktop
            </Button>
            <Button
              size="sm"
              variant={previewDevice === 'mobile' ? 'primary' : 'ghost'}
              onClick={() => setPreviewDevice('mobile')}
              className="gap-1.5"
            >
              <Eye size={13} /> Mobile
            </Button>
            <Button size="sm" onClick={handleSave} isLoading={saving} className="gap-1.5">
              <Save size={13} /> Save Template
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2.5 py-1">
          {isDirty ? <LoaderCircle size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
          {isDirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2.5 py-1">
          {sortedSections.length} sections
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <DashboardCard
          title="Section Library"
          subtitle="Drag to reorder and add new sections"
          className="h-fit"
        >
          <div className="space-y-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortedSections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {sortedSections.map((section) => (
                    <SortableSectionCard
                      key={section.id}
                      section={section}
                      isActive={selectedSectionId === section.id}
                      onSelect={() => selectSection(section.id)}
                      onRemove={() => removeSection(section.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <p className="mb-2 text-xs font-semibold text-[var(--color-text)]">Add Section</p>
              <div className="flex flex-wrap gap-2">
                {ALL_SECTION_TYPES.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="capitalize"
                    onClick={() => addSection(type)}
                  >
                    <PlusCircle size={12} /> {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Live Template Preview"
          subtitle="Rendered output updates as you edit"
          className="min-h-[720px]"
          noPadding
        >
          {loading ? (
            <div className="flex h-[720px] items-center justify-center text-sm text-[var(--color-text-muted)]">
              <LoaderCircle size={16} className="mr-2 animate-spin" /> Loading template builder data...
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <TemplateRenderer
                templateId={meta.baseTemplateId}
                templateConfig={templateConfig}
                userData={previewUserData}
                customizations={customizations}
                previewDevice={previewDevice}
                variant="editor"
              />
            </motion.div>
          )}
        </DashboardCard>

        <DashboardCard
          title="Template Settings"
          subtitle="Metadata, style system, and section controls"
          className="h-fit"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Input
                label="Template Name"
                value={meta.name}
                onChange={(event) => setMeta({ name: event.target.value })}
                placeholder="Elegant Minimal"
                fullWidth
              />
              <label className="text-sm font-medium text-[var(--color-text-muted)]">
                Description
                <textarea
                  rows={3}
                  value={meta.description}
                  onChange={(event) => setMeta({ description: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text)]"
                  placeholder="Describe who this template is designed for"
                />
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-sm font-medium text-[var(--color-text-muted)]">
                  Category
                  <input
                    value={meta.category}
                    onChange={(event) => setMeta({ category: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text)]"
                  />
                </label>
                <label className="text-sm font-medium text-[var(--color-text-muted)]">
                  Base Template
                  <select
                    value={meta.baseTemplateId}
                    onChange={(event) => setMeta({ baseTemplateId: event.target.value as 'template1' | 'template2' | 'template3' | 'template4' })}
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text)]"
                  >
                    {SAFE_BASE_TEMPLATE_IDS.map((baseId) => (
                      <option value={baseId} key={baseId}>
                        {baseId}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex items-center gap-5 pt-1 text-sm text-[var(--color-text)]">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={meta.isPremium}
                    onChange={(event) => setMeta({ isPremium: event.target.checked })}
                    className="h-4 w-4 rounded accent-[var(--color-primary)]"
                  />
                  Premium
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={meta.isActive}
                    onChange={(event) => setMeta({ isActive: event.target.checked })}
                    className="h-4 w-4 rounded accent-[var(--color-primary)]"
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <p className="text-xs font-semibold text-[var(--color-text)]">Design Tokens</p>
              <label className="text-xs text-[var(--color-text-muted)]">
                Layout style
                <select
                  value={style.layoutStyle}
                  onChange={(event) => setStyle({ layoutStyle: event.target.value as (typeof LAYOUT_STYLES)[number] })}
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text)]"
                >
                  {LAYOUT_STYLES.map((layout) => (
                    <option key={layout} value={layout} className="capitalize">
                      {layout}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <ColorField label="Primary" value={style.colors.primaryColor} onChange={(value) => setStyle({ colors: { primaryColor: value } })} />
                <ColorField label="Secondary" value={style.colors.secondaryColor} onChange={(value) => setStyle({ colors: { secondaryColor: value } })} />
                <ColorField label="Background" value={style.colors.backgroundColor} onChange={(value) => setStyle({ colors: { backgroundColor: value } })} />
                <ColorField label="Text" value={style.colors.textColor} onChange={(value) => setStyle({ colors: { textColor: value } })} />
              </div>
              <Input
                label="Font Family"
                value={style.typography.fontFamily}
                onChange={(event) => setStyle({ typography: { fontFamily: event.target.value } })}
                fullWidth
              />
              <Input
                label="Heading Font"
                value={style.typography.headingFont}
                onChange={(event) => setStyle({ typography: { headingFont: event.target.value } })}
                fullWidth
              />
            </div>

            {selectedSection ? (
              <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                <p className="text-xs font-semibold text-[var(--color-text)] capitalize">
                  {selectedSection.type} Content
                </p>
                <SectionEditor
                  section={selectedSection}
                  onUpdateData={(updates) => updateSectionData(selectedSection.id, updates)}
                />

                <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
                  <p className="text-xs font-semibold text-[var(--color-text)]">Animation</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="text-xs text-[var(--color-text-muted)]">
                      Type
                      <select
                        value={selectedSection.animation.type}
                        onChange={(event) =>
                          updateSectionAnimation(selectedSection.id, {
                            type: event.target.value as 'fade' | 'slide' | 'zoom',
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text)]"
                      >
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                        <option value="zoom">Zoom</option>
                      </select>
                    </label>
                    <label className="text-xs text-[var(--color-text-muted)]">
                      Trigger
                      <select
                        value={selectedSection.animation.trigger}
                        onChange={(event) =>
                          updateSectionAnimation(selectedSection.id, {
                            trigger: event.target.value as 'viewport' | 'load' | 'hover',
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text)]"
                      >
                        <option value="viewport">Viewport</option>
                        <option value="load">Page Load</option>
                        <option value="hover">Hover</option>
                      </select>
                    </label>
                    <label className="text-xs text-[var(--color-text-muted)]">
                      Duration (seconds)
                      <input
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={selectedSection.animation.duration}
                        onChange={(event) =>
                          updateSectionAnimation(selectedSection.id, {
                            duration: Number(event.target.value) || 0.6,
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text)]"
                      />
                    </label>
                    <label className="text-xs text-[var(--color-text-muted)]">
                      Delay (seconds)
                      <input
                        type="number"
                        min={0}
                        step={0.05}
                        value={selectedSection.animation.delay}
                        onChange={(event) =>
                          updateSectionAnimation(selectedSection.id, {
                            delay: Number(event.target.value) || 0,
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text)]"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-5 text-center text-xs text-[var(--color-text-muted)]">
                Select a section from the left panel to edit its content and animation.
              </div>
            )}

            <Button variant="outline" fullWidth className="gap-1.5" onClick={handleSave} isLoading={saving}>
              <Wand2 size={14} /> Publish Builder Changes
            </Button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

function inferBaseTemplateId(template: Template): 'template1' | 'template2' | 'template3' | 'template4' {
  const lower = `${template.name} ${template.category}`.toLowerCase();

  if (/immersive|3d|interactive/.test(lower)) return 'template4';
  if (/creative|agency|saas|product/.test(lower)) return 'template2';
  if (/professional|corporate|classic/.test(lower)) return 'template3';
  return 'template1';
}

function getSectionData(
  sections: AdminBuilderSection[],
  type: SectionType,
): Record<string, unknown> | null {
  const section = sections.find((item) => item.type === type);
  return section?.data ?? null;
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function arrayOfString(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function toSkillItems(data: Record<string, unknown> | null) {
  if (Array.isArray(data?.skills)) {
    return (data.skills as Array<Record<string, unknown>>).map((item, index) => ({
      id: String(item.id ?? `skill-${index}`),
      name: String(item.name ?? `Skill ${index + 1}`),
      level: Number(item.level ?? 70),
      category: String(item.category ?? 'general'),
    }));
  }

  if (Array.isArray(data?.items)) {
    return (data.items as Array<unknown>).map((item, index) => ({
      id: `skill-${index}`,
      name: String(item),
      level: 70,
      category: 'general',
    }));
  }

  return [
    { id: 'skill-1', name: 'React', level: 90, category: 'frontend' },
    { id: 'skill-2', name: 'TypeScript', level: 88, category: 'language' },
  ];
}

function toProjectItems(data: Record<string, unknown> | null) {
  if (Array.isArray(data?.projects)) {
    return (data.projects as Array<Record<string, unknown>>).map((item, index) => ({
      id: String(item.id ?? `project-${index}`),
      title: String(item.title ?? `Project ${index + 1}`),
      description: String(item.description ?? ''),
      techStack: Array.isArray(item.techStack) ? item.techStack.map(String) : [],
      liveUrl: typeof item.liveUrl === 'string' ? item.liveUrl : undefined,
      repoUrl: typeof item.repoUrl === 'string' ? item.repoUrl : undefined,
    }));
  }

  return [
    {
      id: 'project-1',
      title: 'Builder Preview Project',
      description: 'Default project content for template preview.',
      techStack: ['Next.js', 'TypeScript'],
    },
  ];
}

function toExperienceItems(data: Record<string, unknown> | null) {
  if (Array.isArray(data?.experiences)) {
    return (data.experiences as Array<Record<string, unknown>>).map((item, index) => ({
      id: String(item.id ?? `exp-${index}`),
      company: String(item.company ?? 'Company'),
      role: String(item.role ?? 'Role'),
      startDate: String(item.startDate ?? '2024-01'),
      endDate: typeof item.endDate === 'string' ? item.endDate : undefined,
      description: String(item.description ?? ''),
      isCurrent: Boolean(item.isCurrent),
    }));
  }

  return [];
}

function toTestimonialItems(data: Record<string, unknown> | null) {
  if (Array.isArray(data?.testimonials)) {
    return (data.testimonials as Array<Record<string, unknown>>).map((item, index) => ({
      id: String(item.id ?? `testimonial-${index}`),
      name: String(item.name ?? 'Client'),
      role: typeof item.role === 'string' ? item.role : undefined,
      quote: String(item.quote ?? 'Outstanding work and communication.'),
    }));
  }

  return [];
}

function SortableSectionCard({
  section,
  isActive,
  onSelect,
  onRemove,
}: {
  section: AdminBuilderSection;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors',
        isActive
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
          : 'border-[var(--color-border)] bg-[var(--color-bg-card)]',
        isDragging ? 'shadow-[0_10px_28px_rgba(0,0,0,0.35)] opacity-90' : '',
      ].join(' ')}
    >
      <button
        type="button"
        className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-white/10"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex-1 text-left"
      >
        <p className="text-sm font-medium capitalize text-[var(--color-text)]">{section.type}</p>
        <p className="text-[11px] text-[var(--color-text-muted)]">
          Animation: {section.animation.type} / {section.animation.trigger}
        </p>
      </button>

      <button
        type="button"
        onClick={onRemove}
        className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-400"
        title="Remove section"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs text-[var(--color-text-muted)]">
      {label}
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 rounded-md border border-[var(--color-border)] bg-transparent p-1"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2 text-xs text-[var(--color-text)]"
        />
      </div>
    </label>
  );
}

function SectionEditor({
  section,
  onUpdateData,
}: {
  section: AdminBuilderSection;
  onUpdateData: (updates: Record<string, unknown>) => void;
}) {
  const data = section.data;

  if (section.type === 'hero') {
    return (
      <div className="space-y-2">
        <Input label="Name" value={stringValue(data.name)} onChange={(event) => onUpdateData({ name: event.target.value })} fullWidth />
        <Input label="Title" value={stringValue(data.title)} onChange={(event) => onUpdateData({ title: event.target.value })} fullWidth />
        <TextareaField label="Bio" value={stringValue(data.bio)} onChange={(value) => onUpdateData({ bio: value })} />
      </div>
    );
  }

  if (section.type === 'about') {
    return (
      <div className="space-y-2">
        <Input label="Heading" value={stringValue(data.heading)} onChange={(event) => onUpdateData({ heading: event.target.value })} fullWidth />
        <TextareaField label="Text" value={stringValue(data.text)} onChange={(value) => onUpdateData({ text: value })} />
      </div>
    );
  }

  if (section.type === 'skills') {
    return (
      <TextareaField
        label="Skills (comma separated)"
        value={Array.isArray(data.skills)
          ? (data.skills as Array<Record<string, unknown>>).map((item) => String(item.name ?? '')).filter(Boolean).join(', ')
          : ''}
        onChange={(value) => {
          const next = value
            .split(',')
            .map((part, index) => ({
              id: `skill-${index}`,
              name: part.trim(),
              level: 70,
              category: 'general',
            }))
            .filter((item) => item.name.length > 0);

          onUpdateData({ skills: next });
        }}
      />
    );
  }

  if (section.type === 'projects') {
    return (
      <TextareaField
        label="Projects (one per line: title | description)"
        value={Array.isArray(data.projects)
          ? (data.projects as Array<Record<string, unknown>>)
            .map((item) => `${String(item.title ?? '')} | ${String(item.description ?? '')}`)
            .join('\n')
          : ''}
        onChange={(value) => {
          const projects = value
            .split('\n')
            .map((line, index) => {
              const [title, description] = line.split('|').map((part) => part?.trim() ?? '');
              return {
                id: `project-${index}`,
                title,
                description,
                techStack: [],
              };
            })
            .filter((project) => project.title.length > 0);

          onUpdateData({ projects });
        }}
      />
    );
  }

  if (section.type === 'contact') {
    return (
      <div className="space-y-2">
        <Input label="Heading" value={stringValue(data.heading)} onChange={(event) => onUpdateData({ heading: event.target.value })} fullWidth />
        <Input label="Email" value={stringValue(data.email)} onChange={(event) => onUpdateData({ email: event.target.value })} fullWidth />
        <Input label="Location" value={stringValue(data.location)} onChange={(event) => onUpdateData({ location: event.target.value })} fullWidth />
      </div>
    );
  }

  return (
    <TextareaField
      label="Raw JSON data"
      value={JSON.stringify(data, null, 2)}
      onChange={(value) => {
        try {
          const parsed = JSON.parse(value) as Record<string, unknown>;
          onUpdateData(parsed);
        } catch {
          // Ignore invalid JSON while editing.
        }
      }}
    />
  );
}

function TextareaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs text-[var(--color-text-muted)]">
      {label}
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text)]"
      />
    </label>
  );
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
