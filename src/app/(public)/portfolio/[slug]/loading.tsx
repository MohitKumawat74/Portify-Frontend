export default function PublicPortfolioLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 h-12 w-1/2 animate-pulse rounded-xl bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
