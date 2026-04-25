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

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TmdbMovieDetail extends TmdbMovie {
  genres: TmdbGenre[];
  runtime: number | null;
  status: string;
  tagline: string;
  homepage: string | null;
  imdb_id: string | null;
  budget: number;
  revenue: number;
  production_companies: TmdbProductionCompany[];
}

export interface TmdbTvSeasonSummary {
  id: number;
  air_date: string | null;
  episode_count: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TmdbTvDetail extends TmdbTvShow {
  genres: TmdbGenre[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  tagline: string;
  homepage: string | null;
  in_production: boolean;
  episode_run_time: number[];
  last_air_date: string | null;
  seasons: TmdbTvSeasonSummary[];
  production_companies: TmdbProductionCompany[];
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  cast_id?: number;
  credit_id: string;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  credit_id: string;
}

export interface TmdbCredits {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbVideo {
  id: string;
  key: string; // YouTube key when site === "YouTube"
  name: string;
  site: string; // "YouTube" | "Vimeo" | ...
  type: string; // "Trailer" | "Teaser" | ...
  official: boolean;
  published_at: string;
  iso_639_1: string;
  iso_3166_1: string;
  size: number;
}

export interface TmdbVideosResponse {
  id: number;
  results: TmdbVideo[];
}

export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  still_path: string | null;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
}

export interface TmdbSeasonDetail extends TmdbTvSeasonSummary {
  episodes: TmdbEpisode[];
}
