import { describe, it, expect, vi, afterEach } from "vitest";

describe("anilistFetch", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetModules();
  });

  it("POSTs JSON {query, variables} to the AniList endpoint and returns data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ data: { Page: { media: [{ id: 1 }] } } }),
        { status: 200 },
      ),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { anilistFetch } = await import("@/lib/anilist/client");
    const data = await anilistFetch<{ Page: { media: { id: number }[] } }>(
      "query Q($n:Int){Page(perPage:$n){media{id}}}",
      { n: 1 },
    );

    expect(data.Page.media[0].id).toBe(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://graphql.anilist.co");
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).headers).toMatchObject({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({
      query: "query Q($n:Int){Page(perPage:$n){media{id}}}",
      variables: { n: 1 },
    });
  });

  it("throws on HTTP error", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("Server error", { status: 500 }),
    ) as unknown as typeof fetch;

    const { anilistFetch } = await import("@/lib/anilist/client");
    await expect(anilistFetch("query{x}")).rejects.toThrow(/AniList 500/);
  });

  it("throws on GraphQL errors in response body", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ errors: [{ message: "Bad query" }] }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch;

    const { anilistFetch } = await import("@/lib/anilist/client");
    await expect(anilistFetch("query{x}")).rejects.toThrow(/Bad query/);
  });

  it("passes revalidate option through to next fetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), { status: 200 }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { anilistFetch } = await import("@/lib/anilist/client");
    await anilistFetch("query{x}", {}, { revalidate: 600 });

    const init = fetchMock.mock.calls[0][1] as RequestInit & {
      next?: { revalidate?: number };
    };
    expect(init.next?.revalidate).toBe(600);
  });
});
