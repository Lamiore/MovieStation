import { describe, it, expect } from "vitest";
import {
  PROVIDERS,
  DEFAULT_PROVIDER_ID,
  getProvider,
} from "@/lib/embed/providers";

const MOVIE = { type: "movie", id: 27205 } as const;
const TV = { type: "tv", id: 1399, season: 1, episode: 1 } as const;

describe("providers registry", () => {
  it("lists exactly four providers in expected order", () => {
    expect(PROVIDERS.map((p) => p.id)).toEqual([
      "videasy",
      "vidsrc",
      "vidlink",
      "2embed",
    ]);
  });

  it("has Videasy as the default", () => {
    expect(DEFAULT_PROVIDER_ID).toBe("videasy");
  });

  it("each provider has a non-empty human label", () => {
    for (const p of PROVIDERS) {
      expect(p.label).toBeTruthy();
      expect(p.label.length).toBeGreaterThan(0);
    }
  });
});

describe("provider URL builders", () => {
  it("videasy movie", () => {
    expect(getProvider("videasy").buildUrl(MOVIE)).toBe(
      "https://player.videasy.net/movie/27205?color=e50914&nextEpisode=true&episodeSelector=true",
    );
  });

  it("videasy tv", () => {
    expect(getProvider("videasy").buildUrl(TV)).toBe(
      "https://player.videasy.net/tv/1399/1/1?color=e50914&nextEpisode=true&episodeSelector=true",
    );
  });

  it("vidsrc movie", () => {
    expect(getProvider("vidsrc").buildUrl(MOVIE)).toBe(
      "https://vidsrc.xyz/embed/movie/27205",
    );
  });

  it("vidsrc tv", () => {
    expect(getProvider("vidsrc").buildUrl(TV)).toBe(
      "https://vidsrc.xyz/embed/tv/1399/1-1",
    );
  });

  it("vidlink movie", () => {
    expect(getProvider("vidlink").buildUrl(MOVIE)).toBe(
      "https://vidlink.pro/movie/27205",
    );
  });

  it("vidlink tv", () => {
    expect(getProvider("vidlink").buildUrl(TV)).toBe(
      "https://vidlink.pro/tv/1399/1/1",
    );
  });

  it("2embed movie", () => {
    expect(getProvider("2embed").buildUrl(MOVIE)).toBe(
      "https://www.2embed.cc/embed/27205",
    );
  });

  it("2embed tv", () => {
    expect(getProvider("2embed").buildUrl(TV)).toBe(
      "https://www.2embed.cc/embedtvfull/1399&s=1&e=1",
    );
  });
});

describe("getProvider", () => {
  it("throws on unknown id", () => {
    expect(() => getProvider("bogus")).toThrow(/Unknown embed provider/);
  });
});
