"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmbedPlayer } from "@/components/player/EmbedPlayer";
import { WatchTracker } from "@/components/player/WatchTracker";
import { DubToggle } from "@/components/anime/DubToggle";
import { ProviderToggle } from "@/components/anime/ProviderToggle";
import { AnimeEpisodeList } from "@/components/anime/AnimeEpisodeList";
import { AnimeCharacterList } from "@/components/anime/AnimeCharacterList";
import { AnimeRelations } from "@/components/anime/AnimeRelations";
import {
  buildEmbedUrl,
  type EmbedProvider,
} from "@/lib/embed/buildEmbedUrl";
import type { AnilistMediaDetail } from "@/lib/anilist/types";

export default function WatchAnimePage({
  params,
}: {
  params: Promise<{ id: string; episode: string }>;
}) {
  const { id: idParam, episode: epParam } = use(params);
  const id = Number(idParam);
  const episode = Number(epParam);
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(episode) || episode <= 0) {
    notFound();
  }

  const [anime, setAnime] = useState<AnilistMediaDetail | null>(null);
  const [error, setError] = useState(false);
  const [dub, setDub] = useState(false);
  const [provider, setProvider] = useState<EmbedProvider>("videasy");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/anime/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: AnilistMediaDetail) => {
        if (!cancelled) setAnime(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) notFound();

  const title = anime?.title.userPreferred ?? anime?.title.romaji ?? "Anime";
  const totalEpisodes =
    anime?.episodes && anime.episodes > 0
      ? anime.episodes
      : anime?.format === "MOVIE"
        ? 1
        : 0;
  const isMovie = anime?.format === "MOVIE";

  const malId = anime?.idMal ?? null;
  const hasMalId = malId != null;
  const effectiveProvider =
    provider === "vidlink" && !hasMalId ? "videasy" : provider;
  const src = buildEmbedUrl({
    type: "anime",
    anilistId: id,
    malId,
    episode,
    dub,
    provider: effectiveProvider,
  });

  const prev = episode > 1 ? `/watch/anime/${id}/${episode - 1}` : null;
  const next =
    !isMovie && totalEpisodes > 0 && episode < totalEpisodes
      ? `/watch/anime/${id}/${episode + 1}`
      : null;

  return (
    <main className="min-h-dvh space-y-8 pb-12">
      <section className="mx-auto max-w-screen-2xl px-4 pt-4 md:px-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="line-clamp-1 text-base font-semibold tracking-tight text-text md:text-lg">
            {title}
            {!isMovie ? ` — Episode ${episode}` : ""}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <ProviderToggle onChange={setProvider} hasMalId={hasMalId} />
            <DubToggle onChange={setDub} />
          </div>
        </div>
      </section>

      <EmbedPlayer
        src={src}
        title={`${title}${!isMovie ? ` E${episode}` : ""}`}
      />

      {anime ? (
        <WatchTracker
          payload={{
            type: "anime",
            anilistId: anime.id,
            title,
            coverUrl: anime.coverImage.large,
            episode,
            format: anime.format ?? "TV",
          }}
        />
      ) : null}

      <section className="mx-auto max-w-screen-xl space-y-2 px-4 md:px-8">
        <div className="flex items-center justify-between gap-3">
          {prev ? (
            <Link
              href={prev}
              className="inline-flex items-center gap-1 rounded-md bg-elevated px-3 py-1.5 text-sm font-medium text-text ring-1 ring-border hover:bg-elevated/80"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next}
              className="inline-flex items-center gap-1 rounded-md bg-elevated px-3 py-1.5 text-sm font-medium text-text ring-1 ring-border hover:bg-elevated/80"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </section>

      {!isMovie && totalEpisodes > 0 ? (
        <section className="mx-auto max-w-screen-xl px-4 md:px-8">
          <AnimeEpisodeList
            animeId={id}
            totalEpisodes={totalEpisodes}
            currentEpisode={episode}
          />
        </section>
      ) : null}

      {anime ? (
        <section className="mx-auto max-w-screen-xl px-4 md:px-8">
          <AnimeCharacterList edges={anime.characters.edges} />
        </section>
      ) : null}

      {anime ? <AnimeRelations edges={anime.relations.edges} /> : null}

      <p className="mx-auto max-w-screen-xl px-4 pt-6 text-xs text-muted-foreground md:px-8">
        Streaming source from a third party. If the player fails to load, try
        switching the provider above, refreshing, or disabling your adblocker.
      </p>
    </main>
  );
}
