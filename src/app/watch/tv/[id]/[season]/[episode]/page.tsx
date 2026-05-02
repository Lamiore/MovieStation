import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getTvDetail,
  getTvCredits,
  getTvSimilar,
  getSeasonDetail,
} from "@/lib/tmdb/tv";
import { WatchPlayer } from "@/components/player/WatchPlayer";
import { WatchTracker } from "@/components/player/WatchTracker";
import { CastList } from "@/components/detail/CastList";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaRow } from "@/components/media/MediaRow";
import { EpisodeList } from "@/components/tv/EpisodeList";
import { formatRuntime } from "@/lib/format/runtime";

export const dynamic = "force-dynamic";

const STILL_BASE = "https://image.tmdb.org/t/p/w300";

export default async function WatchTvEpisodePage({
  params,
}: {
  params: Promise<{ id: string; season: string; episode: string }>;
}) {
  const { id: idParam, season: sParam, episode: eParam } = await params;
  const id = Number(idParam);
  const seasonNumber = Number(sParam);
  const episodeNumber = Number(eParam);
  if (
    !Number.isInteger(id) || id <= 0 ||
    !Number.isInteger(seasonNumber) || seasonNumber < 0 ||
    !Number.isInteger(episodeNumber) || episodeNumber <= 0
  ) {
    notFound();
  }

  let detail, season, credits, similar;
  try {
    [detail, season, credits, similar] = await Promise.all([
      getTvDetail(id),
      getSeasonDetail(id, seasonNumber),
      getTvCredits(id),
      getTvSimilar(id),
    ]);
  } catch (err) {
    if (err instanceof Error && /TMDB 404/.test(err.message)) notFound();
    throw err;
  }

  const episode = season.episodes.find(
    (ep) => ep.episode_number === episodeNumber,
  );
  if (!episode) notFound();

  const idx = season.episodes.findIndex(
    (ep) => ep.episode_number === episodeNumber,
  );
  const prev = idx > 0 ? season.episodes[idx - 1] : null;
  const next =
    idx >= 0 && idx < season.episodes.length - 1
      ? season.episodes[idx + 1]
      : null;

  const showYear = detail.first_air_date
    ? detail.first_air_date.slice(0, 4)
    : "";
  const showRuntime = detail.episode_run_time?.[0]
    ? formatRuntime(detail.episode_run_time[0])
    : "";
  const showRating =
    detail.vote_average > 0
      ? `★ ${detail.vote_average.toFixed(1)} (${detail.vote_count})`
      : null;
  const epRating =
    episode.vote_average > 0
      ? `★ ${episode.vote_average.toFixed(1)} (${episode.vote_count})`
      : null;
  const epRuntime = formatRuntime(episode.runtime);

  return (
    <main className="pb-12">
      <div className="mx-auto max-w-screen-xl space-y-4 px-4 py-6 md:px-8">
        <Link
          href={`/tv/${id}?s=${seasonNumber}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-text"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to detail
        </Link>

        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {detail.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            S{seasonNumber} • E{episodeNumber} — {episode.name}
          </p>
        </div>

        <WatchPlayer
          type="tv"
          id={id}
          season={seasonNumber}
          episode={episodeNumber}
          title={`${detail.name} S${seasonNumber}E${episodeNumber}`}
        />

        <WatchTracker
          payload={{
            id: detail.id,
            type: "tv",
            title: detail.name,
            posterPath: detail.poster_path,
            season: seasonNumber,
            episode: episodeNumber,
          }}
        />

        {episode.still_path ? (
          <div className="grid gap-4 md:grid-cols-[300px_1fr]">
            <div className="relative aspect-video overflow-hidden rounded-md bg-surface ring-1 ring-border">
              <Image
                src={STILL_BASE + episode.still_path}
                alt={episode.name}
                fill
                sizes="(min-width: 768px) 300px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                {epRating ? (
                  <span className="text-primary">{epRating}</span>
                ) : null}
                {epRuntime ? <span>{epRuntime}</span> : null}
                {episode.air_date ? <span>{episode.air_date}</span> : null}
              </div>
              {episode.overview ? (
                <p className="text-sm text-text/80">{episode.overview}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              {epRating ? (
                <span className="text-primary">{epRating}</span>
              ) : null}
              {epRuntime ? <span>{epRuntime}</span> : null}
              {episode.air_date ? <span>{episode.air_date}</span> : null}
            </div>
            {episode.overview ? (
              <p className="text-sm text-text/80">{episode.overview}</p>
            ) : null}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {prev ? (
            <Link
              href={`/watch/tv/${id}/${seasonNumber}/${prev.episode_number}`}
              className="inline-flex items-center gap-2 rounded-md bg-elevated px-4 py-2 text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-elevated/80"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Episode
            </Link>
          ) : null}
          {next ? (
            <Link
              href={`/watch/tv/${id}/${seasonNumber}/${next.episode_number}`}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Next Episode
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>

      <section className="mx-auto max-w-screen-xl space-y-3 px-4 pt-10 md:px-8">
        <h2 className="text-lg font-semibold tracking-tight md:text-xl">
          About the show
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          {showRating ? (
            <span className="text-primary">{showRating}</span>
          ) : null}
          {showYear ? <span>{showYear}</span> : null}
          {detail.number_of_seasons > 0 ? (
            <span>
              {detail.number_of_seasons} season
              {detail.number_of_seasons === 1 ? "" : "s"}
            </span>
          ) : null}
          {showRuntime ? <span>~{showRuntime}/ep</span> : null}
          {detail.genres.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {detail.genres.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full bg-elevated px-2.5 py-0.5 text-xs ring-1 ring-border"
                >
                  {g.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {detail.tagline ? (
          <p className="text-sm italic text-muted-foreground">
            {detail.tagline}
          </p>
        ) : null}
        {detail.overview ? (
          <p className="text-sm text-text/80">{detail.overview}</p>
        ) : null}
      </section>

      {credits.cast.length > 0 ? (
        <section className="mx-auto max-w-screen-xl space-y-3 px-4 pt-10 md:px-8">
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">
            Cast
          </h2>
          <CastList cast={credits.cast} limit={12} />
        </section>
      ) : null}

      <section className="mx-auto max-w-screen-xl space-y-3 px-4 pt-10 md:px-8">
        <h2 className="text-base font-semibold tracking-tight md:text-lg">
          All S{seasonNumber} episodes
        </h2>
        <EpisodeList
          tvId={id}
          season={seasonNumber}
          episodes={season.episodes}
        />
      </section>

      {similar.results.length > 0 ? (
        <section className="pt-10">
          <MediaRow title="More Like This">
            {similar.results.slice(0, 20).map((s) => (
              <MediaCard
                key={s.id}
                id={s.id}
                type="tv"
                title={s.name}
                posterPath={s.poster_path}
                releaseDate={s.first_air_date}
                voteAverage={s.vote_average}
              />
            ))}
          </MediaRow>
        </section>
      ) : null}

      <p className="mx-auto max-w-screen-xl px-4 pt-6 text-xs text-muted-foreground md:px-8">
        Streaming source from third-party providers. If the player fails to
        load, try switching server above or disabling your adblocker.
      </p>
    </main>
  );
}
