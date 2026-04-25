import { Suspense } from "react";
import { getTrendingMovies } from "@/lib/tmdb/movies";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaRow } from "@/components/media/MediaRow";
import { MediaCardSkeleton } from "@/components/media/MediaCardSkeleton";

// Skip static prerender so `npm run build` doesn't require a valid
// TMDB token at build time. ISR / static caching can be reintroduced
// in a later plan once the token flow is stable.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-dvh space-y-8 py-6 md:py-10">
      <header className="px-4 md:px-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          nontonfilm
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Katalog film &amp; serial TV — tonton langsung di browser.
        </p>
      </header>

      <Suspense fallback={<TrendingRowSkeleton />}>
        <TrendingRow />
      </Suspense>
    </main>
  );
}

async function TrendingRow() {
  const { results } = await getTrendingMovies();
  return (
    <MediaRow title="Trending Minggu Ini">
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

function TrendingRowSkeleton() {
  return (
    <MediaRow title="Trending Minggu Ini">
      {Array.from({ length: 8 }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </MediaRow>
  );
}
