import {
  STORAGE_KEYS,
  makeWatchlistKey,
  type WatchlistItem,
  type WatchlistKeyInput,
  type AnimeStorageFormat,
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
    // quota / serialization errors — ignored.
  }
}

export function readWatchlist(): WatchlistItem[] {
  return safeRead();
}

export type WatchlistInput =
  | { type: "movie"; id: number; title: string; posterPath: string | null }
  | { type: "tv"; id: number; title: string; posterPath: string | null }
  | {
      type: "anime";
      anilistId: number;
      title: string;
      coverUrl: string | null;
      format: AnimeStorageFormat;
    };

function toKeyInput(input: WatchlistInput | WatchlistKeyInput): WatchlistKeyInput {
  if (input.type === "anime") {
    return { type: "anime", anilistId: input.anilistId };
  }
  return { type: input.type, id: input.id };
}

function entryKey(item: WatchlistItem): string {
  return makeWatchlistKey(item);
}

export function addToWatchlist(input: WatchlistInput): void {
  const list = safeRead();
  const key = makeWatchlistKey(toKeyInput(input));
  if (list.some((item) => entryKey(item) === key)) return;
  const next: WatchlistItem[] = [
    { ...input, addedAt: Date.now() } as WatchlistItem,
    ...list,
  ];
  safeWrite(next);
}

export function removeFromWatchlist(input: WatchlistKeyInput): void {
  const list = safeRead();
  const key = makeWatchlistKey(input);
  safeWrite(list.filter((item) => entryKey(item) !== key));
}

export function isInWatchlist(input: WatchlistKeyInput): boolean {
  const key = makeWatchlistKey(input);
  return safeRead().some((item) => entryKey(item) === key);
}
