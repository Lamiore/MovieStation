import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  getMovieDetail,
  getMovieCredits,
  getMovieSimilar,
} from "@/lib/tmdb/movies";
import { EmbedPlayer } from "@/components/player/EmbedPlayer";
import { WatchTracker } from "@/components/player/WatchTracker";
import { CastList } from "@/components/detail/CastList";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaRow } from "@/components/media/MediaRow";
import { buildEmbedUrl } from "@/lib/embed/buildEmbedUrl";
import { formatRuntime } from "@/lib/format/runtime";

export const dynamic = "force-dynamic";

export default async function WatchMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let detail, credits, similar;
  try {
    [detail, credits, similar] = await Promise.all([
      getMovieDetail(id),
      getMovieCredits(id),
      getMovieSimilar(id),
    ]);
  } catch (err) {
    if (err instanceof Error && /TMDB 404/.test(err.message)) notFound();
    throw err;
  }

  const src = buildEmbedUrl({ type: "movie", id });
  const year = detail.release_date ? detail.release_date.slice(0, 4) : "";
  const runtime = formatRuntime(detail.runtime);
  const rating =
    detail.vote_average > 0
      ? `★ ${detail.vote_average.toFixed(1)} (${detail.vote_count})`
      : null;

  return (
    <main className="pb-12">
      <div className="mx-auto max-w-screen-xl space-y-4 px-4 py-6 md:px-8">
        <Link
          href={`/movie/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-text"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to detail
        </Link>

        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {detail.title}
          {year ? (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({year})
            </span>
          ) : null}
        </h1>

        <EmbedPlayer src={src} title={`${detail.title} (${year})`} />

        <WatchTracker
          payload={{
            id: detail.id,
            type: "movie",
            title: detail.title,
            posterPath: detail.poster_path,
          }}
        />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          {rating ? <span className="text-primary">{rating}</span> : null}
          {year ? <span>{year}</span> : null}
          {runtime ? <span>{runtime}</span> : null}
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
      </div>

      {credits.cast.length > 0 ? (
        <section className="mx-auto max-w-screen-xl space-y-3 px-4 pt-6 md:px-8">
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">
            Cast
          </h2>
          <CastList cast={credits.cast} limit={12} />
        </section>
      ) : null}

      {similar.results.length > 0 ? (
        <section className="pt-10">
          <MediaRow title="More Like This">
            {similar.results.slice(0, 20).map((m) => (
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
        </section>
      ) : null}

      <p className="mx-auto max-w-screen-xl px-4 pt-6 text-xs text-muted-foreground md:px-8">
        Streaming source from a third party (videasy.net). If the player
        fails to load, try refreshing or disabling your adblocker.
      </p>
    </main>
  );
}
