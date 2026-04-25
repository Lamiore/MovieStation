"use client";

import { useCallback } from "react";
import {
  STORAGE_KEYS,
  makeWatchlistKey,
  type WatchlistItem,
} from "@/lib/storage/schema";
import {
  readWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "@/lib/storage/watchlist";
import { useLocalStorageSync } from "./useLocalStorageSync";

export interface ToggleInput {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
}

export interface UseWatchlistResult {
  list: WatchlistItem[];
  isInWatchlist: (input: { id: number; type: "movie" | "tv" }) => boolean;
  toggle: (input: ToggleInput) => void;
  add: (input: ToggleInput) => void;
  remove: (input: { id: number; type: "movie" | "tv" }) => void;
}

export function useWatchlist(): UseWatchlistResult {
  const { value: list, refresh } = useLocalStorageSync(
    readWatchlist,
    STORAGE_KEYS.watchlist,
    [] as WatchlistItem[],
  );

  const has = useCallback(
    (input: { id: number; type: "movie" | "tv" }) => {
      const key = makeWatchlistKey(input);
      return list.some((item) => makeWatchlistKey(item) === key);
    },
    [list],
  );

  const add = useCallback(
    (input: ToggleInput) => {
      addToWatchlist(input);
      refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    (input: { id: number; type: "movie" | "tv" }) => {
      removeFromWatchlist(input);
      refresh();
    },
    [refresh],
  );

  const toggle = useCallback(
    (input: ToggleInput) => {
      if (has(input)) remove(input);
      else add(input);
    },
    [has, add, remove],
  );

  return { list, isInWatchlist: has, toggle, add, remove };
}
