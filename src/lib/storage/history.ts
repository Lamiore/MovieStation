import {
  HISTORY_MAX_ITEMS,
  STORAGE_KEYS,
  makeHistoryKey,
  type HistoryItem,
  type HistoryKeyInput,
  type AnimeStorageFormat,
} from "./schema";

function safeRead(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEYS.history);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(list: HistoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(list));
  } catch {
    // ignore — see watchlist module for rationale
  }
}

export function readHistory(): HistoryItem[] {
  return safeRead();
}

export type RecordHistoryInput =
  | { type: "movie"; id: number; title: string; posterPath: string | null }
  | {
      type: "tv";
      id: number;
      title: string;
      posterPath: string | null;
      season: number;
      episode: number;
    }
  | {
      type: "anime";
      anilistId: number;
      title: string;
      coverUrl: string | null;
      episode: number;
      format: AnimeStorageFormat;
    };

function toHistoryKey(input: RecordHistoryInput): HistoryKeyInput {
  if (input.type === "movie") return { type: "movie", id: input.id };
  if (input.type === "tv") {
    return {
      type: "tv",
      id: input.id,
      season: input.season,
      episode: input.episode,
    };
  }
  return { type: "anime", anilistId: input.anilistId, episode: input.episode };
}

function entryKey(item: HistoryItem): string {
  return makeHistoryKey(item);
}

export function recordHistory(input: RecordHistoryInput): void {
  const list = safeRead();
  const key = makeHistoryKey(toHistoryKey(input));
  const filtered = list.filter((item) => entryKey(item) !== key);
  const next: HistoryItem[] = [
    { ...input, watchedAt: Date.now() } as HistoryItem,
    ...filtered,
  ].slice(0, HISTORY_MAX_ITEMS);
  safeWrite(next);
}

export function clearHistory(): void {
  safeWrite([]);
}
