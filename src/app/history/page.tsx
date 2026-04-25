"use client";

import Link from "next/link";
import { useHistory } from "@/hooks/useHistory";

function buildHref(item: {
  id: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
}): string {
  if (item.type === "tv" && item.season != null && item.episode != null) {
    return `/watch/tv/${item.id}/${item.season}/${item.episode}`;
  }
  return `/watch/movie/${item.id}`;
}

export default function HistoryPage() {
  const { list, clear } = useHistory();

  return (
    <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Watch History
          </h1>
          <p className="text-sm text-muted-foreground">
            {list.length > 0
              ? `${list.length} item${list.length === 1 ? "" : "s"} in history`
              : "No watch history yet."}
          </p>
        </div>
        {list.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              if (confirm("Clear all watch history?")) clear();
            }}
            className="rounded-md bg-elevated px-3 py-1.5 text-sm font-medium text-text ring-1 ring-border hover:bg-elevated/80"
          >
            Clear all
          </button>
        ) : null}
      </header>

      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            History appears once you watch a movie or episode.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Start watching
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {list.map((item) => (
            <li
              key={`${item.type}:${item.id}:${item.season ?? ""}:${item.episode ?? ""}`}
            >
              <Link href={buildHref(item)} className="block w-full">
                <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border">
                  {item.posterPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <p className="mt-2 truncate text-sm font-medium text-text">
                  {item.title}
                </p>
                {item.season != null && item.episode != null ? (
                  <p className="text-xs text-muted-foreground">
                    S{item.season} • E{item.episode}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
