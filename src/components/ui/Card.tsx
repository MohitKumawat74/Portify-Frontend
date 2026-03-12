import { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'default' | 'glass' | 'gradient' | 'outline';
type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
  hoverable?: boolean;
  glow?: boolean;
}

const variantStyles: Record<Variant, string> = {
  default:  'bg-[var(--color-bg-card)] border border-[var(--color-border)]',
  glass:    'glass',
  gradient: 'bg-gradient-to-br from-[var(--color-bg-card)] to-[#0F1C35] border border-[var(--color-border)]',
  outline:  'bg-transparent border border-[var(--color-border)]',
};

const paddingMap: Record<Padding, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export function Card({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  glow = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl',
        variantStyles[variant],
        paddingMap[padding],
        hoverable && [
          'cursor-pointer transition-all duration-300',
          'hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]',
          glow && 'hover:shadow-[0_20px_60px_rgba(124,58,237,0.25)]',
        ],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type SubProps = HTMLAttributes<HTMLDivElement>;
Card.Header = function CardHeader({ className, children, ...props }: SubProps) {
  return (
    <div
      className={cn('mb-4 border-b border-[var(--color-border)] pb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

type TitleProps = HTMLAttributes<HTMLHeadingElement>;
Card.Title = function CardTitle({ className, children, ...props }: TitleProps) {
  return (
    <h3
      className={cn('text-lg font-semibold text-[var(--color-text)]', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

