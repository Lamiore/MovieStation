import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getTvDetail,
  getTvCredits,
  getSeasonDetail,
} from "@/lib/tmdb/tv";
import { DetailHero } from "@/components/detail/DetailHero";
import { CastList } from "@/components/detail/CastList";
import { WatchlistButton } from "@/components/detail/WatchlistButton";
import { SeasonSelector } from "@/components/tv/SeasonSelector";
import { EpisodeList } from "@/components/tv/EpisodeList";

export const dynamic = "force-dynamic";

export default async function TvDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ s?: string }>;
}) {
  const { id: idParam } = await params;
  const { s: sParam } = await searchParams;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let detail, credits;
  try {
    [detail, credits] = await Promise.all([getTvDetail(id), getTvCredits(id)]);
  } catch (err) {
    if (err instanceof Error && /TMDB 404/.test(err.message)) notFound();
    throw err;
  }

  const regularSeasons = detail.seasons.filter((s) => s.season_number > 0);
  const requestedSeason = Number(sParam);
  const validRequested = regularSeasons.some(
    (s) => s.season_number === requestedSeason,
  );
  const currentSeason = validRequested
    ? requestedSeason
    : regularSeasons[0]?.season_number ?? 1;

  let season = null;
  if (regularSeasons.length > 0) {
    try {
      season = await getSeasonDetail(id, currentSeason);
    } catch {
      season = null;
    }
  }

  const year = detail.first_air_date
    ? detail.first_air_date.slice(0, 4)
    : "";
  const endYear =
    detail.last_air_date && !detail.in_production
      ? detail.last_air_date.slice(0, 4)
      : null;
  const yearRange = endYear && endYear !== year ? `${year}–${endYear}` : year;

  const meta = [
    yearRange,
    `${detail.number_of_seasons} season${detail.number_of_seasons === 1 ? "" : "s"} • ${detail.number_of_episodes} episode${detail.number_of_episodes === 1 ? "" : "s"}`,
    detail.genres.map((g) => g.name).join(", "),
    detail.vote_average ? `★ ${detail.vote_average.toFixed(1)}` : "",
  ].filter(Boolean);

  return (
    <main className="pb-12">
      <DetailHero
        title={detail.name}
        tagline={detail.tagline || undefined}
        overview={detail.overview}
        posterPath={detail.poster_path}
        backdropPath={detail.backdrop_path}
        metaItems={meta}
        actions={
          <>
            {season && season.episodes[0] ? (
              <Link
                href={`/watch/tv/${detail.id}/${currentSeason}/${season.episodes[0].episode_number}`}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Watch
              </Link>
            ) : null}
            <WatchlistButton
              id={detail.id}
              type="tv"
              title={detail.name}
              posterPath={detail.poster_path}
            />
          </>
        }
      />

      {credits.cast.length > 0 ? (
        <section className="mx-auto max-w-screen-2xl space-y-3 px-4 pt-10 md:px-8">
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">
            Cast
          </h2>
          <CastList cast={credits.cast} limit={12} />
        </section>
      ) : null}

      {regularSeasons.length > 0 ? (
        <section className="mx-auto max-w-screen-2xl space-y-4 px-4 pt-10 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight md:text-xl">
              Episodes
            </h2>
            <SeasonSelector
              tvId={detail.id}
              seasons={regularSeasons}
              currentSeason={currentSeason}
            />
          </div>
          {season ? (
            <EpisodeList
              tvId={detail.id}
              season={currentSeason}
              episodes={season.episodes}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Couldn&apos;t load episodes for this season.
            </p>
          )}
        </section>
      ) : null}
    </main>
  );
}
