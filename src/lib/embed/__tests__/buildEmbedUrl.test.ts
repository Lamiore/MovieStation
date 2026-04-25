import { describe, it, expect } from "vitest";
import { buildEmbedUrl } from "@/lib/embed/buildEmbedUrl";

describe("buildEmbedUrl", () => {
  it("returns the movie embed URL for type=movie", () => {
    expect(buildEmbedUrl({ type: "movie", id: 27205 })).toBe(
      "https://player.videasy.net/movie/27205?color=e50914&nextEpisode=true&episodeSelector=true",
    );
  });

  it("returns the TV embed URL with season+episode for type=tv", () => {
    expect(
      buildEmbedUrl({ type: "tv", id: 1399, season: 1, episode: 1 }),
    ).toBe(
      "https://player.videasy.net/tv/1399/1/1?color=e50914&nextEpisode=true&episodeSelector=true",
    );
  });

  it("throws when type=tv but season or episode is missing", () => {
    // @ts-expect-error — runtime guard
    expect(() => buildEmbedUrl({ type: "tv", id: 1399 })).toThrow(
      /season.*episode/i,
    );
  });

  it("returns the videasy anime URL by default with sub", () => {
    expect(
      buildEmbedUrl({ type: "anime", anilistId: 21, episode: 1 }),
    ).toBe(
      "https://player.videasy.net/anime/21/1?color=e50914&nextEpisode=true&episodeSelector=true",
    );
  });

  it("appends &dub=true for videasy when dub is on", () => {
    expect(
      buildEmbedUrl({ type: "anime", anilistId: 21, episode: 1, dub: true }),
    ).toBe(
      "https://player.videasy.net/anime/21/1?color=e50914&nextEpisode=true&episodeSelector=true&dub=true",
    );
  });

  it("returns vidsrc.icu URL with sub flag 0 when provider=vidsrc", () => {
    expect(
      buildEmbedUrl({
        type: "anime",
        anilistId: 21,
        episode: 1,
        provider: "vidsrc",
      }),
    ).toBe("https://vidsrc.icu/embed/anime/21/1/0");
  });

  it("returns vidsrc.icu URL with dub flag 1 when provider=vidsrc and dub=true", () => {
    expect(
      buildEmbedUrl({
        type: "anime",
        anilistId: 21,
        episode: 1,
        provider: "vidsrc",
        dub: true,
      }),
    ).toBe("https://vidsrc.icu/embed/anime/21/1/1");
  });

  it("returns vidlink.pro URL with sub when provider=vidlink", () => {
    expect(
      buildEmbedUrl({
        type: "anime",
        anilistId: 21,
        malId: 21,
        episode: 1,
        provider: "vidlink",
      }),
    ).toBe("https://vidlink.pro/anime/21/1/sub");
  });

  it("returns vidlink.pro URL with dub path when provider=vidlink and dub=true", () => {
    expect(
      buildEmbedUrl({
        type: "anime",
        anilistId: 21,
        malId: 21,
        episode: 1,
        provider: "vidlink",
        dub: true,
      }),
    ).toBe("https://vidlink.pro/anime/21/1/dub");
  });

  it("throws when provider=vidlink but malId is missing", () => {
    expect(() =>
      buildEmbedUrl({
        type: "anime",
        anilistId: 21,
        episode: 1,
        provider: "vidlink",
      }),
    ).toThrow(/malId/);
  });
});
