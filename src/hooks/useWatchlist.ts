"use client";

import { useCallback } from "react";
import {
  STORAGE_KEYS,
  makeWatchlistKey,
  type WatchlistItem,
  type WatchlistKeyInput,
} from "@/lib/storage/schema";
import {
  readWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  type WatchlistInput,
} from "@/lib/storage/watchlist";
import { useLocalStorageSync } from "./useLocalStorageSync";

export interface UseWatchlistResult {
  list: WatchlistItem[];
  isInWatchlist: (input: WatchlistKeyInput) => boolean;
  toggle: (input: WatchlistInput) => void;
  add: (input: WatchlistInput) => void;
  remove: (input: WatchlistKeyInput) => void;
}

export function useWatchlist(): UseWatchlistResult {
  const { value: list, refresh } = useLocalStorageSync(
    readWatchlist,
    STORAGE_KEYS.watchlist,
    [] as WatchlistItem[],
  );

  const has = useCallback(
    (input: WatchlistKeyInput) => {
      const key = makeWatchlistKey(input);
      return list.some((item) => makeWatchlistKey(item) === key);
    },
    [list],
  );

  const add = useCallback(
    (input: WatchlistInput) => {
      addToWatchlist(input);
      refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    (input: WatchlistKeyInput) => {
      removeFromWatchlist(input);
      refresh();
    },
    [refresh],
  );

  const toggle = useCallback(
    (input: WatchlistInput) => {
      const keyInput: WatchlistKeyInput =
        input.type === "anime"
          ? { type: "anime", anilistId: input.anilistId }
          : { type: input.type, id: input.id };
      if (has(keyInput)) remove(keyInput);
      else add(input);
    },
    [has, add, remove],
  );

  return { list, isInWatchlist: has, toggle, add, remove };
}
