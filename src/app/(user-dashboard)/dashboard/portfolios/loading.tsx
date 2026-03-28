import { Skeleton } from '@/components/dashboard/Skeleton';

export default function DashboardPortfoliosLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-56 animate-pulse rounded-xl bg-white/5" />
      <div className="flex gap-3">
        <div className="h-10 w-full max-w-sm animate-pulse rounded-xl bg-white/5" />
        <div className="h-10 w-24 animate-pulse rounded-xl bg-white/5" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}
