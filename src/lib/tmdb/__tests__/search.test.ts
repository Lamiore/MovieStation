import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("multiSearch", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.TMDB_READ_TOKEN;

  beforeEach(() => {
    process.env.TMDB_READ_TOKEN = "test-token";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.TMDB_READ_TOKEN = originalEnv;
    vi.resetModules();
  });

  it("calls /search/multi with the query", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { multiSearch } = await import("@/lib/tmdb/search");
    await multiSearch("inception");

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.pathname).toBe("/3/search/multi");
    expect(url.searchParams.get("query")).toBe("inception");
  });

  it("returns parsed results", async () => {
    const payload = {
      page: 1,
      results: [
        { id: 27205, media_type: "movie", title: "Inception", release_date: "2010" },
        { id: 1399, media_type: "tv", name: "GoT", first_air_date: "2011" },
      ],
      total_pages: 1,
      total_results: 2,
    };
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })) as unknown as typeof fetch;

    const { multiSearch } = await import("@/lib/tmdb/search");
    const result = await multiSearch("anything");
    expect(result.results).toHaveLength(2);
  });
});
