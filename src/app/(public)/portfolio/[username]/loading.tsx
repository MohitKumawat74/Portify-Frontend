export default function PublicPortfolioLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      <div className="mb-4 h-10 w-3/4 animate-pulse rounded-xl bg-white/5 sm:mb-6 sm:h-12 sm:w-1/2" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/5 sm:h-40" />
        ))}
      </div>
    </div>
  );
}
