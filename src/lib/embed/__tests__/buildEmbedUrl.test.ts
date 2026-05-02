import { describe, it, expect } from "vitest";
import { buildEmbedUrl } from "@/lib/embed/buildEmbedUrl";

describe("buildEmbedUrl (default = videasy)", () => {
  it("returns the videasy movie URL when no providerId is given", () => {
    expect(buildEmbedUrl({ type: "movie", id: 27205 })).toBe(
      "https://player.videasy.net/movie/27205?color=e50914&nextEpisode=true&episodeSelector=true",
    );
  });

  it("returns the videasy TV URL when no providerId is given", () => {
    expect(
      buildEmbedUrl({ type: "tv", id: 1399, season: 1, episode: 1 }),
    ).toBe(
      "https://player.videasy.net/tv/1399/1/1?color=e50914&nextEpisode=true&episodeSelector=true",
    );
  });
});

describe("buildEmbedUrl with explicit provider", () => {
  it("delegates to the chosen provider for movies", () => {
    expect(buildEmbedUrl({ type: "movie", id: 27205 }, "vidsrc")).toBe(
      "https://vidsrc.xyz/embed/movie/27205",
    );
  });

  it("delegates to the chosen provider for tv", () => {
    expect(
      buildEmbedUrl(
        { type: "tv", id: 1399, season: 1, episode: 1 },
        "vidlink",
      ),
    ).toBe("https://vidlink.pro/tv/1399/1/1");
  });

  it("throws on unknown provider id", () => {
    expect(() =>
      buildEmbedUrl({ type: "movie", id: 27205 }, "bogus"),
    ).toThrow(/Unknown embed provider/);
  });
});

describe("buildEmbedUrl input validation", () => {
  it("throws when type=tv but season or episode is missing", () => {
    // @ts-expect-error — runtime guard
    expect(() => buildEmbedUrl({ type: "tv", id: 1399 })).toThrow(
      /season.*episode/i,
    );
  });
});
