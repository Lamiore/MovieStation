import "server-only";
import { tmdbFetch } from "./client";
import type {
  TmdbCredits,
  TmdbLocale,
  TmdbMovie,
  TmdbMovieDetail,
  TmdbPaginatedResponse,
  TmdbVideosResponse,
} from "./types";

export interface GetTrendingOptions {
  locale?: TmdbLocale;
}

export interface DetailOptions {
  locale?: TmdbLocale;
}

export function getTrendingMovies(
  options: GetTrendingOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/trending/movie/week", {
    locale: options.locale,
  });
}

export function getTrendingMoviesToday(
  options: GetTrendingOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/trending/movie/day", {
    locale: options.locale,
  });
}

export function getPopularMovies(
  options: GetTrendingOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/movie/popular", {
    locale: options.locale,
  });
}

export function getTopRatedMovies(
  options: GetTrendingOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/movie/top_rated", {
    locale: options.locale,
  });
}

export function getUpcomingMovies(
  options: GetTrendingOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/movie/upcoming", {
    locale: options.locale,
  });
}

export function getNowPlayingMovies(
  options: GetTrendingOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/movie/now_playing", {
    locale: options.locale,
  });
}

export function getMovieDetail(
  id: number,
  options: DetailOptions = {},
): Promise<TmdbMovieDetail> {
  return tmdbFetch<TmdbMovieDetail>(`/movie/${id}`, {
    locale: options.locale,
  });
}

export function getMovieCredits(
  id: number,
  options: DetailOptions = {},
): Promise<TmdbCredits> {
  return tmdbFetch<TmdbCredits>(`/movie/${id}/credits`, {
    locale: options.locale,
  });
}

export function getMovieVideos(
  id: number,
  options: DetailOptions = {},
): Promise<TmdbVideosResponse> {
  return tmdbFetch<TmdbVideosResponse>(`/movie/${id}/videos`, {
    locale: options.locale,
  });
}

export function getMovieSimilar(
  id: number,
  options: DetailOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>(`/movie/${id}/similar`, {
    locale: options.locale,
  });
}

export interface DiscoverMoviesOptions {
  locale?: TmdbLocale;
  genres?: number[];
  year?: number;
  minRating?: number;
  sortBy?: string;
  page?: number;
}

export function discoverMovies(
  options: DiscoverMoviesOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/discover/movie", {
    locale: options.locale,
    searchParams: {
      with_genres: options.genres?.length ? options.genres.join(",") : undefined,
      primary_release_year: options.year,
      "vote_average.gte": options.minRating,
      sort_by: options.sortBy,
      page: options.page,
    },
  });
}
