import Image from "next/image";
import Link from "next/link";
import type { TmdbEpisode } from "@/lib/tmdb/types";

const STILL_BASE = "https://image.tmdb.org/t/p/w300";

export interface EpisodeListProps {
  tvId: number;
  season: number;
  episodes: TmdbEpisode[];
}

export function EpisodeList({ tvId, season, episodes }: EpisodeListProps) {
  if (episodes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada episode untuk season ini.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {episodes.map((ep) => (
        <li key={ep.id}>
          <Link
            href={`/watch/tv/${tvId}/${season}/${ep.episode_number}`}
            className="flex gap-4 rounded-lg bg-surface p-3 ring-1 ring-border transition-colors hover:bg-elevated"
          >
            <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-elevated sm:w-40">
              {ep.still_path ? (
                <Image
                  src={STILL_BASE + ep.still_path}
                  alt={ep.name}
                  fill
                  sizes="(min-width: 640px) 160px, 128px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  E{ep.episode_number}
                </span>
                <h3 className="truncate text-sm font-semibold text-text">
                  {ep.name}
                </h3>
              </div>
              <p className="line-clamp-2 pt-1 text-xs text-muted-foreground">
                {ep.overview}
              </p>
              {ep.runtime ? (
                <p className="pt-1 text-[11px] text-muted-foreground">
                  {ep.runtime} menit
                </p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
