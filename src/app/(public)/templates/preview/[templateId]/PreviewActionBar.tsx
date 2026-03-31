'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/utils/constants';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, Monitor, Smartphone, Save } from 'lucide-react';
import type { PreviewDevice } from '@/store/templateStudioStore';

interface PreviewActionBarProps {
  templateId: string;
  previewDevice?: PreviewDevice;
  onChangeDevice?: (device: PreviewDevice) => void;
  onSave?: () => void;
  saving?: boolean;
}

export function PreviewActionBar({
  templateId,
  previewDevice,
  onChangeDevice,
  onSave,
  saving = false,
}: PreviewActionBarProps) {
  const { isAuthenticated } = useAuthStore();

  const useHref = isAuthenticated
    ? `${ROUTES.CREATE_PORTFOLIO}?template=${encodeURIComponent(templateId)}`
    : ROUTES.LOGIN;

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[var(--color-bg)]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href={ROUTES.TEMPLATES_PAGE}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft size={14} /> Back to Templates
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {onChangeDevice && previewDevice ? (
            <div className="hidden items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-1 sm:flex">
              <button
                type="button"
                onClick={() => onChangeDevice('desktop')}
                className={`rounded-lg p-1.5 transition-colors ${previewDevice === 'desktop' ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                aria-label="Desktop preview"
              >
                <Monitor size={14} />
              </button>
              <button
                type="button"
                onClick={() => onChangeDevice('mobile')}
                className={`rounded-lg p-1.5 transition-colors ${previewDevice === 'mobile' ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                aria-label="Mobile preview"
              >
                <Smartphone size={14} />
              </button>
            </div>
          ) : null}

          {onSave ? (
            <Button variant="outline" size="sm" onClick={onSave} isLoading={saving} className="hidden gap-1.5 sm:inline-flex">
              <Save size={13} /> Save
            </Button>
          ) : null}

          <span className="hidden text-xs text-[var(--color-text-muted)] sm:inline">Template Preview</span>
          <Link href={useHref}>
            <Button size="sm" className="gap-1.5">
              Use this template <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
