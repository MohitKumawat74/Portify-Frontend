import { StatCardSkeleton, CardSkeleton } from '@/components/dashboard/Skeleton';

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-56 animate-pulse rounded-xl bg-white/5" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="lg:col-span-2">
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
