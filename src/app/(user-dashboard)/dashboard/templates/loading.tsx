import { Skeleton } from '@/components/dashboard/Skeleton';

export default function DashboardTemplatesLoading() {
  return (
    <div className="space-y-6 pb-8">
      <div className="h-10 w-48 animate-pulse rounded-xl bg-white/5" />

      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-white/5" />
        ))}
      </div>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}
