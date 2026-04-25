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

  it("returns the anime embed URL with default sub for type=anime", () => {
    expect(
      buildEmbedUrl({ type: "anime", anilistId: 21, episode: 1 }),
    ).toBe(
      "https://player.videasy.net/anime/21/1?color=e50914&nextEpisode=true&episodeSelector=true",
    );
  });

  it("appends dub=true for type=anime when dub flag is on", () => {
    expect(
      buildEmbedUrl({ type: "anime", anilistId: 21, episode: 1, dub: true }),
    ).toBe(
      "https://player.videasy.net/anime/21/1?color=e50914&nextEpisode=true&episodeSelector=true&dub=true",
    );
  });

  it("returns the 2embed anime URL when provider=2embed", () => {
    expect(
      buildEmbedUrl({
        type: "anime",
        anilistId: 21,
        episode: 1,
        provider: "2embed",
      }),
    ).toBe("https://2embed.cc/embedanime/21/1");
  });

  it("appends ?dub=true for 2embed anime when dub is on", () => {
    expect(
      buildEmbedUrl({
        type: "anime",
        anilistId: 21,
        episode: 1,
        provider: "2embed",
        dub: true,
      }),
    ).toBe("https://2embed.cc/embedanime/21/1?dub=true");
  });
});
