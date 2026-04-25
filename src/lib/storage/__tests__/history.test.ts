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
    const first = list[0];
    if (first.type !== "movie") throw new Error("expected movie");
    expect(first.id).toBe(HISTORY_MAX_ITEMS + 4);
  });

  it("clearHistory empties the list", () => {
    recordHistory({ id: 1, type: "movie", title: "A", posterPath: null });
    clearHistory();
    expect(readHistory()).toEqual([]);
  });

  it("records an anime episode entry", () => {
    recordHistory({
      type: "anime",
      anilistId: 21,
      title: "One Piece",
      coverUrl: "https://s4.anilist.co/file/anilistcdn/p.jpg",
      episode: 1100,
      format: "TV",
    });
    const list = readHistory();
    expect(list).toHaveLength(1);
    const entry = list[0];
    if (entry.type !== "anime") throw new Error("expected anime");
    expect(entry.anilistId).toBe(21);
    expect(entry.episode).toBe(1100);
    expect(entry.coverUrl).toContain("anilistcdn");
    expect(entry.watchedAt).toBeTypeOf("number");
  });

  it("treats different anime episodes of the same series as separate entries", () => {
    recordHistory({
      type: "anime",
      anilistId: 21,
      title: "One Piece",
      coverUrl: null,
      episode: 1099,
      format: "TV",
    });
    recordHistory({
      type: "anime",
      anilistId: 21,
      title: "One Piece",
      coverUrl: null,
      episode: 1100,
      format: "TV",
    });
    expect(readHistory()).toHaveLength(2);
  });
});
