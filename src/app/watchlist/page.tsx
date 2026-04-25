"use client";

import Link from "next/link";
import { useWatchlist } from "@/hooks/useWatchlist";
import { WatchlistTabs } from "@/components/personal/WatchlistTabs";

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
        <WatchlistTabs list={list} />
      )}
    </main>
  );
}
