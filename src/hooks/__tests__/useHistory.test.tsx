import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHistory } from "@/hooks/useHistory";

describe("useHistory", () => {
  beforeEach(() => {
    window.localStorage.clear();
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
