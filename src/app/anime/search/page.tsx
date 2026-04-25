import { searchAnime } from "@/lib/anilist/anime";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { AnimeSearchBar } from "@/components/anime/AnimeSearchBar";

export const dynamic = "force-dynamic";

export default async function AnimeSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query.length >= 2 ? await searchAnime(query, 30) : [];

  return (
    <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 md:px-8 md:py-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Search Anime
        </h1>
        <AnimeSearchBar defaultValue={query} />
        {query ? (
          <p className="text-sm text-muted-foreground">
            Results for &ldquo;{query}&rdquo;
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Type a title above (min 2 characters).
          </p>
        )}
      </header>

      {query.length >= 2 && results.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No results for &ldquo;{query}&rdquo;.
          </p>
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((m) => (
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
        </div>
      ) : null}
    </main>
  );
}
