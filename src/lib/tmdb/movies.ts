import "server-only";
import { tmdbFetch } from "./client";
import type { TmdbLocale, TmdbMovie, TmdbPaginatedResponse } from "./types";

export interface GetTrendingOptions {
  locale?: TmdbLocale;
}

export function getTrendingMovies(
  options: GetTrendingOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/trending/movie/week", {
    locale: options.locale,
  });
}
