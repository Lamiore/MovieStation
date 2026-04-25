import "server-only";
import { tmdbFetch } from "./client";
import type {
  TmdbLocale,
  TmdbPaginatedResponse,
  TmdbTvShow,
} from "./types";

export interface GetTvListOptions {
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
