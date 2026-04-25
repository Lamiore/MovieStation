import Link from "next/link";
import { multiSearch, type TmdbMultiResult } from "@/lib/tmdb/search";
import { MediaCard } from "@/components/media/MediaCard";

export const dynamic = "force-dynamic";

type WatchableResult = Exclude<TmdbMultiResult, { media_type: "person" }>;

function isWatchable(r: TmdbMultiResult): r is WatchableResult {
  return r.media_type === "movie" || r.media_type === "tv";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let items: WatchableResult[] = [];
  if (query.length >= 2) {
    try {
      const data = await multiSearch(query);
      items = data.results.filter(isWatchable);
    } catch {
      items = [];
    }
  }

  return (
    <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 md:px-8 md:py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Search
        </h1>
        {query ? (
          <p className="text-sm text-muted-foreground">
            {items.length} result{items.length === 1 ? "" : "s"} for{" "}
            <span className="font-medium text-text">&ldquo;{query}&rdquo;</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Type a movie or show title in the search box in the header.
          </p>
        )}
      </header>

      {query.length >= 2 && items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No results for &ldquo;{query}&rdquo;.
          </p>
          <Link
            href="/browse"
            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Try Browse
          </Link>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((r) => {
            const isMovie = r.media_type === "movie";
            const title = isMovie ? r.title : r.name;
            const releaseDate = isMovie
              ? r.release_date
              : r.first_air_date ?? "";
            return (
              <div key={`${r.media_type}:${r.id}`} className="w-full">
                <MediaCard
                  id={r.id}
                  type={r.media_type}
                  title={title}
                  posterPath={r.poster_path}
                  releaseDate={releaseDate}
                  voteAverage={r.vote_average}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
