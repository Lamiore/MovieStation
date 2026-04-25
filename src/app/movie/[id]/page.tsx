import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getMovieDetail,
  getMovieCredits,
  getMovieVideos,
  getMovieSimilar,
} from "@/lib/tmdb/movies";
import { DetailHero } from "@/components/detail/DetailHero";
import { CastList } from "@/components/detail/CastList";
import { TrailerModal } from "@/components/detail/TrailerModal";
import { WatchlistButton } from "@/components/detail/WatchlistButton";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaRow } from "@/components/media/MediaRow";

export const dynamic = "force-dynamic";

function formatRuntime(min: number | null): string {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let detail, credits, videos, similar;
  try {
    [detail, credits, videos, similar] = await Promise.all([
      getMovieDetail(id),
      getMovieCredits(id),
      getMovieVideos(id),
      getMovieSimilar(id),
    ]);
  } catch (err) {
    if (err instanceof Error && /TMDB 404/.test(err.message)) notFound();
    throw err;
  }

  const year = detail.release_date ? detail.release_date.slice(0, 4) : "";
  const meta = [
    year,
    formatRuntime(detail.runtime),
    detail.genres.map((g) => g.name).join(", "),
    detail.vote_average ? `★ ${detail.vote_average.toFixed(1)}` : "",
  ].filter(Boolean);

  return (
    <main className="pb-12">
      <DetailHero
        title={detail.title}
        tagline={detail.tagline || undefined}
        overview={detail.overview}
        posterPath={detail.poster_path}
        backdropPath={detail.backdrop_path}
        metaItems={meta}
        actions={
          <>
            <Link
              href={`/watch/movie/${detail.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Tonton
            </Link>
            <TrailerModal videos={videos.results} />
            <WatchlistButton id={detail.id} type="movie" />
          </>
        }
      />

      {credits.cast.length > 0 ? (
        <section className="mx-auto max-w-screen-2xl space-y-3 px-4 pt-10 md:px-8">
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">
            Pemeran
          </h2>
          <CastList cast={credits.cast} limit={12} />
        </section>
      ) : null}

      {similar.results.length > 0 ? (
        <section className="pt-10">
          <MediaRow title="Mirip dengan ini">
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
    </main>
  );
}
