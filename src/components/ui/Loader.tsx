import { cn } from '@/utils/cn';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullPage?: boolean;
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

export function Loader({ size = 'md', className, fullPage = false }: LoaderProps) {
  const spinner = (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-transparent',
        'border-t-[var(--color-primary)] border-r-[var(--color-secondary)]',
        sizeMap[size],
        className,
      )}
      aria-label="Loading"
      role="status"
    />
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        {spinner}
      </div>
    );
  }
  return spinner;
}

export function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[var(--color-bg-card)]',
        className,
      )}
    />
  );
}

