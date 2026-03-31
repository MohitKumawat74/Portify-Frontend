'use client';

import { useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { BuilderSection, BuilderStyle } from '@/store/portfolioBuilderStore';

interface SectionSettingsPanelProps {
  activeSection: BuilderSection | null;
  style: BuilderStyle;
  onUpdateSection: (updates: Record<string, unknown>) => void;
  onUpdateStyle: (updates: Partial<BuilderStyle>) => void;
  onResetStyle: () => void;
}

export function SectionSettingsPanel({
  activeSection,
  style,
  onUpdateSection,
  onUpdateStyle,
  onResetStyle,
}: SectionSettingsPanelProps) {
  const activeLabel = useMemo(
    () => (activeSection ? activeSection.type.charAt(0).toUpperCase() + activeSection.type.slice(1) : 'None'),
    [activeSection],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
        <div className="mb-3 flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[var(--color-primary)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Section Settings</h3>
        </div>

        {!activeSection ? (
          <p className="text-xs text-[var(--color-text-muted)]">Select a section to edit its content.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[var(--color-text-muted)]">Editing: <span className="font-medium text-[var(--color-text)]">{activeLabel}</span></p>
            <SectionEditor section={activeSection} onUpdateSection={onUpdateSection} />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Style Controls</h3>
        <div className="mt-3 grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            <ColorInput
              label="Primary"
              value={style.colors.primary}
              onChange={(value) => onUpdateStyle({ colors: { primary: value } })}
            />
            <ColorInput
              label="Secondary"
              value={style.colors.secondary}
              onChange={(value) => onUpdateStyle({ colors: { secondary: value } })}
            />
            <ColorInput
              label="Background"
              value={style.colors.background}
              onChange={(value) => onUpdateStyle({ colors: { background: value } })}
            />
            <ColorInput
              label="Text"
              value={style.colors.text}
              onChange={(value) => onUpdateStyle({ colors: { text: value } })}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-[var(--color-text-muted)]">
              Layout
              <select
                value={style.layout}
                onChange={(e) => onUpdateStyle({ layout: e.target.value as BuilderStyle['layout'] })}
                className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-2 text-sm text-[var(--color-text)]"
              >
                {['minimal', 'split', 'modern', 'immersive'].map((layout) => (
                  <option key={layout} value={layout}>{layout}</option>
                ))}
              </select>
            </label>

            <label className="text-xs text-[var(--color-text-muted)]">
              Spacing
              <select
                value={style.spacing}
                onChange={(e) => onUpdateStyle({ spacing: e.target.value as BuilderStyle['spacing'] })}
                className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-2 text-sm text-[var(--color-text)]"
              >
                {['compact', 'comfortable', 'spacious'].map((spacing) => (
                  <option key={spacing} value={spacing}>{spacing}</option>
                ))}
              </select>
            </label>
          </div>

          <Button variant="ghost" size="sm" onClick={onResetStyle}>Reset style</Button>
        </div>
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  onUpdateSection,
}: {
  section: BuilderSection;
  onUpdateSection: (updates: Record<string, unknown>) => void;
}) {
  const data = section.data as Record<string, unknown>;

  if (section.type === 'hero') {
    return (
      <div className="grid gap-2">
        <Input label="Name" value={stringValue(data.name)} onChange={(value) => onUpdateSection({ name: value })} />
        <Input label="Title" value={stringValue(data.title)} onChange={(value) => onUpdateSection({ title: value })} />
        <Textarea label="Bio" value={stringValue(data.bio)} onChange={(value) => onUpdateSection({ bio: value })} />
      </div>
    );
  }

  if (section.type === 'about') {
    return (
      <div className="grid gap-2">
        <Input label="Heading" value={stringValue(data.heading)} onChange={(value) => onUpdateSection({ heading: value })} />
        <Textarea label="Text" value={stringValue(data.text)} onChange={(value) => onUpdateSection({ text: value })} />
      </div>
    );
  }

  if (section.type === 'skills') {
    return (
      <Textarea
        label="Skills"
        value={Array.isArray(data.items) ? data.items.map(String).join(', ') : ''}
        onChange={(value) => onUpdateSection({ items: value.split(',').map((v) => v.trim()).filter(Boolean) })}
      />
    );
  }

  if (section.type === 'projects') {
    return (
      <Textarea
        label="Projects (one per line: title | description)"
        value={Array.isArray(data.items)
          ? data.items
              .map((item) => {
                const project = item as { title?: string; description?: string };
                return `${project.title ?? ''} | ${project.description ?? ''}`;
              })
              .join('\n')
          : ''}
        onChange={(value) => {
          const items = value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [title, description] = line.split('|').map((part) => part.trim());
              return { title: title ?? '', description: description ?? '' };
            });
          onUpdateSection({ items });
        }}
      />
    );
  }

  return (
    <div className="grid gap-2">
      <Input label="Email" value={stringValue(data.email)} onChange={(value) => onUpdateSection({ email: value })} />
      <Input label="LinkedIn" value={stringValue(data.linkedin)} onChange={(value) => onUpdateSection({ linkedin: value })} />
      <Input label="GitHub" value={stringValue(data.github)} onChange={(value) => onUpdateSection({ github: value })} />
    </div>
  );
}

function Input({
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
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-2 text-sm text-[var(--color-text)]"
      />
    </label>
  );
}

function Textarea({
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
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-2 text-sm text-[var(--color-text)]"
      />
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-2 text-[11px] text-[var(--color-text-muted)]">
      <span className="block">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-6 w-7 cursor-pointer rounded border-none bg-transparent p-0" />
        <span className="font-mono text-[10px]">{value}</span>
      </div>
    </label>
  );
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
