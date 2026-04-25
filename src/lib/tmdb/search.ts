import "server-only";
import { tmdbFetch } from "./client";
import type {
  TmdbLocale,
  TmdbMovie,
  TmdbPaginatedResponse,
  TmdbTvShow,
} from "./types";

export type TmdbMultiResult =
  | (TmdbMovie & { media_type: "movie" })
  | (TmdbTvShow & { media_type: "tv" })
  | { id: number; media_type: "person"; name: string; profile_path: string | null };

export interface SearchOptions {
  locale?: TmdbLocale;
}

export function multiSearch(
  query: string,
  options: SearchOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMultiResult>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMultiResult>>("/search/multi", {
    locale: options.locale,
    searchParams: { query },
  });
}
