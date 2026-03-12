import { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'ghost';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantMap: Record<BadgeVariant, string> = {
  primary:   'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20',
  secondary: 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border border-[var(--color-secondary)]/20',
  accent:    'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20',
  ghost:     'bg-white/5 text-[var(--color-text-muted)] border border-white/10',
};

export function Badge({ variant = 'primary', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantMap[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
