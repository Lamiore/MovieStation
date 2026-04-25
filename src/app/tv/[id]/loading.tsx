export default function Loading() {
  return (
    <main className="pb-12">
      <section className="relative w-full">
        <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-8 md:py-16">
          <div className="grid gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[260px_1fr]">
            <div className="mx-auto h-72 w-48 animate-pulse rounded-lg bg-surface md:mx-0 md:h-96 md:w-full" />
            <div className="space-y-4">
              <div className="h-9 w-2/3 animate-pulse rounded bg-surface" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
              <div className="space-y-2 pt-3">
                <div className="h-3 w-full animate-pulse rounded bg-surface" />
                <div className="h-3 w-11/12 animate-pulse rounded bg-surface" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-surface" />
              </div>
              <div className="flex gap-3 pt-3">
                <div className="h-10 w-24 animate-pulse rounded bg-surface" />
                <div className="h-10 w-40 animate-pulse rounded bg-surface" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
