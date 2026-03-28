import { StatCardSkeleton, CardSkeleton } from '@/components/dashboard/Skeleton';

export default function AdminAnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-40 animate-pulse rounded-xl bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
