import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Loader } from './Loader';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary)] text-white hover:brightness-110 shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]',
  secondary:
    'bg-[var(--color-secondary)] text-white hover:brightness-110 shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)]',
  outline:
    'border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white',
  ghost:
    'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5',
  danger:
    'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]',
  glow:
    'relative bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_50px_rgba(124,58,237,0.8)] hover:scale-105',
};

const sizeStyles: Record<Size, string> = {
  sm:  'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md:  'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg:  'px-7 py-3 text-base rounded-xl gap-2.5',
  xl:  'px-9 py-4 text-lg rounded-2xl gap-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-semibold cursor-pointer',
        'transition-all duration-300 ease-[var(--ease-smooth)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:pointer-events-none',
        'active:scale-95',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      )}
      {...props}
    >
      {isLoading && <Loader size="sm" />}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';

