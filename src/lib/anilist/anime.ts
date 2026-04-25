import "server-only";
import { anilistFetch } from "./client";
import { LIST_QUERY, SEARCH_QUERY, DETAIL_QUERY } from "./queries";
import type {
  AnilistMediaSummary,
  AnilistMediaDetail,
  AnilistPageResponse,
  AnilistMediaResponse,
  AnilistMediaSeason,
} from "./types";

const LIST_REVALIDATE = 60 * 60; // 1 hour
const DETAIL_REVALIDATE = 60 * 10; // 10 minutes
const SEARCH_REVALIDATE = 0; // no cache

async function listMedia(
  variables: Record<string, unknown>,
): Promise<AnilistMediaSummary[]> {
  const data = await anilistFetch<AnilistPageResponse<AnilistMediaSummary>>(
    LIST_QUERY,
    variables,
    { revalidate: LIST_REVALIDATE },
  );
  return data.Page.media;
}

export function getTrendingAnime(perPage = 20): Promise<AnilistMediaSummary[]> {
  return listMedia({ perPage, sort: ["TRENDING_DESC"] });
}

export function getCurrentlyAiring(perPage = 20): Promise<AnilistMediaSummary[]> {
  return listMedia({
    perPage,
    sort: ["POPULARITY_DESC"],
    status: "RELEASING",
  });
}

export function getTopRatedAnime(perPage = 20): Promise<AnilistMediaSummary[]> {
  return listMedia({ perPage, sort: ["SCORE_DESC"] });
}

export function getUpcomingAnime(perPage = 20): Promise<AnilistMediaSummary[]> {
  return listMedia({
    perPage,
    sort: ["POPULARITY_DESC"],
    status: "NOT_YET_RELEASED",
  });
}

export function getTopAnimeMovies(perPage = 20): Promise<AnilistMediaSummary[]> {
  return listMedia({
    perPage,
    sort: ["POPULARITY_DESC"],
    format: "MOVIE",
  });
}

export function getAnimeByGenre(
  genre: string,
  perPage = 20,
): Promise<AnilistMediaSummary[]> {
  return listMedia({ perPage, sort: ["POPULARITY_DESC"], genre });
}

export function getPopularSeason(
  season: AnilistMediaSeason,
  seasonYear: number,
  perPage = 20,
): Promise<AnilistMediaSummary[]> {
  return listMedia({
    perPage,
    sort: ["POPULARITY_DESC"],
    season,
    seasonYear,
  });
}

export async function getAnimeDetail(id: number): Promise<AnilistMediaDetail> {
  const data = await anilistFetch<AnilistMediaResponse>(
    DETAIL_QUERY,
    { id },
    { revalidate: DETAIL_REVALIDATE },
  );
  return data.Media;
}

export async function searchAnime(
  q: string,
  perPage = 20,
): Promise<AnilistMediaSummary[]> {
  const data = await anilistFetch<AnilistPageResponse<AnilistMediaSummary>>(
    SEARCH_QUERY,
    { q, perPage },
    { revalidate: SEARCH_REVALIDATE },
  );
  return data.Page.media;
}

export function getCurrentSeason(): {
  season: AnilistMediaSeason;
  year: number;
} {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();
  if (month <= 3) return { season: "WINTER", year };
  if (month <= 6) return { season: "SPRING", year };
  if (month <= 9) return { season: "SUMMER", year };
  return { season: "FALL", year };
}
