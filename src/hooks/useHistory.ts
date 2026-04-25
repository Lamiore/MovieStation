"use client";

import { useCallback } from "react";
import { STORAGE_KEYS, type HistoryItem } from "@/lib/storage/schema";
import {
  readHistory,
  recordHistory,
  clearHistory,
  type RecordHistoryInput,
} from "@/lib/storage/history";
import { useLocalStorageSync } from "./useLocalStorageSync";

export interface UseHistoryResult {
  list: HistoryItem[];
  record: (input: RecordHistoryInput) => void;
  clear: () => void;
}

export function useHistory(): UseHistoryResult {
  const { value: list, refresh } = useLocalStorageSync(
    readHistory,
    STORAGE_KEYS.history,
    [] as HistoryItem[],
  );

  const record = useCallback(
    (input: RecordHistoryInput) => {
      recordHistory(input);
      refresh();
    },
    [refresh],
  );

  const clear = useCallback(() => {
    clearHistory();
    refresh();
  }, [refresh]);

  return { list, record, clear };
}
