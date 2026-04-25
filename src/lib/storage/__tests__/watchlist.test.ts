import { describe, it, expect, beforeEach } from "vitest";
import {
  readWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from "@/lib/storage/watchlist";

describe("watchlist storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
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
    window.localStorage.setItem("nonton:watchlist", "{not valid json");
    expect(readWatchlist()).toEqual([]);
  });

  it("returns empty list when running on server (no window)", async () => {
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
