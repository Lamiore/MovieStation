export type TmdbLocale = "id-ID" | "en-US";

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string; // "YYYY-MM-DD"
  vote_average: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  video: boolean;
  vote_count: number;
}

export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbErrorResponse {
  status_code: number;
  status_message: string;
  success: false;
}

export interface TmdbTvShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string; // "YYYY-MM-DD"
  vote_average: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  origin_country: string[];
  vote_count: number;
}

export type TmdbMediaType = "movie" | "tv";
