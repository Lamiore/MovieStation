export type AnilistMediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC";

export type AnilistMediaStatus =
  | "FINISHED"
  | "RELEASING"
  | "NOT_YET_RELEASED"
  | "CANCELLED"
  | "HIATUS";

export type AnilistMediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export interface AnilistTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
  userPreferred: string | null;
}

export interface AnilistCoverImage {
  large: string | null;
  extraLarge: string | null;
  color: string | null;
}

export interface AnilistMediaSummary {
  id: number;
  title: AnilistTitle;
  coverImage: AnilistCoverImage;
  bannerImage: string | null;
  format: AnilistMediaFormat | null;
  episodes: number | null;
  averageScore: number | null;
  status: AnilistMediaStatus | null;
  season: AnilistMediaSeason | null;
  seasonYear: number | null;
  genres: string[];
}

export interface AnilistStudio {
  id: number;
  name: string;
}

export interface AnilistTrailer {
  id: string | null;
  site: string | null;
  thumbnail: string | null;
}

export interface AnilistRelationEdge {
  relationType: string;
  node: AnilistMediaSummary;
}

export interface AnilistRecommendationNode {
  mediaRecommendation: AnilistMediaSummary | null;
}

export interface AnilistCharacterEdge {
  role: "MAIN" | "SUPPORTING" | "BACKGROUND";
  node: {
    id: number;
    name: { full: string | null };
    image: { medium: string | null };
  };
  voiceActors: {
    id: number;
    name: { full: string | null };
    image: { medium: string | null };
  }[];
}

export interface AnilistMediaDetail extends AnilistMediaSummary {
  description: string | null; // HTML
  duration: number | null;
  studios: { nodes: AnilistStudio[] };
  trailer: AnilistTrailer | null;
  relations: { edges: AnilistRelationEdge[] };
  recommendations: { nodes: AnilistRecommendationNode[] };
  characters: { edges: AnilistCharacterEdge[] };
}

export interface AnilistPageResponse<T> {
  Page: { media: T[] };
}

export interface AnilistMediaResponse {
  Media: AnilistMediaDetail;
}
