import {
  STORAGE_KEYS,
  makeWatchlistKey,
  type WatchlistItem,
} from "./schema";

function safeRead(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEYS.watchlist);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(list: WatchlistItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.watchlist,
      JSON.stringify(list),
    );
  } catch {
    // quota / serialization errors — ignored; hook detects via storage event.
  }
}

export function readWatchlist(): WatchlistItem[] {
  return safeRead();
}

export interface WatchlistInput {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
}

export function addToWatchlist(input: WatchlistInput): void {
  const list = safeRead();
  const key = makeWatchlistKey(input);
  if (list.some((item) => makeWatchlistKey(item) === key)) return;
  const next: WatchlistItem[] = [
    { ...input, addedAt: Date.now() },
    ...list,
  ];
  safeWrite(next);
}

export function removeFromWatchlist(input: {
  id: number;
  type: "movie" | "tv";
}): void {
  const list = safeRead();
  const key = makeWatchlistKey(input);
  safeWrite(list.filter((item) => makeWatchlistKey(item) !== key));
}

export function isInWatchlist(input: {
  id: number;
  type: "movie" | "tv";
}): boolean {
  const key = makeWatchlistKey(input);
  return safeRead().some((item) => makeWatchlistKey(item) === key);
}
