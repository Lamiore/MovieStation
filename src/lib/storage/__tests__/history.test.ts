import { describe, it, expect, beforeEach } from "vitest";
import {
  readHistory,
  recordHistory,
  clearHistory,
} from "@/lib/storage/history";
import { HISTORY_MAX_ITEMS } from "@/lib/storage/schema";

describe("history storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
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
    expect(list[0].id).toBe(HISTORY_MAX_ITEMS + 4);
  });

  it("clearHistory empties the list", () => {
    recordHistory({ id: 1, type: "movie", title: "A", posterPath: null });
    clearHistory();
    expect(readHistory()).toEqual([]);
  });
});
