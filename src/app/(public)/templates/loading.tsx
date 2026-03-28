export default function PublicTemplatesLoading() {
  return (
    <main className="pt-24 sm:pt-28">
      <section className="pb-14 pt-10 text-center sm:pb-16 sm:pt-14 md:pb-20">
        <div className="mx-auto mb-4 h-4 w-28 animate-pulse rounded-full bg-white/10" />
        <div className="mx-auto mb-6 h-12 w-3/4 max-w-xl animate-pulse rounded-xl bg-white/10" />
        <div className="mx-auto h-5 w-2/3 max-w-lg animate-pulse rounded-xl bg-white/5" />
      </section>
      <section className="pb-20 pt-6 sm:pb-24 sm:pt-10 md:pb-28">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </section>
    </main>
  );
}
