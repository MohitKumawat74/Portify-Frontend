import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  ctaLabel,
  ctaHref,
  onCtaClick,
  className,
}: EmptyStateProps) {
  return (
    <div className={`py-12 text-center ${className ?? ''}`}>
      {Icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
          <Icon size={24} className="text-[var(--color-primary)]" />
        </div>
      )}
      <p className="mb-1 text-sm font-medium text-[var(--color-text)]">{title}</p>
      <p className="mb-4 text-xs text-[var(--color-text-muted)]">{description}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref}>
          <Button size="sm">{ctaLabel}</Button>
        </Link>
      )}
      {ctaLabel && !ctaHref && onCtaClick && <Button size="sm" onClick={onCtaClick}>{ctaLabel}</Button>}
    </div>
  );
}
