"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";

export interface WatchlistButtonProps {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
}

export function WatchlistButton({
  id,
  type,
  title,
  posterPath,
}: WatchlistButtonProps) {
  const { isInWatchlist, toggle } = useWatchlist();
  const inList = isInWatchlist({ id, type });
  const Icon = inList ? BookmarkCheck : Bookmark;
  const label = inList ? "In Watchlist" : "Add to Watchlist";

  return (
    <button
      type="button"
      onClick={() => toggle({ id, type, title, posterPath })}
      className="inline-flex items-center gap-2 rounded-md bg-elevated px-4 py-2 text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-elevated/80"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
