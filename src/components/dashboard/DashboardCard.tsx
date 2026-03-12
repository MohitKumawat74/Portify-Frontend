import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

/** Consistent card container for all dashboard widgets */
export function DashboardCard({ title, subtitle, actions, children, className, noPadding }: DashboardCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden',
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--color-border)]">
          <div>
            {title && <h2 className="text-sm font-semibold text-[var(--color-text)]">{title}</h2>}
            {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      <div className={cn(!noPadding && 'p-5')}>{children}</div>
    </div>
  );
}

/** Simple inline page header */
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text)] sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
