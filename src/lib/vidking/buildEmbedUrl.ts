const BASE_URL = "https://www.vidking.net/embed";

export type BuildEmbedUrlInput =
  | { type: "movie"; id: number }
  | { type: "tv"; id: number; season: number; episode: number };

export function buildEmbedUrl(input: BuildEmbedUrlInput): string {
  if (input.type === "movie") {
    return `${BASE_URL}/movie/${input.id}`;
  }
  if (
    typeof input.season !== "number" ||
    typeof input.episode !== "number"
  ) {
    throw new Error("buildEmbedUrl: tv requires both season and episode");
  }
  return `${BASE_URL}/tv/${input.id}/${input.season}/${input.episode}`;
}
