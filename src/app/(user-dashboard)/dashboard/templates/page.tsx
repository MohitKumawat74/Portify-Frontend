'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { templateService } from '@/services/templateService';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/dashboard/DashboardCard';
import { Skeleton } from '@/components/dashboard/Skeleton';
import { toast } from '@/store/toastStore';
import type { Template } from '@/types';
import { CheckCircle2, Sparkles, Lock, Search, LayoutGrid, List, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/constants';

const TEMPLATE_GRADIENTS: Record<string, string> = {
  template1: 'from-violet-600 to-indigo-600',
  template2: 'from-slate-700 to-gray-800',
  template3: 'from-blue-600 to-cyan-600',
};

const TEMPLATE_EMOJIS: Record<string, string> = {
  template1: '🎨',
  template2: '🌙',
  template3: '💼',
};

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  minimal: 'Minimal',
  creative: 'Creative',
  professional: 'Professional',
};

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setLoading(true);
    templateService.getAll(1, 50)
      .then((res) => setTemplates(res.data.filter((t) => t.isActive)))
      .catch(() => toast.error('Failed to load templates.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...Array.from(new Set(templates.map((t) => t.category)))];

  const filtered = templates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || t.category === category;
    return matchSearch && matchCat;
  });

  function handleUse() {
    if (!selected) return;
    router.push(`${ROUTES.CREATE_PORTFOLIO}?template=${selected}`);
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Templates"
        subtitle="Choose a beautiful starting point for your portfolio."
        actions={
          selected ? (
            <Button onClick={handleUse} className="gap-1.5">
              Use Template <ArrowRight size={14} />
            </Button>
          ) : undefined
        }
      />

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
                category === cat
                  ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_12px_rgba(124,58,237,0.35)]'
                  : 'border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-text)]',
              )}
            >
              {CATEGORY_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] py-2 pl-8 pr-3 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)]/60 focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
            />
          </div>

          <div className="flex rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('rounded-lg p-1.5 transition-colors', viewMode === 'grid' ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]')}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('rounded-lg p-1.5 transition-colors', viewMode === 'list' ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]')}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Template Grid / List */}
      {loading ? (
        <div className={cn(
          'grid gap-5',
          viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
        )}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={viewMode === 'list' ? 'h-24' : 'h-64'} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] py-16 text-center">
          <p className="mb-1 text-sm font-medium text-[var(--color-text)]">No templates found</p>
          <p className="text-xs text-[var(--color-text-muted)]">Try adjusting your search or filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              selected={selected === t.id}
              onSelect={() => setSelected(t.id === selected ? null : t.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <TemplateListItem
              key={t.id}
              template={t}
              selected={selected === t.id}
              onSelect={() => setSelected(t.id === selected ? null : t.id)}
            />
          ))}
        </div>
      )}

      {/* Sticky CTA */}
      {selected && (
        <div className="sticky bottom-6 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-bg-card)]/95 p-4 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-md">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {filtered.find((t) => t.id === selected)?.name ?? 'Template'} selected
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">Ready to create your portfolio with this template.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Cancel</Button>
            <Button size="sm" onClick={handleUse} className="gap-1.5">
              Use Template <ArrowRight size={13} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template: t,
  selected,
  onSelect,
}: {
  template: Template;
  selected: boolean;
  onSelect: () => void;
}) {
  const gradient = TEMPLATE_GRADIENTS[t.id] ?? 'from-violet-600 to-purple-600';
  const emoji = TEMPLATE_EMOJIS[t.id] ?? '✨';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative w-full text-left overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5',
        selected
          ? 'border-[var(--color-primary)] shadow-[0_0_0_2px_rgba(124,58,237,0.25)]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary)]/40',
      )}
    >
      {!t.isPremium && (
        <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
          <Sparkles size={9} /> Popular
        </span>
      )}
      {t.isPremium && (
        <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          <Lock size={9} /> Premium
        </span>
      )}
      {selected && (
        <span className="absolute right-3 top-3 z-10">
          <CheckCircle2 size={18} className="text-[var(--color-primary)]" />
        </span>
      )}

      <div className={cn('relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br', gradient)}>
        <span className="text-5xl drop-shadow-lg">{emoji}</span>
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[var(--color-text)] truncate">{t.name}</h3>
          <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[var(--color-text-muted)] capitalize">
            {t.category}
          </span>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-[var(--color-text-muted)] line-clamp-2">{t.description}</p>
        <div className="flex items-center justify-between">
          <span className={cn('text-xs font-semibold', t.isPremium ? 'text-amber-400' : 'text-emerald-400')}>
            {t.isPremium ? '⚡ Premium' : '✓ Free'}
          </span>
          <span className={cn(
            'text-[10px] font-medium transition-colors',
            selected ? 'text-[var(--color-primary)]' : 'text-transparent group-hover:text-[var(--color-text-muted)]',
          )}>
            {selected ? 'Selected' : 'Click to select'}
          </span>
        </div>
      </div>
    </button>
  );
}

function TemplateListItem({
  template: t,
  selected,
  onSelect,
}: {
  template: Template;
  selected: boolean;
  onSelect: () => void;
}) {
  const gradient = TEMPLATE_GRADIENTS[t.id] ?? 'from-violet-600 to-purple-600';
  const emoji = TEMPLATE_EMOJIS[t.id] ?? '✨';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-px',
        selected
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-[0_0_0_1px_rgba(124,58,237,0.2)]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary)]/30',
      )}
    >
      <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl', gradient)}>
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">{t.name}</h3>
          {t.isPremium && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">Premium</span>
          )}
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[var(--color-text-muted)] capitalize">{t.category}</span>
        </div>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)] line-clamp-1">{t.description}</p>
      </div>
      {selected ? (
        <CheckCircle2 size={18} className="shrink-0 text-[var(--color-primary)]" />
      ) : (
        <ArrowRight size={16} className="shrink-0 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}
