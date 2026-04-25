import "server-only";
import { tmdbFetch } from "./client";
import type { TmdbGenre, TmdbLocale } from "./types";

export interface GenresResponse {
  genres: TmdbGenre[];
}

export interface GenresOptions {
  locale?: TmdbLocale;
}

export function getMovieGenres(
  options: GenresOptions = {},
): Promise<GenresResponse> {
  return tmdbFetch<GenresResponse>("/genre/movie/list", {
    locale: options.locale,
    revalidate: 60 * 60 * 24,
  });
}

export function getTvGenres(
  options: GenresOptions = {},
): Promise<GenresResponse> {
  return tmdbFetch<GenresResponse>("/genre/tv/list", {
    locale: options.locale,
    revalidate: 60 * 60 * 24,
  });
}
