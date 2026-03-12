'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortfolio } from '@/hooks/usePortfolio';
import { templateService } from '@/services/templateService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { Skeleton } from '@/components/dashboard/Skeleton';
import { toast } from '@/store/toastStore';
import type { Template } from '@/types';
import { ROUTES, TEMPLATE_IDS, DEFAULT_THEME } from '@/utils/constants';
import { slugify } from '@/utils/slugify';
import { CheckCircle2, Sparkles, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

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

export default function CreatePortfolioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createPortfolio } = usePortfolio();

  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    searchParams?.get('template') ?? TEMPLATE_IDS[0]
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    templateService.getAll(1, 50)
      .then((res) => setTemplates(res.data.filter((t) => t.isActive)))
      .catch(() => {
        // Fallback to built-in templates
        setTemplates([
          { id: 'template1', name: 'Modern Minimal', description: 'Clean white layout with indigo accents.', thumbnail: '', category: 'minimal', isPremium: false, isActive: true, createdAt: '' },
          { id: 'template2', name: 'Dark Creative', description: 'Bold dark theme with purple highlights.', thumbnail: '', category: 'creative', isPremium: false, isActive: true, createdAt: '' },
          { id: 'template3', name: 'Professional Classic', description: 'Structured layout ideal for corporate portfolios.', thumbnail: '', category: 'professional', isPremium: false, isActive: true, createdAt: '' },
        ]);
      })
      .finally(() => setTemplatesLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a portfolio title.');
      return;
    }
    setIsLoading(true);
    try {
      const portfolio = await createPortfolio({ title: title.trim(), templateId: selectedTemplate, theme: DEFAULT_THEME });
      toast.success('Portfolio created successfully!');
      router.push(ROUTES.PORTFOLIOS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create portfolio.');
    } finally {
      setIsLoading(false);
    }
  }

  const selectedTemplateObj = templates.find((t) => t.id === selectedTemplate);
  const progress = step === 1 ? 50 : 100;

  return (
    <div className="mx-auto  space-y-5 pb-8">
      <PageHeader
        title="Create Portfolio"
        subtitle="Set up a new portfolio in seconds. You can customise it after."
        actions={
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => router.push(ROUTES.PORTFOLIOS)}>
            <ArrowLeft size={14} /> Back
          </Button>
        }
      />

      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>Step {step} of 2</span>
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
            { n: 1, label: 'Portfolio Details' },
            { n: 2, label: 'Choose Template' },
          ].map(({ n, label }) => (
            <button
              key={n}
              type="button"
              onClick={() => step > n && setStep(n as 1 | 2)}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium transition-colors',
                step === n
                  ? 'text-[var(--color-primary)]'
                  : step > n
                  ? 'cursor-pointer text-emerald-400 hover:text-emerald-300'
                  : 'text-[var(--color-text-muted)] cursor-default',
              )}
            >
              <span className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                step > n
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : step === n
                  ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                  : 'bg-white/5 text-[var(--color-text-muted)]',
              )}>
                {step > n ? '✓' : n}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <DashboardCard title="Portfolio Details" subtitle="Give your portfolio a name to get started.">
            <div className="space-y-4">
              <Input
                label="Portfolio Title"
                placeholder="My Professional Portfolio"
                fullWidth
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {title && (
                <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5">
                  <span className="text-xs text-[var(--color-text-muted)]">Public URL:</span>
                  <span className="font-mono text-xs text-[var(--color-primary)]">
                    portify.dev/portfolio/<strong>{slugify(title)}</strong>
                  </span>
                </div>
              )}
              <p className="text-xs text-[var(--color-text-muted)]">
                You can change the title and URL slug later from the portfolio editor.
              </p>
            </div>
            <div className="mt-5">
              <Button
                type="button"
                disabled={!title.trim()}
                onClick={() => setStep(2)}
                className="gap-1.5"
              >
                Next: Choose Template <ArrowRight size={14} />
              </Button>
            </div>
          </DashboardCard>
        )}

        {/* Step 2: Template Selection */}
        {step === 2 && (
          <DashboardCard
            title="Choose a Template"
            subtitle="Pick a starting point. You can change it at any time."
          >
            {templatesLoading ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {templates.map((t) => {
                  const isSelected = selectedTemplate === t.id;
                  const gradient = TEMPLATE_GRADIENTS[t.id] ?? 'from-violet-600 to-purple-600';
                  const emoji = TEMPLATE_EMOJIS[t.id] ?? '✨';
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTemplate(t.id)}
                      className={cn(
                        'group relative text-left overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5',
                        isSelected
                          ? 'border-[var(--color-primary)] shadow-[0_0_0_2px_rgba(124,58,237,0.25)]'
                          : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary)]/40',
                      )}
                    >
                      {!t.isPremium && (
                        <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                          <Sparkles size={9} /> Free
                        </span>
                      )}
                      {t.isPremium && (
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
                        <p className="mb-0.5 text-xs font-semibold text-[var(--color-text)]">{t.name}</p>
                        <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)] line-clamp-2">{t.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedTemplateObj && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-3">
                <CheckCircle2 size={15} className="shrink-0 text-[var(--color-primary)]" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--color-text)]">{selectedTemplateObj.name}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] truncate">{selectedTemplateObj.description}</p>
                </div>
              </div>
            )}
          </DashboardCard>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {step === 2 && (
            <>
              <Button type="submit" isLoading={isLoading} className="gap-1.5">
                Create Portfolio
              </Button>
              <Button type="button" variant="ghost" onClick={() => setStep(1)} className="gap-1">
                <ArrowLeft size={13} /> Back
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
