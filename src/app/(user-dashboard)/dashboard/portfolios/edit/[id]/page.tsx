'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { Loader } from '@/components/ui/Loader';
import { toast } from '@/store/toastStore';
import { ROUTES, DEFAULT_THEME } from '@/utils/constants';
import { Globe, EyeOff, RotateCcw } from 'lucide-react';
import { usePortfolio as usePortfolioHook } from '@/hooks/usePortfolio';
import { useAuthStore } from '@/store/authStore';
import { portfolioService } from '@/services/portfolioService';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditPortfolioPage({ params }: Props) {
  const router = useRouter();
  const { fetchPortfolioById, editPortfolio, selectedPortfolio, isLoading } = usePortfolio();
  const { theme, applyTheme } = useTheme();
  const { token } = useAuthStore();

  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetchPortfolioById(id);
    });
  }, [params, fetchPortfolioById]);

  useEffect(() => {
    if (selectedPortfolio) {
      setTitle(selectedPortfolio.title);
      setIsPublished(selectedPortfolio.isPublished);
      applyTheme(selectedPortfolio.theme);
    }
  }, [selectedPortfolio, applyTheme]);

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    try {
      await editPortfolio(id, { title, theme });
      toast.success('Portfolio saved!');
      router.push(ROUTES.PORTFOLIOS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishToggle() {
    if (!id || !token) return;
    setPublishing(true);
    try {
      if (isPublished) {
        await portfolioService.unpublish(id, token);
        setIsPublished(false);
        toast.success('Portfolio unpublished.');
      } else {
        await portfolioService.publish(id, token);
        setIsPublished(true);
        toast.success('Portfolio is now live!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update publish status.');
    } finally {
      setPublishing(false);
    }
  }

  if (isLoading) return <Loader fullPage />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Edit Portfolio"
        subtitle={selectedPortfolio?.title ?? 'Loading…'}
        actions={
          <Button
            variant={isPublished ? 'outline' : 'primary'}
            size="sm"
            isLoading={publishing}
            onClick={handlePublishToggle}
            className="gap-1.5"
          >
            {isPublished ? (
              <><EyeOff size={13} /> Unpublish</>
            ) : (
              <><Globe size={13} /> Publish</>
            )}
          </Button>
        }
      />

      {/* Published status badge */}
      <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium ${
        isPublished
          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
          : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)]'
      }`}>
        <span className={`h-2 w-2 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-white/20'}`} />
        {isPublished ? 'Live — visible at portfolio URL' : 'Draft — not publicly visible'}
      </div>

      {/* Details */}
      <DashboardCard title="Portfolio Details" subtitle="Update the title and content of your portfolio.">
        <Input
          label="Portfolio Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </DashboardCard>

      {/* Theme */}
      <DashboardCard
        title="Theme Customisation"
        subtitle="Adjust colours and typography to match your brand."
        actions={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => applyTheme(DEFAULT_THEME)}
          >
            <RotateCcw size={12} /> Reset
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ['primaryColor', 'Primary Colour'],
              ['secondaryColor', 'Secondary Colour'],
              ['backgroundColor', 'Background Colour'],
              ['textColor', 'Text Colour'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-text)]">{label}</label>
              <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
                <input
                  type="color"
                  value={(theme as Record<string, string>)[key]}
                  onChange={(e) => applyTheme({ [key]: e.target.value })}
                  className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                />
                <span className="font-mono text-xs text-[var(--color-text-muted)]">
                  {(theme as Record<string, string>)[key]}
                </span>
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text)]">Font Family</label>
            <select
              value={theme.fontFamily}
              onChange={(e) => applyTheme({ fontFamily: e.target.value })}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/60"
            >
              <option value="Inter, sans-serif">Inter</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="'Helvetica Neue', sans-serif">Helvetica Neue</option>
            </select>
          </div>
        </div>
      </DashboardCard>

      <div className="flex gap-3">
        <Button isLoading={saving} onClick={handleSave}>
          Save Changes
        </Button>
        <Button variant="ghost" onClick={() => router.push(ROUTES.PORTFOLIOS)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
