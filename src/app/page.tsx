import { Suspense } from "react";
import {
  getTrendingMovies,
  getTrendingMoviesToday,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
  getMovieVideos,
} from "@/lib/tmdb/movies";
import { getPopularTv } from "@/lib/tmdb/tv";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaRow } from "@/components/media/MediaRow";
import { MediaCardSkeleton } from "@/components/media/MediaCardSkeleton";
import { HeroBanner } from "@/components/media/HeroBanner";
import { TopTenRow } from "@/components/media/TopTenRow";
import { ContinueWatchingRow } from "@/components/personal/ContinueWatchingRow";
import type { TmdbMovie, TmdbPaginatedResponse, TmdbTvShow } from "@/lib/tmdb/types";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-dvh space-y-8 pb-16 md:space-y-12">
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>

      <ContinueWatchingRow />

      <Suspense fallback={<MovieRowSkeleton title="Top 10 Today" />}>
        <TopTenToday title="Top 10 Today" />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Now Playing" />}>
        <MovieRow title="Now Playing" fetcher={getNowPlayingMovies} />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Popular" />}>
        <MovieRow title="Popular" fetcher={getPopularMovies} />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Upcoming" />}>
        <MovieRow title="Upcoming" fetcher={getUpcomingMovies} />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Top Rated" />}>
        <MovieRow title="Top Rated" fetcher={getTopRatedMovies} />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Popular TV Shows" />}>
        <TvRow title="Popular TV Shows" fetcher={getPopularTv} />
      </Suspense>
    </main>
  );
}

async function Hero() {
  const { results } = await getTrendingMovies();
  const top5 = results.filter((m) => m.backdrop_path).slice(0, 5);

  const videoResponses = await Promise.all(
    top5.map((m) => getMovieVideos(m.id).catch(() => null)),
  );

  const items = top5.map((m, i) => {
    const youtube = (videoResponses[i]?.results ?? []).filter(
      (v) => v.site === "YouTube",
    );
    const trailer =
      youtube.find((v) => v.type === "Trailer") ??
      youtube.find((v) => v.type === "Teaser");
    return {
      id: m.id,
      type: "movie" as const,
      title: m.title,
      overview: m.overview,
      backdropPath: m.backdrop_path,
      trailerKey: trailer?.key,
    };
  });

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

async function TopTenToday({ title }: { title: string }) {
  const { results } = await getTrendingMoviesToday();
  const items = results.slice(0, 10).map((m) => ({
    id: m.id,
    type: "movie" as const,
    title: m.title,
    posterPath: m.poster_path,
  }));
  return <TopTenRow title={title} items={items} />;
}
