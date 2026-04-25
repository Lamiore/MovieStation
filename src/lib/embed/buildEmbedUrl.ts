const VIDEASY_BASE = "https://player.videasy.net";
const VIDEASY_QUERY = "?color=e50914&nextEpisode=true&episodeSelector=true";

export type EmbedProvider = "videasy" | "2embed";

export type BuildEmbedUrlInput =
  | { type: "movie"; id: number }
  | { type: "tv"; id: number; season: number; episode: number }
  | {
      type: "anime";
      anilistId: number;
      episode: number;
      dub?: boolean;
      provider?: EmbedProvider;
    };

export function buildEmbedUrl(input: BuildEmbedUrlInput): string {
  if (input.type === "movie") {
    return `${VIDEASY_BASE}/movie/${input.id}${VIDEASY_QUERY}`;
  }
  if (input.type === "tv") {
    if (
      typeof input.season !== "number" ||
      typeof input.episode !== "number"
    ) {
      throw new Error("buildEmbedUrl: tv requires both season and episode");
    }
    return `${VIDEASY_BASE}/tv/${input.id}/${input.season}/${input.episode}${VIDEASY_QUERY}`;
  }
  return buildAnimeUrl(input);
}

function buildAnimeUrl(input: {
  anilistId: number;
  episode: number;
  dub?: boolean;
  provider?: EmbedProvider;
}): string {
  const provider = input.provider ?? "videasy";
  const { anilistId, episode, dub } = input;

  if (provider === "2embed") {
    const dubParam = dub ? "?dub=true" : "";
    return `https://2embed.cc/embedanime/${anilistId}/${episode}${dubParam}`;
  }
  // videasy (default)
  const dubParam = dub ? "&dub=true" : "";
  return `${VIDEASY_BASE}/anime/${anilistId}/${episode}${VIDEASY_QUERY}${dubParam}`;
}
