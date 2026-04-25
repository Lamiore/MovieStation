export function MediaCardSkeleton() {
  return (
    <div className="w-[160px] shrink-0 md:w-[200px]">
      <div className="aspect-[2/3] animate-pulse rounded-md bg-surface ring-1 ring-border" />
      <div className="mt-2 space-y-1.5 px-0.5">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-surface" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface" />
      </div>
    </div>
  );
}
