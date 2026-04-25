"use client";

import Link from "next/link";
import Image from "next/image";
import { useHistory } from "@/hooks/useHistory";
import { MediaRow } from "@/components/media/MediaRow";

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

function buildHref(item: {
  id: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
}): string {
  if (item.type === "tv" && item.season != null && item.episode != null) {
    return `/watch/tv/${item.id}/${item.season}/${item.episode}`;
  }
  return `/watch/movie/${item.id}`;
}

export function ContinueWatchingRow() {
  const { list } = useHistory();
  const recent = list.slice(0, 12);
  if (recent.length === 0) return null;

  return (
    <MediaRow title="Lanjutkan Menonton">
      {recent.map((item) => (
        <Link
          key={`${item.type}:${item.id}:${item.season ?? ""}:${item.episode ?? ""}`}
          href={buildHref(item)}
          className="group block w-[160px] shrink-0 md:w-[200px]"
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border transition-transform group-hover:scale-[1.03]">
            {item.posterPath ? (
              <Image
                src={POSTER_BASE + item.posterPath}
                alt={item.title}
                fill
                sizes="(min-width: 768px) 200px, 160px"
                className="object-cover"
              />
            ) : null}
          </div>
          <p className="mt-2 truncate text-sm font-medium text-text">
            {item.title}
          </p>
          {item.season != null && item.episode != null ? (
            <p className="text-xs text-muted-foreground">
              S{item.season} • E{item.episode}
            </p>
          ) : null}
        </Link>
      ))}
    </MediaRow>
  );
}
