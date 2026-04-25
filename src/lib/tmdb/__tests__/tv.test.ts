import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("tv endpoints", () => {
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

  const okEmpty = () =>
    new Response(
      JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }),
      { status: 200 },
    );

  it.each([
    ["getPopularTv", "/tv/popular"],
    ["getTopRatedTv", "/tv/top_rated"],
  ] as const)("%s calls %s", async (fnName, expectedPath) => {
    const fetchMock = vi.fn().mockResolvedValue(okEmpty());
    global.fetch = fetchMock as unknown as typeof fetch;

    const mod = await import("@/lib/tmdb/tv");
    const fn = (mod as Record<string, unknown>)[fnName] as () => Promise<unknown>;
    expect(fn).toBeDefined();
    await fn();

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain(expectedPath);
  });

  it("returns the parsed payload from getPopularTv", async () => {
    const payload = {
      page: 1,
      results: [
        {
          id: 1399,
          name: "Game of Thrones",
          original_name: "Game of Thrones",
          overview: "Seven noble families…",
          poster_path: "/got.jpg",
          backdrop_path: "/got-backdrop.jpg",
          first_air_date: "2011-04-17",
          vote_average: 8.4,
          genre_ids: [10765, 18],
          adult: false,
          original_language: "en",
          popularity: 200,
          origin_country: ["US"],
          vote_count: 20000,
        },
      ],
      total_pages: 1,
      total_results: 1,
    };
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })) as unknown as typeof fetch;

    const { getPopularTv } = await import("@/lib/tmdb/tv");
    const result = await getPopularTv();

    expect(result.results).toHaveLength(1);
    expect(result.results[0].name).toBe("Game of Thrones");
  });
});
