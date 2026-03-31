'use client';

import { Button } from '@/components/ui/Button';
import type { TemplateCustomization } from '@/store/templateStudioStore';

interface CustomizationPanelProps {
  customizations: TemplateCustomization;
  onColorChange: (key: keyof TemplateCustomization['colors'], value: string) => void;
  onTypographyChange: (key: keyof TemplateCustomization['typography'], value: string) => void;
  onSectionToggle: (key: keyof TemplateCustomization['sectionVisibility'], value: boolean) => void;
  onLayoutChange: (layout: TemplateCustomization['layoutStyle']) => void;
  onSave: () => void;
  onReset: () => void;
  saving?: boolean;
}

const FONT_OPTIONS = [
  'Inter, sans-serif',
  'Space Grotesk, sans-serif',
  'DM Sans, sans-serif',
  'Sora, sans-serif',
  'Playfair Display, serif',
  'JetBrains Mono, monospace',
];

const LAYOUT_OPTIONS: Array<TemplateCustomization['layoutStyle']> = ['minimal', 'split', 'modern', 'immersive'];

export function CustomizationPanel({
  customizations,
  onColorChange,
  onTypographyChange,
  onSectionToggle,
  onLayoutChange,
  onSave,
  onReset,
  saving = false,
}: CustomizationPanelProps) {
  return (
    <aside className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 lg:max-w-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Customize Template</h3>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Changes apply instantly to live preview.</p>
      </div>

      <div className="space-y-4">
        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Colors</p>
          {(
            [
              ['primaryColor', 'Primary'],
              ['secondaryColor', 'Secondary'],
              ['backgroundColor', 'Background'],
              ['textColor', 'Text'],
              ['accentColor', 'Accent'],
            ] as Array<[keyof TemplateCustomization['colors'], string]>
          ).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-2">
              <input
                type="color"
                value={customizations.colors[key]}
                onChange={(e) => onColorChange(key, e.target.value)}
                className="h-6 w-6 cursor-pointer rounded border-none bg-transparent p-0"
              />
              <span className="text-xs text-[var(--color-text)]">{label}</span>
              <span className="ml-auto text-[10px] font-mono text-[var(--color-text-muted)]">{customizations.colors[key]}</span>
            </div>
          ))}
        </section>

        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Typography</p>
          <div>
            <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Base Font</label>
            <select
              value={customizations.typography.fontFamily}
              onChange={(e) => onTypographyChange('fontFamily', e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>{font.split(',')[0]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Heading Font</label>
            <select
              value={customizations.typography.headingFont}
              onChange={(e) => onTypographyChange('headingFont', e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>{font.split(',')[0]}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Sections</p>
          {(
            ['hero', 'about', 'skills', 'projects', 'contact'] as Array<keyof TemplateCustomization['sectionVisibility']>
          ).map((section) => (
            <label key={section} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]">
              <span className="capitalize">{section}</span>
              <input
                type="checkbox"
                checked={customizations.sectionVisibility[section]}
                onChange={(e) => onSectionToggle(section, e.target.checked)}
              />
            </label>
          ))}
        </section>

        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Layout Style</p>
          <div className="grid grid-cols-2 gap-2">
            {LAYOUT_OPTIONS.map((layout) => (
              <button
                key={layout}
                type="button"
                onClick={() => onLayoutChange(layout)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  customizations.layoutStyle === layout
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                    : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {layout}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 flex gap-2">
        <Button size="sm" onClick={onSave} isLoading={saving} className="flex-1">Save</Button>
        <Button size="sm" variant="ghost" onClick={onReset}>Reset</Button>
      </div>
    </aside>
  );
}
