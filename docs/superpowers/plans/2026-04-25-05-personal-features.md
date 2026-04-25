# Plan 5: Personal Features (Watchlist + History + Continue Watching)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Persist user state in `localStorage` so the app gains memory: a watchlist of saved titles, a history of recently watched episodes/movies, and a "Continue Watching" row on the homepage. Wire the placeholder `<WatchlistButton>` (Plan 3) to real toggle behavior. Track watch-page visits automatically.

**Architecture:** A small storage layer with SSR-safe hooks. Hooks return empty state on server + first client render, then hydrate inside `useEffect` (avoids hydration mismatch). Cross-tab sync via `window.addEventListener("storage")`. Auto-trim history to 100 most recent entries on write.

**Tech Stack:** React 19, TypeScript. No new deps.

**Deferred:** Settings page (clear history, export/import). Privacy banner for incognito mode (where localStorage is non-persistent).

---

## Plan 1-4 recap

These exist already:
- Full homepage, detail pages (movie + TV), watch pages (movie + TV with prev/next + episode list)
- `<WatchlistButton>` is a placeholder — accepts `isInWatchlist` and `onToggle` props but currently never sees real values
- `<MediaCard>`, `<MediaRow>`, `<MediaCardSkeleton>`
- 52 tests passing

---

## File structure (this plan adds)

```
src/lib/storage/
  schema.ts                          # NEW — types + storage keys
  watchlist.ts                       # NEW — pure read/write functions
  history.ts                         # NEW — pure read/write functions
  __tests__/
    watchlist.test.ts
    history.test.ts
src/hooks/
  useLocalStorageSync.ts             # NEW — generic SSR-safe + cross-tab hook
  useWatchlist.ts                    # NEW
  useHistory.ts                      # NEW
  __tests__/
    useWatchlist.test.tsx
    useHistory.test.tsx
src/components/detail/
  WatchlistButton.tsx                # MODIFIED — now self-wires via useWatchlist
src/components/player/
  WatchTracker.tsx                   # NEW — Client Component, records to history
src/app/
  watchlist/page.tsx                 # NEW
  history/page.tsx                   # NEW
  watch/movie/[id]/page.tsx          # MODIFIED — render <WatchTracker>
  watch/tv/[id]/[season]/[episode]/page.tsx  # MODIFIED — render <WatchTracker>
  page.tsx                           # MODIFIED — add Continue Watching row
src/components/personal/
  ContinueWatchingRow.tsx            # NEW — Client Component, reads history
```

---

### Task 1: storage schema + key constants

**Files:**
- Create: `src/lib/storage/schema.ts`

- [ ] **Step 1: Write the file**

Write to `src/lib/storage/schema.ts`:

```ts
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
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/lib/storage/schema.ts
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(storage): schema + storage keys"
```

---

### Task 2: watchlist storage module (TDD)

**Files:**
- Create: `src/lib/storage/__tests__/watchlist.test.ts`
- Create: `src/lib/storage/watchlist.ts`

Pure functions over `localStorage`. The hook layer (Task 4) wraps these for React. We split this way so the storage logic can be tested without React.

- [ ] **Step 1: Write failing test**

Write to `src/lib/storage/__tests__/watchlist.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  readWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from "@/lib/storage/watchlist";

describe("watchlist storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty", () => {
    expect(readWatchlist()).toEqual([]);
  });

  it("adds an item and persists it", () => {
    addToWatchlist({
      id: 27205,
      type: "movie",
      title: "Inception",
      posterPath: "/p.jpg",
    });

    const list = readWatchlist();
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe("Inception");
    expect(list[0].addedAt).toBeTypeOf("number");
  });

  it("does not add duplicates (same id+type)", () => {
    const item = {
      id: 27205,
      type: "movie" as const,
      title: "Inception",
      posterPath: null,
    };
    addToWatchlist(item);
    addToWatchlist(item);
    expect(readWatchlist()).toHaveLength(1);
  });

  it("removes by id+type", () => {
    addToWatchlist({ id: 1, type: "movie", title: "A", posterPath: null });
    addToWatchlist({ id: 2, type: "movie", title: "B", posterPath: null });
    removeFromWatchlist({ id: 1, type: "movie" });

    const list = readWatchlist();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(2);
  });

  it("isInWatchlist reflects add/remove", () => {
    expect(isInWatchlist({ id: 1, type: "movie" })).toBe(false);
    addToWatchlist({ id: 1, type: "movie", title: "A", posterPath: null });
    expect(isInWatchlist({ id: 1, type: "movie" })).toBe(true);
    removeFromWatchlist({ id: 1, type: "movie" });
    expect(isInWatchlist({ id: 1, type: "movie" })).toBe(false);
  });

  it("treats movie:1 and tv:1 as different items", () => {
    addToWatchlist({ id: 1, type: "movie", title: "Movie A", posterPath: null });
    addToWatchlist({ id: 1, type: "tv", title: "TV A", posterPath: null });
    expect(readWatchlist()).toHaveLength(2);
    expect(isInWatchlist({ id: 1, type: "movie" })).toBe(true);
    expect(isInWatchlist({ id: 1, type: "tv" })).toBe(true);
  });

  it("returns empty list when localStorage value is corrupt", () => {
    localStorage.setItem("nonton:watchlist", "{not valid json");
    expect(readWatchlist()).toEqual([]);
  });

  it("returns empty list when running on server (no window)", async () => {
    // Vitest jsdom does have `window`; we instead verify the readWatchlist
    // function returns [] when the global `window` is briefly stubbed away.
    const original = globalThis.window;
    // @ts-expect-error — temporarily remove window
    delete globalThis.window;
    try {
      expect(readWatchlist()).toEqual([]);
    } finally {
      globalThis.window = original;
    }
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/lib/storage/__tests__/watchlist.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Write to `src/lib/storage/watchlist.ts`:

```ts
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
    // quota / serialization errors — surface upstream by ignoring here.
    // Hook can detect divergence via storage event.
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
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 60 tests pass (52 + 8 watchlist).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/lib/storage
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(storage): watchlist read/add/remove/check functions"
```

---

### Task 3: history storage module (TDD)

**Files:**
- Create: `src/lib/storage/__tests__/history.test.ts`
- Create: `src/lib/storage/history.ts`

Behavior: writes upsert by composite key (movie:id or tv:id:s:e). Newest entry moves to front. Auto-trims to `HISTORY_MAX_ITEMS`.

- [ ] **Step 1: Write failing test**

Write to `src/lib/storage/__tests__/history.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  readHistory,
  recordHistory,
  clearHistory,
} from "@/lib/storage/history";
import { HISTORY_MAX_ITEMS } from "@/lib/storage/schema";

describe("history storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty", () => {
    expect(readHistory()).toEqual([]);
  });

  it("records an item with watchedAt timestamp", () => {
    recordHistory({
      id: 27205,
      type: "movie",
      title: "Inception",
      posterPath: "/p.jpg",
    });
    const list = readHistory();
    expect(list).toHaveLength(1);
    expect(list[0].watchedAt).toBeTypeOf("number");
  });

  it("upserts the same movie (replaces, doesn't duplicate)", () => {
    recordHistory({ id: 1, type: "movie", title: "A", posterPath: null });
    recordHistory({ id: 1, type: "movie", title: "A (refreshed)", posterPath: null });
    const list = readHistory();
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe("A (refreshed)");
  });

  it("treats different episodes as separate entries", () => {
    recordHistory({
      id: 1399,
      type: "tv",
      title: "GoT",
      posterPath: null,
      season: 1,
      episode: 1,
    });
    recordHistory({
      id: 1399,
      type: "tv",
      title: "GoT",
      posterPath: null,
      season: 1,
      episode: 2,
    });
    expect(readHistory()).toHaveLength(2);
  });

  it("most recent entry is first", () => {
    recordHistory({ id: 1, type: "movie", title: "First", posterPath: null });
    recordHistory({ id: 2, type: "movie", title: "Second", posterPath: null });
    expect(readHistory()[0].title).toBe("Second");
  });

  it("trims oldest entries past HISTORY_MAX_ITEMS", () => {
    for (let i = 0; i < HISTORY_MAX_ITEMS + 5; i += 1) {
      recordHistory({ id: i, type: "movie", title: `M${i}`, posterPath: null });
    }
    const list = readHistory();
    expect(list).toHaveLength(HISTORY_MAX_ITEMS);
    // newest first
    expect(list[0].id).toBe(HISTORY_MAX_ITEMS + 4);
  });

  it("clearHistory empties the list", () => {
    recordHistory({ id: 1, type: "movie", title: "A", posterPath: null });
    clearHistory();
    expect(readHistory()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/lib/storage/__tests__/history.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Write to `src/lib/storage/history.ts`:

```ts
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
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 67 tests pass (60 + 7 history).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/lib/storage
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(storage): history read/record/clear with auto-trim"
```

---

### Task 4: Generic SSR-safe storage hook

**Files:**
- Create: `src/hooks/useLocalStorageSync.ts`

Hook that:
1. Returns initial state (typically empty) on first render to avoid hydration mismatch
2. Hydrates real value inside `useEffect`
3. Subscribes to `window.storage` events for cross-tab sync
4. Provides a `refresh()` callback to re-read after a same-tab write

- [ ] **Step 1: Implement**

Write to `src/hooks/useLocalStorageSync.ts`:

```ts
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
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/hooks/useLocalStorageSync.ts
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(hooks): useLocalStorageSync — SSR-safe + cross-tab"
```

---

### Task 5: useWatchlist hook (TDD)

**Files:**
- Create: `src/hooks/__tests__/useWatchlist.test.tsx`
- Create: `src/hooks/useWatchlist.ts`

- [ ] **Step 1: Write failing test**

Write to `src/hooks/__tests__/useWatchlist.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWatchlist } from "@/hooks/useWatchlist";

describe("useWatchlist", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty list initially", () => {
    const { result } = renderHook(() => useWatchlist());
    expect(result.current.list).toEqual([]);
    expect(result.current.isInWatchlist({ id: 1, type: "movie" })).toBe(false);
  });

  it("toggle adds when missing and removes when present", () => {
    const { result } = renderHook(() => useWatchlist());

    act(() => {
      result.current.toggle({
        id: 27205,
        type: "movie",
        title: "Inception",
        posterPath: "/p.jpg",
      });
    });

    expect(result.current.list).toHaveLength(1);
    expect(
      result.current.isInWatchlist({ id: 27205, type: "movie" }),
    ).toBe(true);

    act(() => {
      result.current.toggle({
        id: 27205,
        type: "movie",
        title: "Inception",
        posterPath: "/p.jpg",
      });
    });

    expect(result.current.list).toHaveLength(0);
    expect(
      result.current.isInWatchlist({ id: 27205, type: "movie" }),
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/hooks/__tests__/useWatchlist.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Write to `src/hooks/useWatchlist.ts`:

```ts
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
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 69 tests pass (67 + 2 useWatchlist).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/hooks
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(hooks): useWatchlist"
```

---

### Task 6: useHistory hook (TDD)

**Files:**
- Create: `src/hooks/__tests__/useHistory.test.tsx`
- Create: `src/hooks/useHistory.ts`

- [ ] **Step 1: Write failing test**

Write to `src/hooks/__tests__/useHistory.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHistory } from "@/hooks/useHistory";

describe("useHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty initially", () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.list).toEqual([]);
  });

  it("record appends to the front", () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.record({
        id: 1,
        type: "movie",
        title: "First",
        posterPath: null,
      });
    });
    act(() => {
      result.current.record({
        id: 2,
        type: "movie",
        title: "Second",
        posterPath: null,
      });
    });

    expect(result.current.list[0].title).toBe("Second");
    expect(result.current.list).toHaveLength(2);
  });

  it("clear empties the list", () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.record({
        id: 1,
        type: "movie",
        title: "A",
        posterPath: null,
      });
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.list).toEqual([]);
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/hooks/__tests__/useHistory.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Write to `src/hooks/useHistory.ts`:

```ts
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
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 72 tests pass (69 + 3 useHistory).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/hooks
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(hooks): useHistory"
```

---

### Task 7: Wire WatchlistButton with useWatchlist

**Files:**
- Modify: `src/components/detail/WatchlistButton.tsx`
- Modify: `src/components/detail/__tests__/WatchlistButton.test.tsx`

The placeholder accepted `isInWatchlist` and `onToggle` as props. Now the component looks them up itself via the hook. The page-level call sites in Plan 3 already pass `id`, `type`, `title`, `posterPath` would need to be added — let me check.

Actually the plan-3 call sites only pass `id` and `type`. We need to also pass `title` and `posterPath` so the button can write a complete watchlist entry. So this task also touches the movie + TV detail pages.

- [ ] **Step 1: Update tests**

Replace `src/components/detail/__tests__/WatchlistButton.test.tsx` with:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WatchlistButton } from "@/components/detail/WatchlistButton";

const SAMPLE = {
  id: 27205,
  type: "movie" as const,
  title: "Inception",
  posterPath: "/p.jpg",
};

describe("WatchlistButton", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts as 'Tambah ke Watchlist' when nothing in storage", () => {
    render(<WatchlistButton {...SAMPLE} />);
    expect(
      screen.getByRole("button", { name: /tambah ke watchlist/i }),
    ).toBeInTheDocument();
  });

  it("clicking once writes to localStorage and updates label", async () => {
    render(<WatchlistButton {...SAMPLE} />);
    await userEvent.click(screen.getByRole("button"));

    expect(
      screen.getByRole("button", { name: /sudah di watchlist/i }),
    ).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem("nonton:watchlist")!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(27205);
  });

  it("clicking again removes the item", async () => {
    render(<WatchlistButton {...SAMPLE} />);
    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("button"));
    expect(
      screen.getByRole("button", { name: /tambah ke watchlist/i }),
    ).toBeInTheDocument();
    expect(localStorage.getItem("nonton:watchlist")).toBe("[]");
  });

  it("reads existing watchlist value on mount", () => {
    localStorage.setItem(
      "nonton:watchlist",
      JSON.stringify([{ ...SAMPLE, addedAt: 1 }]),
    );
    render(<WatchlistButton {...SAMPLE} />);
    expect(
      screen.getByRole("button", { name: /sudah di watchlist/i }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/components/detail/__tests__/WatchlistButton.test.tsx
```

Expected: tests fail because the current component still uses `isInWatchlist` prop, not internal hook.

- [ ] **Step 3: Update implementation**

Replace `src/components/detail/WatchlistButton.tsx` with:

```tsx
"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";

export interface WatchlistButtonProps {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
}

export function WatchlistButton({
  id,
  type,
  title,
  posterPath,
}: WatchlistButtonProps) {
  const { isInWatchlist, toggle } = useWatchlist();
  const inList = isInWatchlist({ id, type });
  const Icon = inList ? BookmarkCheck : Bookmark;
  const label = inList ? "Sudah di Watchlist" : "Tambah ke Watchlist";

  return (
    <button
      type="button"
      onClick={() => toggle({ id, type, title, posterPath })}
      className="inline-flex items-center gap-2 rounded-md bg-elevated px-4 py-2 text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-elevated/80"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
```

The `isInWatchlist` and `onToggle` props are removed — call sites now must pass `title` and `posterPath`.

- [ ] **Step 4: Update call sites**

In `src/app/movie/[id]/page.tsx`, change:

```tsx
<WatchlistButton id={detail.id} type="movie" />
```

to:

```tsx
<WatchlistButton
  id={detail.id}
  type="movie"
  title={detail.title}
  posterPath={detail.poster_path}
/>
```

In `src/app/tv/[id]/page.tsx`, change:

```tsx
<WatchlistButton id={detail.id} type="tv" />
```

to:

```tsx
<WatchlistButton
  id={detail.id}
  type="tv"
  title={detail.name}
  posterPath={detail.poster_path}
/>
```

- [ ] **Step 5: Run, confirm pass**

```bash
npm run test
npm run build
```

Expected: 76 tests pass (72 + 4 new). Build succeeds.

- [ ] **Step 6: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/detail src/app
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat: wire WatchlistButton with useWatchlist hook"
```

---

### Task 8: WatchTracker Client Component

**Files:**
- Create: `src/components/player/WatchTracker.tsx`

A client component that, on mount, calls `useHistory().record(...)` once. Mounted by both watch pages.

- [ ] **Step 1: Implement**

Write to `src/components/player/WatchTracker.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useHistory } from "@/hooks/useHistory";
import type { RecordHistoryInput } from "@/lib/storage/history";

export interface WatchTrackerProps {
  payload: RecordHistoryInput;
}

export function WatchTracker({ payload }: WatchTrackerProps) {
  const { record } = useHistory();
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    record(payload);
    // We intentionally don't depend on `payload` — re-mounting the
    // tracker for the same route shouldn't double-write. Navigating
    // to a new episode unmounts and remounts naturally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
```

No tests — the behavior is "writes once on mount" which is awkward to RTL. The watchlist+history hook tests already cover the underlying record logic.

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/player/WatchTracker.tsx
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(player): WatchTracker — records to history on mount"
```

---

### Task 9: Mount WatchTracker in watch pages

**Files:**
- Modify: `src/app/watch/movie/[id]/page.tsx`
- Modify: `src/app/watch/tv/[id]/[season]/[episode]/page.tsx`

- [ ] **Step 1: Add to movie watch page**

In `src/app/watch/movie/[id]/page.tsx`, add the import:

```tsx
import { WatchTracker } from "@/components/player/WatchTracker";
```

And inside the `<main>`, anywhere after the `<VidkingPlayer>`, add:

```tsx
<WatchTracker
  payload={{
    id: detail.id,
    type: "movie",
    title: detail.title,
    posterPath: detail.poster_path,
  }}
/>
```

- [ ] **Step 2: Add to TV watch page**

In `src/app/watch/tv/[id]/[season]/[episode]/page.tsx`, add the import:

```tsx
import { WatchTracker } from "@/components/player/WatchTracker";
```

And inside the `<main>`:

```tsx
<WatchTracker
  payload={{
    id: detail.id,
    type: "tv",
    title: detail.name,
    posterPath: detail.poster_path,
    season: seasonNumber,
    episode: episodeNumber,
  }}
/>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
npm run test
```

Both pass.

- [ ] **Step 4: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/app/watch
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat: mount WatchTracker on movie and tv watch pages"
```

---

### Task 10: Watchlist page

**Files:**
- Create: `src/app/watchlist/page.tsx`

Client Component (uses `useWatchlist`). Renders a grid of `<MediaCard>`s. Empty state when list is empty.

- [ ] **Step 1: Implement**

Write to `src/app/watchlist/page.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useWatchlist } from "@/hooks/useWatchlist";
import { MediaCard } from "@/components/media/MediaCard";

export default function WatchlistPage() {
  const { list } = useWatchlist();

  return (
    <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 md:px-8 md:py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Watchlist
        </h1>
        <p className="text-sm text-muted-foreground">
          {list.length > 0
            ? `${list.length} judul disimpan`
            : "Belum ada judul yang disimpan."}
        </p>
      </header>

      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Tambahkan film atau serial dari halaman detail untuk
            menyimpannya di sini.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Jelajahi Beranda
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {list.map((item) => (
            <div key={`${item.type}:${item.id}`} className="w-full">
              <MediaCard
                id={item.id}
                type={item.type}
                title={item.title}
                posterPath={item.posterPath}
                releaseDate=""
                voteAverage={0}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/app/watchlist
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat: watchlist page"
```

---

### Task 11: History page

**Files:**
- Create: `src/app/history/page.tsx`

- [ ] **Step 1: Implement**

Write to `src/app/history/page.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useHistory } from "@/hooks/useHistory";
import { MediaCard } from "@/components/media/MediaCard";

function buildHref(item: {
  id: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
}): string {
  if (item.type === "tv" && item.season != null && item.episode != null) {
    return `/watch/tv/${item.id}/${item.season}/${item.episode}`;
  }
  return `/watch/movie/${item.id}`;
}

export default function HistoryPage() {
  const { list, clear } = useHistory();

  return (
    <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Riwayat Tonton
          </h1>
          <p className="text-sm text-muted-foreground">
            {list.length > 0
              ? `${list.length} riwayat tersimpan`
              : "Belum ada riwayat tonton."}
          </p>
        </div>
        {list.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              if (confirm("Hapus semua riwayat tonton?")) clear();
            }}
            className="rounded-md bg-elevated px-3 py-1.5 text-sm font-medium text-text ring-1 ring-border hover:bg-elevated/80"
          >
            Hapus semua
          </button>
        ) : null}
      </header>

      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Riwayat akan muncul setelah kamu nonton film atau episode.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Mulai nonton
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {list.map((item) => (
            <li
              key={`${item.type}:${item.id}:${item.season ?? ""}:${item.episode ?? ""}`}
            >
              <Link href={buildHref(item)} className="block w-full">
                <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border">
                  {item.posterPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <p className="mt-2 truncate text-sm font-medium text-text">
                  {item.title}
                </p>
                {item.season != null && item.episode != null ? (
                  <p className="text-xs text-muted-foreground">
                    S{item.season} • E{item.episode}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

(Plain `<img>` for history items because the URLs come from localStorage and the page is fully client; using `next/image` here would require the same `image.tmdb.org` allowlist which is already configured, but the image-optimization layer doesn't add value for this small list view. The eslint-disable is intentional.)

- [ ] **Step 2: Build + commit**

```bash
npm run build
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/app/history
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat: history page with clear-all"
```

---

### Task 12: Continue Watching row on homepage

**Files:**
- Create: `src/components/personal/ContinueWatchingRow.tsx`
- Modify: `src/app/page.tsx`

Continue Watching is sourced from `useHistory()`. Renders only if list is non-empty. Each entry deep-links back to its watch page.

- [ ] **Step 1: Implement component**

Write to `src/components/personal/ContinueWatchingRow.tsx`:

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useHistory } from "@/hooks/useHistory";
import { MediaRow } from "@/components/media/MediaRow";

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

function buildHref(item: {
  id: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
}): string {
  if (item.type === "tv" && item.season != null && item.episode != null) {
    return `/watch/tv/${item.id}/${item.season}/${item.episode}`;
  }
  return `/watch/movie/${item.id}`;
}

export function ContinueWatchingRow() {
  const { list } = useHistory();
  const recent = list.slice(0, 12);
  if (recent.length === 0) return null;

  return (
    <MediaRow title="Lanjutkan Menonton">
      {recent.map((item) => (
        <Link
          key={`${item.type}:${item.id}:${item.season ?? ""}:${item.episode ?? ""}`}
          href={buildHref(item)}
          className="group block w-[160px] shrink-0 md:w-[200px]"
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border transition-transform group-hover:scale-[1.03]">
            {item.posterPath ? (
              <Image
                src={POSTER_BASE + item.posterPath}
                alt={item.title}
                fill
                sizes="(min-width: 768px) 200px, 160px"
                className="object-cover"
              />
            ) : null}
          </div>
          <p className="mt-2 truncate text-sm font-medium text-text">
            {item.title}
          </p>
          {item.season != null && item.episode != null ? (
            <p className="text-xs text-muted-foreground">
              S{item.season} • E{item.episode}
            </p>
          ) : null}
        </Link>
      ))}
    </MediaRow>
  );
}
```

- [ ] **Step 2: Add to homepage**

In `src/app/page.tsx`, add the import:

```tsx
import { ContinueWatchingRow } from "@/components/personal/ContinueWatchingRow";
```

And insert the row at the very top of the rows section, AFTER the hero Suspense:

```tsx
<ContinueWatchingRow />
```

(No Suspense wrapper — it's a Client Component, renders nothing if empty, and has no async loading.)

- [ ] **Step 3: Build + commit**

```bash
npm run build
npm run test
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/personal src/app/page.tsx
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat: Continue Watching row on homepage"
```

---

### Task 13: Manual smoke test

- [ ] **Step 1: Run dev server, ensure token set**

```bash
npm run dev
```

- [ ] **Step 2: Watchlist flow**

- Visit any movie detail page → click "Tambah ke Watchlist" → label changes to "Sudah di Watchlist"
- Open `/watchlist` → the title appears in the grid
- Click the title → returns to its detail page
- Click "Sudah di Watchlist" → label flips back, item disappears from `/watchlist`

- [ ] **Step 3: History flow**

- Visit a movie's `/watch/movie/<id>` page (or click Tonton) → wait a beat for the player to load
- Visit `/history` → the movie appears at the top
- Visit a TV episode `/watch/tv/<id>/<s>/<e>` → episode appears at top of `/history`
- Re-watching the same episode pushes it back to top (not duplicate)
- Visit homepage → "Lanjutkan Menonton" row appears with recent items

- [ ] **Step 4: Cross-tab sync**

- Open two browser tabs at `/watchlist`
- In tab 1, add an item via detail page
- Tab 2's `/watchlist` should refresh automatically (storage event)

- [ ] **Step 5: Clear history**

- Click "Hapus semua" on `/history` → confirm prompt → list empties

Stop dev server.

---

## Plan 5 done when:

- ~76 tests pass
- `npm run build` succeeds; routes include `/watchlist` and `/history`
- All manual smoke flows work
- ~12 new commits in `git log`

**Next plan:** Plan 6 — Search + Browse (autocomplete in header, dedicated search results page, browse with genre/year/rating/sort filters via URL state).
