export type BuildEmbedUrlInput =
  | { type: "movie"; id: number }
  | { type: "tv"; id: number; season: number; episode: number };

export interface EmbedProvider {
  id: string;
  label: string;
  buildUrl(input: BuildEmbedUrlInput): string;
}

const VIDEASY_QUERY = "?color=e50914&nextEpisode=true&episodeSelector=true";

export const PROVIDERS: readonly EmbedProvider[] = [
  {
    id: "videasy",
    label: "Videasy",
    buildUrl: (i) =>
      i.type === "movie"
        ? `https://player.videasy.net/movie/${i.id}${VIDEASY_QUERY}`
        : `https://player.videasy.net/tv/${i.id}/${i.season}/${i.episode}${VIDEASY_QUERY}`,
  },
  {
    id: "vidsrc",
    label: "VidSrc",
    buildUrl: (i) =>
      i.type === "movie"
        ? `https://vidsrc.xyz/embed/movie/${i.id}`
        : `https://vidsrc.xyz/embed/tv/${i.id}/${i.season}-${i.episode}`,
  },
  {
    id: "vidlink",
    label: "Vidlink",
    buildUrl: (i) =>
      i.type === "movie"
        ? `https://vidlink.pro/movie/${i.id}`
        : `https://vidlink.pro/tv/${i.id}/${i.season}/${i.episode}`,
  },
  {
    id: "2embed",
    label: "2embed",
    buildUrl: (i) =>
      i.type === "movie"
        ? `https://www.2embed.cc/embed/${i.id}`
        : `https://www.2embed.cc/embedtvfull/${i.id}&s=${i.season}&e=${i.episode}`,
  },
];

export const DEFAULT_PROVIDER_ID = "videasy";

export function getProvider(id: string): EmbedProvider {
  const p = PROVIDERS.find((p) => p.id === id);
  if (!p) throw new Error(`Unknown embed provider: ${id}`);
  return p;
}
