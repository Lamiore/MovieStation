import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("getTrendingMovies", () => {
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

  it("calls /trending/movie/week and returns results", async () => {
    const payload = {
      page: 1,
      results: [
        {
          id: 27205,
          title: "Inception",
          original_title: "Inception",
          overview: "A thief…",
          poster_path: "/poster.jpg",
          backdrop_path: "/backdrop.jpg",
          release_date: "2010-07-16",
          vote_average: 8.3,
          genre_ids: [28, 878],
          adult: false,
          original_language: "en",
          popularity: 100,
          video: false,
          vote_count: 10000,
        },
      ],
      total_pages: 1,
      total_results: 1,
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getTrendingMovies } = await import("@/lib/tmdb/movies");
    const result = await getTrendingMovies();

    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toBe("Inception");
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/trending/movie/week");
  });

  it("accepts a locale override", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getTrendingMovies } = await import("@/lib/tmdb/movies");
    await getTrendingMovies({ locale: "en-US" });

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get("language")).toBe("en-US");
  });
});

describe("movie list endpoints", () => {
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

  const makeOk = () =>
    new Response(
      JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }),
      { status: 200 },
    );

  it.each([
    ["getPopularMovies", "/movie/popular"],
    ["getTopRatedMovies", "/movie/top_rated"],
    ["getUpcomingMovies", "/movie/upcoming"],
    ["getNowPlayingMovies", "/movie/now_playing"],
  ] as const)("%s calls %s", async (fnName, expectedPath) => {
    const fetchMock = vi.fn().mockResolvedValue(makeOk());
    global.fetch = fetchMock as unknown as typeof fetch;

    const mod = await import("@/lib/tmdb/movies");
    const fn = (mod as Record<string, unknown>)[fnName] as () => Promise<unknown>;
    expect(fn).toBeDefined();
    await fn();

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain(expectedPath);
  });
});

describe("movie detail endpoints", () => {
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

  it("getMovieDetail calls /movie/:id", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 27205, title: "Inception", genres: [] }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getMovieDetail } = await import("@/lib/tmdb/movies");
    await getMovieDetail(27205);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/movie/27205");
    expect(url).not.toContain("/movie/27205/");
  });

  it("getMovieCredits calls /movie/:id/credits", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 27205, cast: [], crew: [] }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getMovieCredits } = await import("@/lib/tmdb/movies");
    await getMovieCredits(27205);

    expect(fetchMock.mock.calls[0][0]).toContain("/movie/27205/credits");
  });

  it("getMovieVideos calls /movie/:id/videos", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 27205, results: [] }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getMovieVideos } = await import("@/lib/tmdb/movies");
    await getMovieVideos(27205);

    expect(fetchMock.mock.calls[0][0]).toContain("/movie/27205/videos");
  });

  it("getMovieSimilar calls /movie/:id/similar", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getMovieSimilar } = await import("@/lib/tmdb/movies");
    await getMovieSimilar(27205);

    expect(fetchMock.mock.calls[0][0]).toContain("/movie/27205/similar");
  });
});
