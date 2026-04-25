import { Suspense } from "react";
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
} from "@/lib/tmdb/movies";
import { getPopularTv } from "@/lib/tmdb/tv";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaRow } from "@/components/media/MediaRow";
import { MediaCardSkeleton } from "@/components/media/MediaCardSkeleton";
import { HeroBanner } from "@/components/media/HeroBanner";
import { ContinueWatchingRow } from "@/components/personal/ContinueWatchingRow";
import type { TmdbMovie, TmdbPaginatedResponse, TmdbTvShow } from "@/lib/tmdb/types";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-dvh space-y-10 pb-12">
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>

      <ContinueWatchingRow />

      <Suspense fallback={<MovieRowSkeleton title="Trending Minggu Ini" />}>
        <MovieRow title="Trending Minggu Ini" fetcher={getTrendingMovies} />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Sedang Tayang" />}>
        <MovieRow title="Sedang Tayang" fetcher={getNowPlayingMovies} />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Populer" />}>
        <MovieRow title="Populer" fetcher={getPopularMovies} />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Akan Datang" />}>
        <MovieRow title="Akan Datang" fetcher={getUpcomingMovies} />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Rating Tertinggi" />}>
        <MovieRow title="Rating Tertinggi" fetcher={getTopRatedMovies} />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Serial TV Populer" />}>
        <TvRow title="Serial TV Populer" fetcher={getPopularTv} />
      </Suspense>
    </main>
  );
}

async function Hero() {
  const { results } = await getTrendingMovies();
  const items = results
    .filter((m) => m.backdrop_path)
    .slice(0, 5)
    .map((m) => ({
      id: m.id,
      type: "movie" as const,
      title: m.title,
      overview: m.overview,
      backdropPath: m.backdrop_path,
    }));
  if (items.length === 0) return null;
  return <HeroBanner items={items} />;
}

function HeroSkeleton() {
  return (
    <section className="relative h-[60vh] min-h-[420px] w-full animate-pulse bg-surface md:h-[70vh]" />
  );
}

async function MovieRow({
  title,
  fetcher,
}: {
  title: string;
  fetcher: () => Promise<TmdbPaginatedResponse<TmdbMovie>>;
}) {
  const { results } = await fetcher();
  return (
    <MediaRow title={title}>
      {results.slice(0, 20).map((m) => (
        <MediaCard
          key={m.id}
          id={m.id}
          type="movie"
          title={m.title}
          posterPath={m.poster_path}
          releaseDate={m.release_date}
          voteAverage={m.vote_average}
        />
      ))}
    </MediaRow>
  );
}

async function TvRow({
  title,
  fetcher,
}: {
  title: string;
  fetcher: () => Promise<TmdbPaginatedResponse<TmdbTvShow>>;
}) {
  const { results } = await fetcher();
  return (
    <MediaRow title={title}>
      {results.slice(0, 20).map((tv) => (
        <MediaCard
          key={tv.id}
          id={tv.id}
          type="tv"
          title={tv.name}
          posterPath={tv.poster_path}
          releaseDate={tv.first_air_date}
          voteAverage={tv.vote_average}
        />
      ))}
    </MediaRow>
  );
}

function MovieRowSkeleton({ title }: { title: string }) {
  return (
    <MediaRow title={title}>
      {Array.from({ length: 8 }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </MediaRow>
  );
}
