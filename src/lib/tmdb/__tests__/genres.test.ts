import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("genre endpoints", () => {
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

  const okGenres = () =>
    new Response(JSON.stringify({ genres: [{ id: 28, name: "Action" }] }), { status: 200 });

  it("getMovieGenres calls /genre/movie/list", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okGenres());
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getMovieGenres } = await import("@/lib/tmdb/genres");
    const result = await getMovieGenres();

    expect(fetchMock.mock.calls[0][0]).toContain("/genre/movie/list");
    expect(result.genres[0].name).toBe("Action");
  });

  it("getTvGenres calls /genre/tv/list", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okGenres());
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getTvGenres } = await import("@/lib/tmdb/genres");
    await getTvGenres();

    expect(fetchMock.mock.calls[0][0]).toContain("/genre/tv/list");
  });
});
