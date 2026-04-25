import "server-only";
import { tmdbFetch } from "./client";
import type {
  TmdbCredits,
  TmdbLocale,
  TmdbPaginatedResponse,
  TmdbSeasonDetail,
  TmdbTvDetail,
  TmdbTvShow,
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

export function getSeasonDetail(
  tvId: number,
  seasonNumber: number,
  options: TvDetailOptions = {},
): Promise<TmdbSeasonDetail> {
  return tmdbFetch<TmdbSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`, {
    locale: options.locale,
  });
}
