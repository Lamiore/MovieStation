import type { AnilistMediaFormat } from "@/lib/anilist/types";

export const STORAGE_KEYS = {
  watchlist: "nonton:watchlist",
  history: "nonton:history",
  language: "nonton:language",
} as const;

export type AnimeStorageFormat = AnilistMediaFormat;

export type WatchlistItem =
  | {
      type: "movie";
      id: number;
      title: string;
      posterPath: string | null;
      addedAt: number;
    }
  | {
      type: "tv";
      id: number;
      title: string;
      posterPath: string | null;
      addedAt: number;
    }
  | {
      type: "anime";
      anilistId: number;
      title: string;
      coverUrl: string | null;
      format: AnimeStorageFormat;
      addedAt: number;
    };

export type HistoryItem =
  | {
      type: "movie";
      id: number;
      title: string;
      posterPath: string | null;
      watchedAt: number;
    }
  | {
      type: "tv";
      id: number;
      title: string;
      posterPath: string | null;
      season: number;
      episode: number;
      watchedAt: number;
    }
  | {
      type: "anime";
      anilistId: number;
      title: string;
      coverUrl: string | null;
      episode: number;
      format: AnimeStorageFormat;
      watchedAt: number;
    };

export const HISTORY_MAX_ITEMS = 100;

export type HistoryKeyInput =
  | { type: "movie"; id: number }
  | { type: "tv"; id: number; season: number; episode: number }
  | { type: "anime"; anilistId: number; episode: number };

export function makeHistoryKey(item: HistoryKeyInput): string {
  if (item.type === "tv") {
    return `tv:${item.id}:${item.season}:${item.episode}`;
  }
  if (item.type === "anime") {
    return `anime:${item.anilistId}:${item.episode}`;
  }
  return `movie:${item.id}`;
}

export type WatchlistKeyInput =
  | { type: "movie"; id: number }
  | { type: "tv"; id: number }
  | { type: "anime"; anilistId: number };

export function makeWatchlistKey(item: WatchlistKeyInput): string {
  if (item.type === "anime") return `anime:${item.anilistId}`;
  return `${item.type}:${item.id}`;
}
