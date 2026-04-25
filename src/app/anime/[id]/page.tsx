import { notFound } from "next/navigation";
import Link from "next/link";
import { getAnimeDetail } from "@/lib/anilist/anime";
import { AnimeHero } from "@/components/anime/AnimeHero";
import { AnimeEpisodeList } from "@/components/anime/AnimeEpisodeList";
import { AnimeRelations } from "@/components/anime/AnimeRelations";
import { AnimeCharacterList } from "@/components/anime/AnimeCharacterList";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { MediaRow } from "@/components/media/MediaRow";

export const dynamic = "force-dynamic";

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) notFound();

  let anime;
  try {
    anime = await getAnimeDetail(id);
  } catch {
    notFound();
  }

  const isMovie = anime.format === "MOVIE";
  const totalEpisodes =
    typeof anime.episodes === "number" && anime.episodes > 0
      ? anime.episodes
      : isMovie
        ? 1
        : 0;
  const playHref = `/watch/anime/${anime.id}/1`;

  const recommendations = anime.recommendations.nodes
    .map((n) => n.mediaRecommendation)
    .filter((m): m is NonNullable<typeof m> => m != null);

  return (
    <main className="min-h-dvh space-y-10 pb-12">
      <AnimeHero anime={anime} />

      <section className="mx-auto max-w-screen-xl px-4 md:px-8">
        <Link
          href={playHref}
          className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {isMovie ? "Watch Movie" : "Watch Episode 1"}
        </Link>
      </section>

      {!isMovie && totalEpisodes > 0 ? (
        <section className="mx-auto max-w-screen-xl px-4 md:px-8">
          <AnimeEpisodeList animeId={anime.id} totalEpisodes={totalEpisodes} />
        </section>
      ) : null}

      <section className="mx-auto max-w-screen-xl px-4 md:px-8">
        <AnimeCharacterList edges={anime.characters.edges} />
      </section>

      <AnimeRelations edges={anime.relations.edges} />

      {recommendations.length > 0 ? (
        <MediaRow title="Recommendations">
          {recommendations.map((m) => (
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
      ) : null}
    </main>
  );
}
