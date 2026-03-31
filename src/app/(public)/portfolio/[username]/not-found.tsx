export default function PublicPortfolioNotFound() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-3xl border border-white/15 bg-black/25 p-6 text-center backdrop-blur sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">404</p>
        <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Portfolio not found</h1>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          This portfolio may have been removed, unpublished, or the username is incorrect.
        </p>
        <a
          href="/templates"
          className="mt-6 inline-flex rounded-full border border-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/85 transition hover:border-white/45"
        >
          Explore templates
        </a>
      </div>
    </div>
  );
}
