import {
  HISTORY_MAX_ITEMS,
  STORAGE_KEYS,
  makeHistoryKey,
  type HistoryItem,
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

export interface RecordHistoryInput {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  season?: number;
  episode?: number;
}

export function recordHistory(input: RecordHistoryInput): void {
  const list = safeRead();
  const key = makeHistoryKey(input);
  const filtered = list.filter((item) => makeHistoryKey(item) !== key);
  const next: HistoryItem[] = [
    { ...input, watchedAt: Date.now() },
    ...filtered,
  ].slice(0, HISTORY_MAX_ITEMS);
  safeWrite(next);
}

export function clearHistory(): void {
  safeWrite([]);
}
