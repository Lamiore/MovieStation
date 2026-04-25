export default function Loading() {
  return (
    <main className="mx-auto max-w-screen-xl space-y-4 px-4 py-6 md:px-8">
      <div className="h-4 w-32 animate-pulse rounded bg-surface" />
      <div className="h-7 w-2/3 animate-pulse rounded bg-surface" />
      <div className="aspect-video w-full animate-pulse rounded bg-surface" />
      <div className="space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-surface" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-surface" />
      </div>
    </main>
  );
}
