'use client';

import { useEffect } from 'react';

export default function PublicPortfolioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Public portfolio route error:', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-3xl border border-white/15 bg-black/25 p-6 text-center backdrop-blur sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Rendering error</p>
        <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Something went wrong</h1>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          We hit an unexpected issue while rendering this portfolio.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex rounded-full border border-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/85 transition hover:border-white/45"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
