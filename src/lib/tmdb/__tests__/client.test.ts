import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("tmdbFetch", () => {
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

  it("calls TMDB with bearer token, locale, and include_adult=false", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ results: [] }), { status: 200 }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { tmdbFetch } = await import("@/lib/tmdb/client");
    await tmdbFetch("/trending/movie/week", { locale: "id-ID" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    const parsed = new URL(url as string);
    expect(parsed.origin + parsed.pathname).toBe(
      "https://api.themoviedb.org/3/trending/movie/week",
    );
    expect(parsed.searchParams.get("language")).toBe("id-ID");
    expect(parsed.searchParams.get("include_adult")).toBe("false");
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: "Bearer test-token",
      accept: "application/json",
    });
  });

  it("throws a helpful error on non-OK response", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status_code: 7,
          status_message: "Invalid API key",
          success: false,
        }),
        { status: 401 },
      ),
    ) as unknown as typeof fetch;

    const { tmdbFetch } = await import("@/lib/tmdb/client");
    await expect(tmdbFetch("/trending/movie/week")).rejects.toThrow(
      /TMDB 401.*Invalid API key/,
    );
  });

  it("throws if TMDB_READ_TOKEN is missing", async () => {
    delete process.env.TMDB_READ_TOKEN;
    const { tmdbFetch } = await import("@/lib/tmdb/client");
    await expect(tmdbFetch("/trending/movie/week")).rejects.toThrow(
      /TMDB_READ_TOKEN/,
    );
  });
});
