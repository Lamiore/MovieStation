"use client";

import Link from "next/link";
import { useWatchlist } from "@/hooks/useWatchlist";
import { MediaCard } from "@/components/media/MediaCard";
import type { WatchlistItem } from "@/lib/storage/schema";

function entryKey(item: WatchlistItem): string {
  if (item.type === "anime") return `anime:${item.anilistId}`;
  return `${item.type}:${item.id}`;
}

export default function WatchlistPage() {
  const { list } = useWatchlist();

  return (
    <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 md:px-8 md:py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Watchlist
        </h1>
        <p className="text-sm text-muted-foreground">
          {list.length > 0
            ? `${list.length} title${list.length === 1 ? "" : "s"} saved`
            : "No titles saved yet."}
        </p>
      </header>

      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Add a movie or show from its detail page to save it here.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Explore Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {list.map((item) => (
            <div key={entryKey(item)} className="w-full">
              {item.type === "anime" ? (
                <Link
                  href={`/anime/${item.anilistId}`}
                  className="block w-full"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border">
                    {item.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-text">
                    {item.title}
                  </p>
                </Link>
              ) : (
                <MediaCard
                  id={item.id}
                  type={item.type}
                  title={item.title}
                  posterPath={item.posterPath}
                  releaseDate=""
                  voteAverage={0}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
