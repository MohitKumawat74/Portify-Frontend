import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  /** e.g. "+12% this month" */
  change?: string;
  /** positive / negative / neutral */
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  gradient?: string;
  className?: string;
}

export function StatCard({ label, value, change, trend = 'neutral', icon, gradient, className }: StatCardProps) {
  const trendColor =
    trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-[var(--color-text-muted)]';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        className,
      )}
    >
      {/* Background glow */}
      {gradient && (
        <div
          className={`pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 blur-2xl bg-gradient-to-br ${gradient}`}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[var(--color-text)] leading-none">{value}</p>
          {change && (
            <div className={cn('mt-2 flex items-center gap-1', trendColor)}>
              <TrendIcon size={12} />
              <span className="text-[11px] font-medium">{change}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br',
            gradient ?? 'from-[var(--color-primary)] to-[var(--color-secondary)]',
          )}>
            <span className="text-white [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
