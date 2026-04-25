import "server-only";
import { tmdbFetch } from "./client";
import type {
  TmdbCredits,
  TmdbLocale,
  TmdbPaginatedResponse,
  TmdbSeasonDetail,
  TmdbTvDetail,
  TmdbTvShow,
  TmdbVideosResponse,
} from "./types";

export interface GetTvListOptions {
  locale?: TmdbLocale;
}

export interface TvDetailOptions {
  locale?: TmdbLocale;
}

export function getPopularTv(
  options: GetTvListOptions = {},
): Promise<TmdbPaginatedResponse<TmdbTvShow>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbTvShow>>("/tv/popular", {
    locale: options.locale,
  });
}

export function getTopRatedTv(
  options: GetTvListOptions = {},
): Promise<TmdbPaginatedResponse<TmdbTvShow>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbTvShow>>("/tv/top_rated", {
    locale: options.locale,
  });
}

export function getTvDetail(
  id: number,
  options: TvDetailOptions = {},
): Promise<TmdbTvDetail> {
  return tmdbFetch<TmdbTvDetail>(`/tv/${id}`, { locale: options.locale });
}

export function getTvCredits(
  id: number,
  options: TvDetailOptions = {},
): Promise<TmdbCredits> {
  return tmdbFetch<TmdbCredits>(`/tv/${id}/credits`, { locale: options.locale });
}

export function getTvVideos(
  id: number,
  options: TvDetailOptions = {},
): Promise<TmdbVideosResponse> {
  return tmdbFetch<TmdbVideosResponse>(`/tv/${id}/videos`, {
    locale: options.locale,
  });
}

export function getSeasonDetail(
  tvId: number,
  seasonNumber: number,
  options: TvDetailOptions = {},
): Promise<TmdbSeasonDetail> {
  return tmdbFetch<TmdbSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`, {
    locale: options.locale,
  });
}

export interface DiscoverTvOptions {
  locale?: TmdbLocale;
  genres?: number[];
  year?: number;
  minRating?: number;
  sortBy?: string;
  page?: number;
}

export function discoverTv(
  options: DiscoverTvOptions = {},
): Promise<TmdbPaginatedResponse<TmdbTvShow>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbTvShow>>("/discover/tv", {
    locale: options.locale,
    searchParams: {
      with_genres: options.genres?.length ? options.genres.join(",") : undefined,
      first_air_date_year: options.year,
      "vote_average.gte": options.minRating,
      sort_by: options.sortBy,
      page: options.page,
    },
  });
}
