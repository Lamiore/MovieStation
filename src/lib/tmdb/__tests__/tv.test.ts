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

describe("tv detail endpoints", () => {
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

  it("getTvDetail calls /tv/:id", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 1399, name: "GoT", genres: [], seasons: [] }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getTvDetail } = await import("@/lib/tmdb/tv");
    await getTvDetail(1399);

    expect(fetchMock.mock.calls[0][0]).toContain("/tv/1399");
  });

  it("getTvCredits calls /tv/:id/credits", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 1399, cast: [], crew: [] }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getTvCredits } = await import("@/lib/tmdb/tv");
    await getTvCredits(1399);

    expect(fetchMock.mock.calls[0][0]).toContain("/tv/1399/credits");
  });

  it("getSeasonDetail calls /tv/:tvId/season/:seasonNumber", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 1, season_number: 1, episodes: [] }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getSeasonDetail } = await import("@/lib/tmdb/tv");
    await getSeasonDetail(1399, 1);

    expect(fetchMock.mock.calls[0][0]).toContain("/tv/1399/season/1");
  });

  it("getTvSimilar calls /tv/:id/similar", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }),
          { status: 200 },
        ),
      );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getTvSimilar } = await import("@/lib/tmdb/tv");
    await getTvSimilar(1399);

    expect(fetchMock.mock.calls[0][0]).toContain("/tv/1399/similar");
  });
});

describe("discoverTv", () => {
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

  it("calls /discover/tv with first_air_date_year", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { discoverTv } = await import("@/lib/tmdb/tv");
    await discoverTv({ year: 2023, sortBy: "popularity.desc" });

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.pathname).toBe("/3/discover/tv");
    expect(url.searchParams.get("first_air_date_year")).toBe("2023");
    expect(url.searchParams.get("sort_by")).toBe("popularity.desc");
  });
});
