import { discoverMovies } from "@/lib/tmdb/movies";
import { discoverTv } from "@/lib/tmdb/tv";
import { getMovieGenres, getTvGenres } from "@/lib/tmdb/genres";
import { MediaCard } from "@/components/media/MediaCard";
import { FilterBar } from "@/components/browse/FilterBar";

export const dynamic = "force-dynamic";

interface BrowseSearchParams {
  type?: string;
  genres?: string;
  year?: string;
  minRating?: string;
  sortBy?: string;
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<BrowseSearchParams>;
}) {
  const sp = await searchParams;
  const isTv = sp.type === "tv";

  const genreList = isTv ? await getTvGenres() : await getMovieGenres();

  const filters = {
    genres: sp.genres
      ?.split(",")
      .map(Number)
      .filter((n) => Number.isFinite(n)),
    year: sp.year ? Number(sp.year) : undefined,
    minRating: sp.minRating ? Number(sp.minRating) : undefined,
    sortBy: sp.sortBy || "popularity.desc",
  };

  const data = isTv
    ? await discoverTv(filters)
    : await discoverMovies(filters);

  return (
    <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 md:px-8 md:py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Browse
        </h1>
        <p className="text-sm text-muted-foreground">
          Filter by type, genre, year, rating, and sort order.
        </p>
      </header>

      <FilterBar genres={genreList.genres} />

      {data.results.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No results for these filters. Try loosening them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {data.results.map((item) => (
            <div key={`${isTv ? "tv" : "movie"}:${item.id}`} className="w-full">
              <MediaCard
                id={item.id}
                type={isTv ? "tv" : "movie"}
                title={isTv ? (item as { name: string }).name : (item as { title: string }).title}
                posterPath={item.poster_path}
                releaseDate={
                  isTv
                    ? (item as { first_air_date?: string }).first_air_date ?? ""
                    : (item as { release_date?: string }).release_date ?? ""
                }
                voteAverage={item.vote_average}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
