const BASE_URL = "https://player.videasy.net";
const PLAYER_QUERY = "?color=e50914&nextEpisode=true&episodeSelector=true";

export type BuildEmbedUrlInput =
  | { type: "movie"; id: number }
  | { type: "tv"; id: number; season: number; episode: number }
  | { type: "anime"; anilistId: number; episode: number; dub?: boolean };

export function buildEmbedUrl(input: BuildEmbedUrlInput): string {
  if (input.type === "movie") {
    return `${BASE_URL}/movie/${input.id}${PLAYER_QUERY}`;
  }
  if (input.type === "tv") {
    if (
      typeof input.season !== "number" ||
      typeof input.episode !== "number"
    ) {
      throw new Error("buildEmbedUrl: tv requires both season and episode");
    }
    return `${BASE_URL}/tv/${input.id}/${input.season}/${input.episode}${PLAYER_QUERY}`;
  }
  // anime
  const dubParam = input.dub ? "&dub=true" : "";
  return `${BASE_URL}/anime/${input.anilistId}/${input.episode}${PLAYER_QUERY}${dubParam}`;
}
