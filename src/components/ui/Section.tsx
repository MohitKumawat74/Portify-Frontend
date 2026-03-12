import { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  id?: string;
  label?: string;
  title?: string;
  subtitle?: string;
  centered?: boolean;
}

export function Section({
  id,
  label,
  title,
  subtitle,
  centered = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn('section relative overflow-hidden', className)}
      {...props}
    >
      {(label || title || subtitle) && (
        <div className={cn('mb-16', centered ? 'text-center' : '')}>
          {label && (
            <span className="mb-3 inline-block font-mono text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
              {label}
            </span>
          )}
          {title && (
            <h2 className="text-4xl font-bold text-[var(--color-text)] sm:text-5xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 max-w-2xl text-lg text-[var(--color-text-muted)]">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
