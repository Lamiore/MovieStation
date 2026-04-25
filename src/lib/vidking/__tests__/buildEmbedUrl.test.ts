import { describe, it, expect } from "vitest";
import { buildEmbedUrl } from "@/lib/vidking/buildEmbedUrl";

describe("buildEmbedUrl", () => {
  it("returns the movie embed URL for type=movie", () => {
    expect(buildEmbedUrl({ type: "movie", id: 27205 })).toBe(
      "https://www.vidking.net/embed/movie/27205?color=e50914",
    );
  });

  it("returns the TV embed URL with season+episode for type=tv", () => {
    expect(
      buildEmbedUrl({ type: "tv", id: 1399, season: 1, episode: 1 }),
    ).toBe("https://www.vidking.net/embed/tv/1399/1/1?color=e50914");
  });

  it("throws when type=tv but season or episode is missing", () => {
    // @ts-expect-error — runtime guard
    expect(() => buildEmbedUrl({ type: "tv", id: 1399 })).toThrow(
      /season.*episode/i,
    );
  });
});
