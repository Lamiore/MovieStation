"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Subscribes a derived value (computed from localStorage) to:
 *   - first-mount hydration (after SSR)
 *   - other-tab writes via `storage` event
 *   - same-tab writes via the returned `refresh` callback
 *
 * `read` MUST return synchronously and be safe to call when
 * `typeof window === "undefined"`.
 */
export function useLocalStorageSync<T>(
  read: () => T,
  storageKey: string,
  initial: T,
): { value: T; refresh: () => void } {
  const [value, setValue] = useState<T>(initial);

  const refresh = useCallback(() => {
    setValue(read());
  }, [read]);

  useEffect(() => {
    refresh();

    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) {
        refresh();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh, storageKey]);

  return { value, refresh };
}
