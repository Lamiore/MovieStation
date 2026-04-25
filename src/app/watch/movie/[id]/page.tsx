import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getMovieDetail } from "@/lib/tmdb/movies";
import { VidkingPlayer } from "@/components/player/VidkingPlayer";
import { WatchTracker } from "@/components/player/WatchTracker";
import { buildEmbedUrl } from "@/lib/vidking/buildEmbedUrl";

export const dynamic = "force-dynamic";

export default async function WatchMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let detail;
  try {
    detail = await getMovieDetail(id);
  } catch (err) {
    if (err instanceof Error && /TMDB 404/.test(err.message)) notFound();
    throw err;
  }

  const src = buildEmbedUrl({ type: "movie", id });
  const year = detail.release_date ? detail.release_date.slice(0, 4) : "";

  return (
    <main className="mx-auto max-w-screen-xl space-y-4 px-4 py-6 md:px-8">
      <Link
        href={`/movie/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-text"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke detail
      </Link>

      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
        {detail.title}
        {year ? (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({year})
          </span>
        ) : null}
      </h1>

      <VidkingPlayer src={src} title={`${detail.title} (${year})`} />

      <WatchTracker
        payload={{
          id: detail.id,
          type: "movie",
          title: detail.title,
          posterPath: detail.poster_path,
        }}
      />

      {detail.overview ? (
        <p className="max-w-3xl text-sm text-text/80">{detail.overview}</p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Sumber streaming dari pihak ketiga (vidking.net). Kalau player gagal
        memuat, coba refresh atau matikan adblock.
      </p>
    </main>
  );
}
