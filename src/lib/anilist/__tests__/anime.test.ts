import { describe, it, expect, vi, afterEach } from "vitest";

const SUMMARY = {
  id: 1,
  title: { romaji: "X", english: null, native: null, userPreferred: "X" },
  coverImage: { large: null, extraLarge: null, color: null },
  bannerImage: null,
  format: "TV",
  episodes: 12,
  averageScore: 80,
  status: "FINISHED",
  season: null,
  seasonYear: null,
  genres: [],
};

function mockResponse(data: unknown) {
  return new Response(JSON.stringify({ data }), { status: 200 });
}

describe("anilist anime fetchers", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetModules();
  });

  it("getTrendingAnime sends sort=TRENDING_DESC and respects limit", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({ Page: { media: [SUMMARY] } }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getTrendingAnime } = await import("@/lib/anilist/anime");
    const list = await getTrendingAnime(20);

    expect(list).toHaveLength(1);
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.variables).toMatchObject({ perPage: 20, sort: ["TRENDING_DESC"] });
  });

  it("getCurrentlyAiring sends status=RELEASING", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({ Page: { media: [] } }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getCurrentlyAiring } = await import("@/lib/anilist/anime");
    await getCurrentlyAiring(20);

    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.variables.status).toBe("RELEASING");
  });

  it("getTopAnimeMovies sends format=MOVIE and sort=POPULARITY_DESC", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({ Page: { media: [] } }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getTopAnimeMovies } = await import("@/lib/anilist/anime");
    await getTopAnimeMovies(20);

    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.variables).toMatchObject({
      format: "MOVIE",
      sort: ["POPULARITY_DESC"],
    });
  });

  it("getAnimeByGenre passes the genre variable", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({ Page: { media: [] } }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getAnimeByGenre } = await import("@/lib/anilist/anime");
    await getAnimeByGenre("Action", 20);

    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.variables.genre).toBe("Action");
  });

  it("getAnimeDetail uses DETAIL_QUERY with id variable", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({
        Media: {
          ...SUMMARY,
          description: "<p>desc</p>",
          duration: 24,
          studios: { nodes: [] },
          trailer: null,
          relations: { edges: [] },
          recommendations: { nodes: [] },
          characters: { edges: [] },
        },
      }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getAnimeDetail } = await import("@/lib/anilist/anime");
    const detail = await getAnimeDetail(1);

    expect(detail.id).toBe(1);
    expect(detail.duration).toBe(24);
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.variables).toEqual({ id: 1 });
    expect(body.query).toMatch(/Media\(id:\s*\$id/);
  });

  it("searchAnime sends q + perPage", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({ Page: { media: [] } }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { searchAnime } = await import("@/lib/anilist/anime");
    await searchAnime("naruto", 20);

    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.variables).toEqual({ q: "naruto", perPage: 20 });
  });
});
