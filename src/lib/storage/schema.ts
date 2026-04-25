export const STORAGE_KEYS = {
  watchlist: "nonton:watchlist",
  history: "nonton:history",
  language: "nonton:language",
} as const;

export interface WatchlistItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  addedAt: number;
}

export interface HistoryItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  season?: number;
  episode?: number;
  watchedAt: number;
}

export const HISTORY_MAX_ITEMS = 100;

export function makeHistoryKey(item: {
  id: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
}): string {
  if (item.type === "tv" && item.season != null && item.episode != null) {
    return `tv:${item.id}:${item.season}:${item.episode}`;
  }
  return `${item.type}:${item.id}`;
}

export function makeWatchlistKey(item: { id: number; type: "movie" | "tv" }): string {
  return `${item.type}:${item.id}`;
}
