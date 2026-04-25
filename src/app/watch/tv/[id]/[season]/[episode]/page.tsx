import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTvDetail, getSeasonDetail } from "@/lib/tmdb/tv";
import { VidkingPlayer } from "@/components/player/VidkingPlayer";
import { buildEmbedUrl } from "@/lib/vidking/buildEmbedUrl";
import { EpisodeList } from "@/components/tv/EpisodeList";

export const dynamic = "force-dynamic";

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

  let detail, season;
  try {
    [detail, season] = await Promise.all([
      getTvDetail(id),
      getSeasonDetail(id, seasonNumber),
    ]);
  } catch (err) {
    if (err instanceof Error && /TMDB 404/.test(err.message)) notFound();
    throw err;
  }

  const episode = season.episodes.find(
    (ep) => ep.episode_number === episodeNumber,
  );
  if (!episode) notFound();

  const src = buildEmbedUrl({
    type: "tv",
    id,
    season: seasonNumber,
    episode: episodeNumber,
  });

  const idx = season.episodes.findIndex(
    (ep) => ep.episode_number === episodeNumber,
  );
  const prev = idx > 0 ? season.episodes[idx - 1] : null;
  const next =
    idx >= 0 && idx < season.episodes.length - 1
      ? season.episodes[idx + 1]
      : null;

  return (
    <main className="mx-auto max-w-screen-xl space-y-4 px-4 py-6 md:px-8">
      <Link
        href={`/tv/${id}?s=${seasonNumber}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-text"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke detail
      </Link>

      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {detail.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          S{seasonNumber} • E{episodeNumber} — {episode.name}
        </p>
      </div>

      <VidkingPlayer
        src={src}
        title={`${detail.name} S${seasonNumber}E${episodeNumber}`}
      />

      <div className="flex flex-wrap items-center gap-3">
        {prev ? (
          <Link
            href={`/watch/tv/${id}/${seasonNumber}/${prev.episode_number}`}
            className="inline-flex items-center gap-2 rounded-md bg-elevated px-4 py-2 text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-elevated/80"
          >
            <ChevronLeft className="h-4 w-4" />
            Episode Sebelumnya
          </Link>
        ) : null}
        {next ? (
          <Link
            href={`/watch/tv/${id}/${seasonNumber}/${next.episode_number}`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Episode Berikutnya
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      {episode.overview ? (
        <p className="max-w-3xl text-sm text-text/80">{episode.overview}</p>
      ) : null}

      <section className="space-y-3 pt-6">
        <h2 className="text-base font-semibold tracking-tight md:text-lg">
          Semua episode S{seasonNumber}
        </h2>
        <EpisodeList
          tvId={id}
          season={seasonNumber}
          episodes={season.episodes}
        />
      </section>

      <p className="text-xs text-muted-foreground">
        Sumber streaming dari pihak ketiga (vidking.net). Kalau player gagal
        memuat, coba refresh atau matikan adblock.
      </p>
    </main>
  );
}
