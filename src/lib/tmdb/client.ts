import "server-only";
import type { TmdbLocale } from "./types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_REVALIDATE_SECONDS = 60 * 60; // 1 hour

export interface TmdbFetchOptions {
  locale?: TmdbLocale;
  searchParams?: Record<string, string | number | boolean | undefined>;
  revalidate?: number;
}

export async function tmdbFetch<T>(
  path: string,
  options: TmdbFetchOptions = {},
): Promise<T> {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) {
    throw new Error(
      "TMDB_READ_TOKEN is not set. Add it to .env.local (see .env.example).",
    );
  }

  const url = new URL(TMDB_BASE_URL + path);
  url.searchParams.set("language", options.locale ?? "id-ID");
  url.searchParams.set("include_adult", "false");
  for (const [key, value] of Object.entries(options.searchParams ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    next: { revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as { status_message?: string };
      if (body.status_message) message = body.status_message;
    } catch {
      // body not JSON — keep statusText
    }
    throw new Error(`TMDB ${response.status}: ${message}`);
  }

  return (await response.json()) as T;
}
