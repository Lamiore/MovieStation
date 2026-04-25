import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWatchlist } from "@/hooks/useWatchlist";

describe("useWatchlist", () => {
  beforeEach(() => {
    window.localStorage.clear();
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
