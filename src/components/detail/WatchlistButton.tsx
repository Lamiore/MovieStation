"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";

export interface WatchlistButtonProps {
  id: number;
  type: "movie" | "tv";
  isInWatchlist?: boolean;
  onToggle?: () => void;
}

export function WatchlistButton({
  isInWatchlist = false,
  onToggle,
}: WatchlistButtonProps) {
  const Icon = isInWatchlist ? BookmarkCheck : Bookmark;
  const label = isInWatchlist ? "Sudah di Watchlist" : "Tambah ke Watchlist";
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-md bg-elevated px-4 py-2 text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-elevated/80"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
