import { Suspense } from "react";
import {
  getTrendingAnime,
  getCurrentlyAiring,
  getTopRatedAnime,
  getUpcomingAnime,
  getTopAnimeMovies,
  getAnimeByGenre,
  getPopularSeason,
  getCurrentSeason,
} from "@/lib/anilist/anime";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { AnimeSearchBar } from "@/components/anime/AnimeSearchBar";
import { MediaRow } from "@/components/media/MediaRow";
import { MediaCardSkeleton } from "@/components/media/MediaCardSkeleton";
import type { AnilistMediaSummary } from "@/lib/anilist/types";

export const dynamic = "force-dynamic";

const GENRES = ["Action", "Adventure", "Romance", "Comedy", "Drama", "Sci-Fi"];

export default function AnimePage() {
  const { season, year } = getCurrentSeason();

  return (
    <main className="min-h-dvh space-y-10 pb-12">
      <header className="mx-auto max-w-screen-2xl space-y-4 px-4 pt-6 md:px-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Anime
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse, search, and watch — powered by AniList.
          </p>
        </div>
        <AnimeSearchBar />
      </header>

      <Suspense fallback={<RowSkeleton title="Trending Now" />}>
        <Row title="Trending Now" fetcher={() => getTrendingAnime(20)} />
      </Suspense>
      <Suspense fallback={<RowSkeleton title="Popular This Season" />}>
        <Row
          title="Popular This Season"
          fetcher={() => getPopularSeason(season, year, 20)}
        />
      </Suspense>
      <Suspense fallback={<RowSkeleton title="Currently Airing" />}>
        <Row title="Currently Airing" fetcher={() => getCurrentlyAiring(20)} />
      </Suspense>
      <Suspense fallback={<RowSkeleton title="Top Rated" />}>
        <Row title="Top Rated" fetcher={() => getTopRatedAnime(20)} />
      </Suspense>
      <Suspense fallback={<RowSkeleton title="Upcoming" />}>
        <Row title="Upcoming" fetcher={() => getUpcomingAnime(20)} />
      </Suspense>
      <Suspense fallback={<RowSkeleton title="Top Anime Movies" />}>
        <Row title="Top Anime Movies" fetcher={() => getTopAnimeMovies(20)} />
      </Suspense>

      {GENRES.map((g) => (
        <Suspense key={g} fallback={<RowSkeleton title={g} />}>
          <Row title={g} fetcher={() => getAnimeByGenre(g, 20)} />
        </Suspense>
      ))}
    </main>
  );
}

async function Row({
  title,
  fetcher,
}: {
  title: string;
  fetcher: () => Promise<AnilistMediaSummary[]>;
}) {
  let items: AnilistMediaSummary[] = [];
  try {
    items = await fetcher();
  } catch {
    return null;
  }
  if (items.length === 0) return null;
  return (
    <MediaRow title={title}>
      {items.map((m) => (
        <AnimeCard
          key={m.id}
          id={m.id}
          title={m.title.userPreferred ?? m.title.romaji ?? "—"}
          coverUrl={m.coverImage.large}
          format={m.format}
          episodes={m.episodes}
          averageScore={m.averageScore}
        />
      ))}
    </MediaRow>
  );
}

function RowSkeleton({ title }: { title: string }) {
  return (
    <MediaRow title={title}>
      {Array.from({ length: 8 }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </MediaRow>
  );
}
